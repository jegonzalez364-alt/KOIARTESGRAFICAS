import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'contacto', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'registro', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
    { path: 'cotizador', loadComponent: () => import('./pages/cotizador/cotizador.component').then(m => m.CotizadorComponent) },
    {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'galeria', pathMatch: 'full' },
            { path: 'galeria', loadComponent: () => import('./pages/admin/gallery-manager/gallery-manager.component').then(m => m.GalleryManagerComponent) },
            { path: 'cards', loadComponent: () => import('./pages/admin/cards-manager/cards-manager.component').then(m => m.CardsManagerComponent) },
            { path: 'solicitudes', loadComponent: () => import('./pages/admin/requests-manager/requests-manager.component').then(m => m.RequestsManagerComponent) },
            { path: 'usuarios', loadComponent: () => import('./pages/admin/users-manager/users-manager.component').then(m => m.UsersManagerComponent) },
            { path: 'cotizador-settings', loadComponent: () => import('./pages/admin/cotizador-settings/cotizador-settings.component').then(m => m.CotizadorSettingsComponent) },
            { path: 'cuenta', loadComponent: () => import('./pages/admin/account-settings/account-settings.component').then(m => m.AccountSettingsComponent) },
        ]
    },
    { path: '**', redirectTo: '' }
];
