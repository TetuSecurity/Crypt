import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent,
    HomeComponent,
    BrowserComponent,
    ConfirmationComponent,
    MainHeaderComponent,
    LoadingSpinnerComponent,
    LoginComponent
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
        {path: '', component: HomeComponent},
        {path: 'login', component: LoginComponent},
        {path: 'confirm/:confirmKey/:confirmHash', component: ConfirmationComponent}
      ]
    )
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    BrowserComponent,
    ConfirmationComponent,
    MainHeaderComponent,
    LoadingSpinnerComponent,
    LoginComponent
  ],
  providers: [FilesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
