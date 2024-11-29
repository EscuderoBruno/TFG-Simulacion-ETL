import { Routes } from '@angular/router';
import { SensoresComponent } from './sensores.component';
import { CrearSensorComponent } from './crear_sensor/crear_sensor.component';
import { EditarSensorComponent } from './editar_sensor/editar_sensor.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: SensoresComponent },
            { path: 'crear', component: CrearSensorComponent },
            { path: 'editar/:id', component: EditarSensorComponent }
        ]
    }
] as Routes;
