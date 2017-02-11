import {Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'confirm-email',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class ConfirmationComponent implements OnInit {

    private _confirmationKey: string;
    private _confirmationHash: string;

    constructor(
        private _route: ActivatedRoute
    ) {}

    ngOnInit() {
        this._confirmationKey = this._route.snapshot.params['confirmKey'];
        this._confirmationHash = this._route.snapshot.params['confirmHash'];

    }
}
