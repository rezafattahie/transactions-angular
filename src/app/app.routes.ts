import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'transactions' },

    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.page/login.page').then((m) => m.LoginPage),
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup.page/signup.page').then((m) => m.SignupPage),
    },

    {
        path: 'transactions',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/transactions/pages/transactions.page').then((m) => m.TransactionsPage),
    },

    { path: '**', redirectTo: 'transactions' },
];
