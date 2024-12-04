import { Component, ViewEncapsulation, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
        CommonModule,
        MatMenuModule,
        MatTooltipModule,
        FormsModule
    ],
})
export class LandingHomeComponent {
    isActive: boolean = true;
    users: any[] = []; // Lista completa de usuarios
    filteredUsers: any[] = []; // Lista filtrada
    searchTerm: string = ''; // Término de búsqueda

    constructor(private _authService: AuthService, private _router: Router) {}

    ngOnInit(): void {
        this._authService.getAllUsers().subscribe(
            (response) => {
                this.users = response; // Cargar usuarios
                this.filteredUsers = [...this.users]; // Inicializar usuarios filtrados
            },
            (error) => {
                console.error('Error al obtener los usuarios', error);
            }
        );
    }

    deleteUser(id: number): void {
        this._authService.deleteUser(id).subscribe(
            (response) => {
                console.log(`Usuario ${id} eliminado`);
                this.users = this.users.filter((user) => user.id !== id); // Actualizar usuarios
                this.filterUsers(); // Volver a filtrar la lista
            },
            (error) => {
                console.error('Error al eliminar el usuario', error);
            }
        );
    }

    openEditUser(userId: number): void {
        this._router.navigate([`gestion_usuarios/editar/${userId}`]);
    }

    // Método para filtrar usuarios
    filterUsers(): void {
        const term = this.searchTerm.toLowerCase(); // Convertir el término a minúsculas
        this.filteredUsers = this.users.filter((user) =>
            user.username.toLowerCase().includes(term) || // Filtrar por nombre de usuario
            user.id.toString().includes(term) || // Filtrar por ID
            (user.rol === 1 ? 'Administrador' : 'Básico').toLowerCase().includes(term) || // Filtrar por rol
            (user.estado === 1 ? 'Activo' : 'Inactivo').toLowerCase().includes(term) // Filtrar por estado
        );
    }
}
