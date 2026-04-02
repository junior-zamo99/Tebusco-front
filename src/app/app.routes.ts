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
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'auth-required',
    loadComponent: () => import('./components/auth-require/auth-require').then(m => m.AuthRequire)
  },
  {
    path: 'professional/upgrade',
    loadComponent: () => import('./pages/professional/professional-upgrade/professional-upgrade').then(m => m.ProfessionalUpgrade)
  },
          {
            path: 'professional/documents',
            loadComponent: () => import('./pages/professional/documents/professional-documents.component').then(m => m.ProfessionalDocumentsComponent)
          },
          {
            path: 'professional/plans',
            loadComponent: () => import('./pages/professional/plans/professional-plans.component').then(m => m.ProfessionalPlansComponent)
          },
          {
            path: 'professional/payment',
            loadComponent: () => import('./pages/professional/payment/professional-payment.component').then(m => m.ProfessionalPaymentComponent)
          },
          {
            path: 'professional/categories',
            loadComponent: () => import('./pages/professional/categories/professional-categories.component').then(m => m.ProfessionalCategoriesComponent)
          },
          {
            path: 'professional/complete',
            loadComponent: () => import('./pages/professional/complete/professional-complete.component').then(m => m.ProfessionalCompleteComponent)
          },
          {
            path: 'professional/payment-success',
            loadComponent: () => import('./pages/professional/payment-success/professional-payment-success.component').then(m => m.ProfessionalPaymentSuccessComponent)
          },
          {
            path: 'professional/category-success',
            loadComponent: () => import('./pages/professional/category-success/professional-category-success.component').then(m => m.ProfessionalCategorySuccessComponent)
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


      {
        path: 'professional',
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/professional-home/professional-home').then(m => m.ProfessionalHome),
          },
          {
            path: 'requests',
            loadComponent: () => import('./pages/request/request-professional/request-professional').then(m => m.RequestProfessional)
          },
          {
            path: 'request/:id',
            loadComponent: () => import('./pages/request/request-professional-detail/request-professional-detail').then(m => m.RequestProfessionalDetail)
          },
          {
            path: 'offers',
            loadComponent: () => import('./pages/offers/my-offers/my-offers.component').then(m => m.MyOffersComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./layouts/profile-professional-layout/profile-professional-layout').then(m => m.ProfileProfessionalLayout),
            children: [
              { path: '', redirectTo: 'info', pathMatch: 'full' },
              {
                path: 'info',
                loadComponent: () => import('./pages/professional-profile/info/profile-info.page').then(m => m.ProfileInfoPage)
              },
              {
                path: 'categories',
                loadComponent: () => import('./pages/professional-profile/categories/profile-categories.page').then(m => m.ProfileCategoriesPage)
              },
              {
                path: 'stats',
                loadComponent: () => import('./pages/professional-profile/stats/profile-stats.page').then(m => m.ProfileStatsPage)
              },
              {
                path: 'subscription',
                loadComponent: () => import('./pages/professional-profile/subscription/profile-subscription.page').then(m => m.ProfileSubscriptionPage)
              },
              {
                path: 'documents',
                loadComponent: () => import('./pages/professional-profile/documents/profile-documents.page').then(m => m.ProfileDocumentsPage)
              },
            ]
          },
          /*{
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
            */
        ]
      },


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
          {
            path: 'request/:id/edit',
            loadComponent: () => import('./pages/request/request-edit/request-edit').then(m => m.RequestEdit)
          },
          {
            path: 'request/:id/candidates',
            loadComponent: () => import('./pages/offers/candidates/candidates.component').then(m => m.CandidatesComponent)
          },
          {
            path: 'search/result',
            loadComponent: () => import('./pages/search-results-page/search-results-page').then(m => m.SearchResultsPage)
          },
        ]
      },


      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'edit-profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
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
            },
            {
                path: 'select-cities/:id',
                loadComponent: () => import('./pages/extras/select-cities/select-cities.component').then(m => m.SelectCitiesComponent)
            },
            {
                path: 'select-national/:id',
                loadComponent: () => import('./pages/extras/select-national/select-national.component').then(m => m.SelectNationalComponent)
            },
            {
                path: 'coverage',
                loadComponent: () => import('./pages/extras/city-coverage/city-coverage.component').then(m => m.CityCoverageComponent)
            }
        ]
      }
    ]
  },


  {
    path: '**',
    redirectTo: '' // O redirigir a login
  }
];
