import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { File, Directory, BrowserComponent } from './browser.component';

@Component({
    selector: 'crypt-app',
    templateUrl: 'templates/app.component.html',
    directives: [BrowserComponent],
    providers: [HTTP_PROVIDERS]
})
export class AppComponent {
  Title: string =  'Crypt';

}
