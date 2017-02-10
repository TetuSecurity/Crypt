import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {SharedModule} from './shared.module';
import {BrowserComponent, HomeComponent} from '../components';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', component: HomeComponent},
            ]
        )
    ],
    declarations: [
        HomeComponent,
        BrowserComponent
    ],
    exports: [
        HomeComponent,
        BrowserComponent
    ]
})
export class LazyHomeModule { }
