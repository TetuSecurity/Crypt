import { Component } from '@angular/core';

@Component({
    selector: 'login',
    template: require('./template.html'),
    styles: [require('./styles.scss')]
})
export class LoginComponent {
    processing: boolean = false;
    constructor() { }

    submitForm() {
        this.processing = true;
        // setTimeout(() => this.processing = false, 5000);
    }
}
