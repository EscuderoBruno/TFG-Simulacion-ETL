import { Routes } from '@angular/router';
import { SimulacionesComponent } from './simulaciones.component';
import { CrearSimulacionComponent } from './crear_simulacion/crear_simulacion.component';
import { EditarSimulacionComponent } from './editar_simulacion/editar_simulacion.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: SimulacionesComponent },
            { path: 'crear', component: CrearSimulacionComponent },
            { path: ':id', component: EditarSimulacionComponent }
        ]
    }
] as Routes;
