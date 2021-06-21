import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataCleanComponent } from './views/data-clean/data-clean.component';
import { HttpClientModule } from '@angular/common/http';
import { DescriptionComponent } from './views/description/description.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataCleanNewComponent } from './views/data-clean-new/data-clean-new.component';

@NgModule({
  declarations: [
    AppComponent,
    DataCleanComponent,
    DescriptionComponent,
    DataCleanNewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ClarityModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
