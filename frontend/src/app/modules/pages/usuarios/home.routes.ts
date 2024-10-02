import { Routes } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/pages/usuarios/home.component';
import { ExampleComponent } from '../example/example.component';
import { CrearUsuarioComponent } from './crear_usuario/crear_usuario.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: LandingHomeComponent },
            { path: 'example', component: ExampleComponent },
            { path: 'crear', component: CrearUsuarioComponent },
        ]
    }
] as Routes;

