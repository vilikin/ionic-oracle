import { Component } from '@angular/core';

import { NavController, ToastController } from 'ionic-angular';

import { SpeechRecognition } from 'ionic-native';

import { TextToSpeech } from 'ionic-native';

import { Bot } from "../../providers/bot";

enum Error {
  NO_PERMISSIONS,
  NO_SPEECH,
  SHORT_QUESTION
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  question: string = "";

  constructor(public navCtrl: NavController, private toastCtrl: ToastController, private bot: Bot) {

  }

  public askWithSpeech() {
    SpeechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (hasPermission) {
          SpeechRecognition.startListening({
            language: "fi-FI"
          }).subscribe(
            (matches: Array<string>) => {
              this.question = matches[0];
              this.askBot(matches[0]);
            },
            (err) => this.displayError(Error.NO_SPEECH, false)
          );
        } else {
          SpeechRecognition.requestPermission()
            .then(
              () => this.askWithSpeech(),
              () => this.displayError(Error.NO_PERMISSIONS, false)
            )
        }
      });
  }

  private askBot(question: string) {
    if (question.length > 3) {
      this.bot.getAnswer(question).subscribe(res => {
        let toast = this.toastCtrl.create({
          message: res
        });

        toast.present();

        TextToSpeech.speak({text: res, locale: "fi-FI"})
          .then(() => {
            setTimeout(() => {
              toast.dismiss();
              this.question = "";
            }, 1500);
          })
          .catch((reason: any) => console.log(reason));
      });
    } else {
      this.displayError(Error.SHORT_QUESTION, true);
    }
  }

  private displayError(err: Error, cleanQuestion) {
    let msg: string = "";
    switch (err) {
      case Error.NO_PERMISSIONS:
        msg = "Jaha. Et saa kuulemma puhua minulle. No kokeile kirjoittamista.";
        break;
      case Error.NO_SPEECH:
        msg = "Sori, mutta olen vähän hidasälyinen. Odota, että tajuan itse, että olet lopettanut minulle puhumisen.";
        break;
      case Error.SHORT_QUESTION:
        let possibleAnswers = [
          "Oliko tuo muka sun mielestä kysymys?",
          "Yleensä kysymykset on hieman pidempiä.",
          "Tarkoitus olisi, että kysyisit jotakin.",
          "Tuossa yläpuolella on kenttä, johon voi kirjoittaa jotakin."
        ];

        msg = possibleAnswers[Math.floor(Math.random()*possibleAnswers.length)];

        break;
    }

    let toast = this.toastCtrl.create({
      message: msg
    });

    toast.dismissAll();

    toast.present();

    TextToSpeech.speak({text: msg, locale: "fi-FI"})
      .then(() => {
        setTimeout(() => {
          if (cleanQuestion) {
            this.question = "";
          }

          toast.dismissAll();
        }, 1500);
      })
      .catch((reason: any) => console.log(reason));
  }
}
