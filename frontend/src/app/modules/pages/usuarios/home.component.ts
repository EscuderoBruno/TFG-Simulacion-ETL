import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule],
})
export class LandingHomeComponent
{
    /**
     * Constructor
     */

    isActive: boolean = true;
    users: any[] = [];

    toggleVisibility() {
      this.isActive = !this.isActive; // Cambia el estado
    }

    constructor(private _authService: AuthService) {}

    ngOnInit(): void {
      this._authService.getAllUsers().subscribe(
        (response) => {
          this.users = response;  // Guardar la lista de usuarios
          console.log(this.users);
        },
        (error) => {
          console.error('Error al obtener los usuarios', error);
        }
      );
    }

    deleteUser(id) {
      this._authService.deleteUser(id).subscribe(
        (response) => {
          console.log("Usario " + id + " eliminado");
          location.reload();
        },
        (error) => {
          console.error('Error al eliminar el usuario', error);
        }
      );
    }
}
