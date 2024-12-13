import { Component, ViewEncapsulation, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

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
    users: any[] = [];
    filteredUsers: any[] = [];
    searchTerm: string = '';
    showModal: boolean = false; // Controla la visibilidad del modal
    userIdToDelete: number | null = null; // ID del usuario a eliminar

    constructor(private _authService: AuthService, private _router: Router) {}

    ngOnInit(): void {
        this._authService.getAllUsers().subscribe(
            (response) => {
                this.users = response;
                this.filteredUsers = [...this.users];
            },
            (error) => {
                console.error('Error al obtener los usuarios', error);
            }
        );
    }

    confirmDelete(userId: number): void {
        event.stopPropagation(); // Detiene la propagación del clic
        this.userIdToDelete = userId; // Almacena el ID del usuario
        this.showModal = true; // Muestra el modal
    }

    deleteUser(): void {
        if (this.userIdToDelete !== null) {
            this._authService.deleteUser(this.userIdToDelete).subscribe(
                (response) => {
                    console.log(`Usuario ${this.userIdToDelete} eliminado`);
                    this.users = this.users.filter((user) => user.id !== this.userIdToDelete);
                    this.filterUsers();
                    this.showModal = false; // Cierra el modal
                    this.userIdToDelete = null; // Resetea el ID
                },
                (error) => {
                    console.error('Error al eliminar el usuario', error);
                    this.showModal = false;
                    this.userIdToDelete = null;
                }
            );
        }
    }

    cancelDelete(): void {
        this.showModal = false; // Cierra el modal
        this.userIdToDelete = null; // Resetea el ID
    }

    openEditUser(userId: number): void {
        this._router.navigate([`gestion_usuarios/editar/${userId}`]);
    }

    filterUsers(): void {
        const term = this.searchTerm.toLowerCase();
        this.filteredUsers = this.users.filter((user) =>
            user.username.toLowerCase().includes(term) ||
            user.id.toString().includes(term) ||
            (user.rol === 1 ? 'Administrador' : 'Básico').toLowerCase().includes(term) ||
            (user.estado === 1 ? 'Activo' : 'Inactivo').toLowerCase().includes(term)
        );
    }
}
