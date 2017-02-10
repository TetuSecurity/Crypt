import { Component } from '@angular/core';

@Component({
    selector: 'login',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class LoginComponent {
    processing: boolean = false;
    constructor() { }

    submitForm() {
        this.processing = true;
        // setTimeout(() => this.processing = false, 5000);
    }
}
