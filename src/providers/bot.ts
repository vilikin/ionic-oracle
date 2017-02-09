import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Bot provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Bot {

  constructor(public http: Http) {

  }

  getAnswer(question: string) {
    return this.http.get("http://www.lintukoto.net/viihde/oraakkeli/index.php?kysymys=" +
      encodeURIComponent(question) + "&html").map(res => res.text());
  }
}
