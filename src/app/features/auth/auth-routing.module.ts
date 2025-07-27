import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 🔧 FIXED: Removed standalone component imports - using module-declared components
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./auth.module').then(m => m.AuthModule)
  },
  {
    path: 'register', 
    loadChildren: () => import('./auth.module').then(m => m.AuthModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }