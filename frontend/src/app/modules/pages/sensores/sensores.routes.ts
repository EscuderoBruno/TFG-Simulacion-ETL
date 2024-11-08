import { Routes } from '@angular/router';
import { SensoresComponent } from './sensores.component';
import { CrearSensorComponent } from './crear_sensor/crear_sensor.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: SensoresComponent },
            { path: 'crear', component: CrearSensorComponent },
        ]
    }
] as Routes;
