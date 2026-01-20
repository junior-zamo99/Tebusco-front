import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [


  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
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
    path: 'auth-required',
    loadComponent: () => import('./components/auth-require/auth-require').then(m => m.AuthRequire)
  },

  {
    path: '',
    component: MainLayout,
    children: [

      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'professionals',
        children: [
          {
            path: ':id',
            loadComponent: () => import('./components/professional-detail/professional-detail').then(m => m.ProfessionalDetailComponent)
          },
          {
            path: 'category/:id',
            loadComponent: () => import('./components/professionals-by-category/professionals-by-category').then(m => m.ProfessionalsByCategory)
          },
          {
            path: 'specialty/:id',
            loadComponent: () => import('./components/professionals-by-specialty/professionals-by-specialty').then(m => m.ProfessionalsBySpecialty)
          },
        ]
      },

      // Rutas Protegidas de PROFESSIONAL
      {
        path: 'professional',
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/professional-home/professional-home').then(m => m.ProfessionalHome),
          },
          {
            path: 'upgrade',
            loadComponent: () => import('./pages/professional/professional-upgrade/professional-upgrade').then(m => m.ProfessionalUpgrade)
          },
          {
            path: 'documents',
            loadComponent: () => import('./pages/professional/documents/professional-documents.component').then(m => m.ProfessionalDocumentsComponent)
          },
          {
            path: 'plans',
            loadComponent: () => import('./pages/professional/plans/professional-plans.component').then(m => m.ProfessionalPlansComponent)
          },
          {
            path: 'payment',
            loadComponent: () => import('./pages/professional/payment/professional-payment.component').then(m => m.ProfessionalPaymentComponent)
          },
          {
            path: 'categories',
            loadComponent: () => import('./pages/professional/categories/professional-categories.component').then(m => m.ProfessionalCategoriesComponent)
          },
          {
            path: 'complete',
            loadComponent: () => import('./pages/professional/complete/professional-complete.component').then(m => m.ProfessionalCompleteComponent)
          },
          {
            path: 'payment-success',
            loadComponent: () => import('./pages/professional/payment-success/professional-payment-success.component').then(m => m.ProfessionalPaymentSuccessComponent)
          },
          {
            path: 'category-success',
            loadComponent: () => import('./pages/professional/category-success/professional-category-success.component').then(m => m.ProfessionalCategorySuccessComponent)
          }
        ]
      },

      // Rutas Protegidas de APPLICANT
      {
        path: 'applicant',
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/applicant-home/applicant-home').then(m => m.ApplicantHome),
          },
          {
            path: 'requests',
            loadComponent: () => import('./pages/request/request-applicant/request-applicant').then(m => m.RequestApplicant)
          },
          {
            path: 'request/create',
            loadComponent: () => import('./pages/request/request-create/request-create').then(m => m.RequestCreate)
          },
          {
            path: 'request/:id',
            loadComponent: () => import('./pages/request/request-view/request-view').then(m => m.RequestView)
          },
        ]
      },

      // Rutas Protegidas GENERALES (Perfil, etc)
      // Nota: Eliminé el path padre '' repetido y las puse directas bajo MainLayout para evitar conflictos
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
        path: 'category-detail/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/category-detail/category-detail.component').then(m => m.CategoryDetailComponent)
      },
      {
        path: 'configure-category',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/configure-category/configure-category.component').then(m => m.ConfigureCategoryComponent)
      },
      {
        path: 'extras',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/extras/extras.component').then(m => m.ExtrasComponent)
            },
            {
                path: 'purchase/:id',
                loadComponent: () => import('./pages/extras/purchase/purchase.component').then(m => m.ExtrasPurchaseComponent)
            }
        ]
      }
    ]
  },

  // ==============================================
  // 3. WILDCARD (404)
  // ==============================================
  {
    path: '**',
    redirectTo: '' // O redirigir a login
  }
];
