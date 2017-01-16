// import common libs to force them in to the common file
import 'jquery';
import 'tether';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from '../components/app/component';
import { DemoComponent } from '../components/demo/component';
import { MainHeaderComponent } from '../components/header/main/component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(
      [
        { path: '', component: DemoComponent }
      ]
    )
  ],
  declarations: [
    AppComponent,
    DemoComponent,
    MainHeaderComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
