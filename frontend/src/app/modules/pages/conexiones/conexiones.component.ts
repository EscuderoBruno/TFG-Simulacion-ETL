import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { ConexionesService } from './conexiones.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
    selector     : 'connections',
    standalone   : true,
    templateUrl  : './conexiones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, RouterModule],
})
export class ConexionesComponent {
    isActive: boolean = true;
    connections: any[] = []; // Lista de conexiones

    constructor(
        private _conexionesService: ConexionesService, // Servicio de conexiones
        private _authService: AuthService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this._conexionesService.getAllConnections().subscribe(
            (response) => {
                this.connections = response; // Guardar la lista de conexiones
                console.log(this.connections);
            },
            (error) => {
                console.error('Error al obtener las conexiones', error);
            }
        );
    }

    deleteConnection(id: number): void {
        this._conexionesService.deleteConnection(id).subscribe(
            (response) => {
                console.log(`Conexión ${id} eliminada con éxito`);
                this.connections = this.connections.filter(conn => conn.id !== id); // Actualizar la lista localmente
            },
            (error) => {
                console.error('Error al eliminar la conexión', error);
            }
        );
    }

    openEditConnection(connectionId: number): void {
        this._router.navigate([`conexiones/editar/${connectionId}`]); // Navegar a la página de edición
    }

    // Método para truncar el JSON y agregar "..." si es necesario
    truncateOptions(options: any): string {
        const optionsJson = JSON.stringify(options);
        const maxLength = 60;  // Ajusta la longitud según lo que necesites

        if (optionsJson.length > maxLength) {
        return optionsJson.slice(0, maxLength) + '...';
        }

        return optionsJson;
    }
}
