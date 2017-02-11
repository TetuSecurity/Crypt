import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import {RouterModule} from '@angular/router';

import {
    MainHeaderComponent,
    LoadingSpinnerComponent,
} from '../components/';

@NgModule({
    imports: [
        HttpModule,
        FormsModule,
        CommonModule,
        RouterModule
    ],
    declarations: [
        MainHeaderComponent,
        LoadingSpinnerComponent,
    ],
    exports: [
        HttpModule,
        FormsModule,
        CommonModule,
        RouterModule,
        MainHeaderComponent,
        LoadingSpinnerComponent,
    ]
})
export class SharedModule { }
