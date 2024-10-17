import { Routes } from '@angular/router';
import { SimulacionesComponent } from './simulaciones.component';
import { CrearSimulacionComponent } from './crear_simulacion/crear_simulacion.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: SimulacionesComponent },
            { path: 'crear', component: CrearSimulacionComponent },
        ]
    }
] as Routes;
