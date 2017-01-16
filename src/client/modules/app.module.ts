// import common libs to force them in to the common file
import 'jquery';
import 'tether';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent,
    HomeComponent,
    MainHeaderComponent,
    BrowserComponent
} from '../components/';
import {
    FilesService
} from '../services';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(
      [
        { path: '', component: HomeComponent }
      ]
    )
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    MainHeaderComponent,
    BrowserComponent
  ],
  providers: [FilesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
