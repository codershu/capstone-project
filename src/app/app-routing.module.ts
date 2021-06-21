import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataCleanNewComponent } from './views/data-clean-new/data-clean-new.component';
import { DataCleanComponent } from './views/data-clean/data-clean.component';
import { DescriptionComponent } from './views/description/description.component';

const routes: Routes = [
  { path: 'home', component: DescriptionComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'data-clean', component: DataCleanComponent },
  { path: 'data-clean-new', component: DataCleanNewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
