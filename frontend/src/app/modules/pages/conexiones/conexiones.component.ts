import { Component, ViewEncapsulation, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConexionesService } from './conexiones.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'connections',
    standalone: true,
    templateUrl: './conexiones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, RouterModule, FormsModule],
})
export class ConexionesComponent {
    isActive: boolean = true;
    connections: any[] = []; // Lista completa de conexiones
    filteredConnections: any[] = []; // Lista filtrada
    users: any[] = [];
    searchText: string = ''; // Texto del buscador
    showModal: boolean = false; // Controla la visibilidad del modal
    connectionIdToDelete: number | null = null; // ID del usuario a eliminar

    constructor(
        private _conexionesService: ConexionesService,
        private _authService: AuthService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this._conexionesService.getAllConnections().subscribe(
            (response) => {
                this.connections = response;
                this.filteredConnections = response; // Inicializar lista filtrada
            },
            (error) => {
                console.error('Error al obtener las conexiones', error);
            }
        );

        this._authService.getAllUsers().subscribe(
            (response) => {
                this.users = response;
            },
            (error) => {
                console.error('Error al obtener los usuarios', error);
            }
        );
    }

    confirmDelete(userId: number): void {
        event.stopPropagation(); // Detiene la propagación del clic
        this.connectionIdToDelete = userId; // Almacena el ID del usuario
        this.showModal = true; // Muestra el modal
    }

    deleteConnection(): void {
        this._conexionesService.deleteConnection(this.connectionIdToDelete).subscribe(
            () => {
                console.log(`Conexión ${this.connectionIdToDelete} eliminada con éxito`);
                this.connections = this.connections.filter(conn => conn.id !== this.connectionIdToDelete);
                this.filterConnections(); // Actualizar filtro después de eliminar
                this.showModal = false; // Cierra el modal
                this.connectionIdToDelete = null; // Resetea el ID
            },
            (error) => {
                console.error('Error al eliminar la conexión', error);
                this.showModal = false;
                this.connectionIdToDelete = null;
            }
        );
    }

    cancelDelete(): void {
        this.showModal = false; // Cierra el modal
        this.connectionIdToDelete = null; // Resetea el ID
    }

    openEditConnection(connectionId: number): void {
        this._router.navigate([`conexiones/editar/${connectionId}`]);
    }

    truncateOptions(options: any): string {
        const optionsJson = JSON.stringify(options);
        const maxLength = 60;
        return optionsJson.length > maxLength ? optionsJson.slice(0, maxLength) + '...' : optionsJson;
    }

    getUserName(userId: number): string {
        const user = this.users.find(us => us.id === userId);
        return user ? user.username : 'Usuario no encontrado';
    }

    filterConnections(): void {
        const searchLower = this.searchText.toLowerCase();
        this.filteredConnections = this.connections.filter(connection =>
            connection.name.toLowerCase().includes(searchLower) || // Filtrar por nombre
            this.getUserName(connection.userId).toLowerCase().includes(searchLower) // Filtrar por usuario
        );
    }
}
