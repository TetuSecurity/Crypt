import { Component } from '@angular/core';
import { File, Directory, BrowserComponent } from './browser.component';

@Component({
    selector: 'crypt-app',
    templateUrl: 'templates/app.component.html',
    directives: [BrowserComponent]
})
export class AppComponent {
  Title: string =  'Crypt';

}
