import { Routes } from '@angular/router';
import { LocalizacionesComponent } from './localizaciones.component';
import { CrearLocalizacionComponent } from './crear_localizacion/crear_localizacion.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: LocalizacionesComponent },
            { path: 'crear', component: CrearLocalizacionComponent },
        ]
    }
] as Routes;
