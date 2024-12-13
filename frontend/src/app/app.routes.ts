import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { LayoutComponent } from 'app/layout/layout.component';
import { AdminGuard } from './core/auth/admin.guard';
import { AuthGuard } from './core/auth/auth.guards';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'simulaciones'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'simulaciones'},

    // Auth routes for guests
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
        ]
    },

    // Auth routes
    {
        path: '',
        canActivate: [AuthGuard], // AuthGuard
        //canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'gestion_usuarios', loadChildren: () => import('app/modules/pages/usuarios/home.routes'), canActivate: [AdminGuard]}, // AdminGuard
            {path: 'example', loadChildren: () => import('app/modules/pages/example/example.routes')},
            {path: 'sensores', loadChildren: () => import('app/modules/pages/sensores/sensores.routes')},
            {path: 'simulaciones', loadChildren: () => import('app/modules/pages/simulaciones/simulaciones.routes')},
            {path: 'conexiones', loadChildren: () => import('app/modules/pages/conexiones/conexiones.routes')},
        ]
    }
];
