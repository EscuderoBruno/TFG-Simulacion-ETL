import { Routes } from '@angular/router';
import { ConexionesComponent } from './conexiones.component';
import { CrearConexionComponent } from './crear_conexion/crear_conexion.component';
import { EditarConexionComponent } from './editar_conexion/editar_conexion.component';

export default [
    {
        path: '',
        children: [
            { path: '', component: ConexionesComponent },
            { path: 'crear', component: CrearConexionComponent },
            { path: 'editar/:id', component: EditarConexionComponent }
        ]
    }
] as Routes;
