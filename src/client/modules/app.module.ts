import {HttpModule} from '@angular/http';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from '../components';
import {
    FilesService
} from '../services';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        RouterModule.forRoot(
            [
                { path: '', loadChildren: './+home.module.ts#LazyHomeModule' },
                { path: 'auth', loadChildren: './+auth.module.ts#LazyAuthModule' },
            ]
        )
    ],
    declarations: [
        AppComponent,
    ],
    providers: [
        FilesService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
