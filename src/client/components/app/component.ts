import { Component } from '@angular/core';

@Component({
    selector: 'app',
    template: require('./template.html'),
    styles: [require('./styles.scss')]
})
export class AppComponent {
    constructor() { }
}
