import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {
    LoginComponent,
    ConfirmationComponent
} from '../components/';
import { SharedModule } from './shared.module';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: 'login', component: LoginComponent},
                {path: 'confirm/:confirmKey/:confirmHash', component: ConfirmationComponent}
            ]
        )
    ],
    declarations: [
        LoginComponent,
        ConfirmationComponent
    ],
    exports: [
        LoginComponent,
        ConfirmationComponent
    ]
})
export class LazyAuthModule { }
