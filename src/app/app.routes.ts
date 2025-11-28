import { Routes, CanActivate } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
   {
    path: 'auth-required',
    loadComponent: () =>
      import('./components/auth-require/auth-require')
        .then(m => m.AuthRequire)
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'applicant/dashboard',
    loadComponent: () => import('./pages/applicant-home/applicant-home').then(m => m.ApplicantHome),
    canActivate: [authGuard]
  },

  {
    path: 'professional/dashboard',
    loadComponent: () => import('./pages/professional-home/professional-home').then(m => m.ProfessionalHome),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'category-detail/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/category-detail/category-detail.component').then(m => m.CategoryDetailComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'profile-professional-personal',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-professional-personal/profile-professional-personal').then(m => m.ProfileProfessionalPersonal)
  },
  {
    path: 'edit-professional-profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/edit-profile-profesional/edit-profile-profesional.component').then(m => m.EditProfileProfesionalComponent)
  },
  {
    path: 'professional/upgrade',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/professional-upgrade/professional-upgrade').then(m => m.ProfessionalUpgrade)
  },
  {
    path: 'professional/documents',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/documents/professional-documents.component').then(m => m.ProfessionalDocumentsComponent)
  },
  {
    path: 'professional/plans',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/plans/professional-plans.component').then(m => m.ProfessionalPlansComponent)
  },
  {
    path: 'professional/payment',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/payment/professional-payment.component').then(m => m.ProfessionalPaymentComponent)
  },
  {
    path: 'professional/categories',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/categories/professional-categories.component').then(m => m.ProfessionalCategoriesComponent)
  },
  {
    path: 'professional/complete',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/professional/complete/professional-complete.component').then(m => m.ProfessionalCompleteComponent)
  },
  {
     path: 'professionals/:id',
      loadComponent: () => import('./components/professional-detail/professional-detail').then(m => m.ProfessionalDetailComponent)
  },
  {
    path: 'professionals/category/:id',
    loadComponent: () => import('./components/professionals-by-category/professionals-by-category').then(m => m.ProfessionalsByCategory)
  },
  {
     path: 'professionals/specialty/:id',
loadComponent: () => import('./components/professionals-by-specialty/professionals-by-specialty').then(m => m.ProfessionalsBySpecialty)  },

];
