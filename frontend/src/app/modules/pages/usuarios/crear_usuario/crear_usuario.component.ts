import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router'; // Cambiar RouterLink a RouterModule
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { AuthService } from 'app/core/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector     : 'landing-home',
    templateUrl  : './crear_usuario.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        MatButtonModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CommonModule,
        MatSelectModule
    ],
})

export class CrearUsuarioComponent
{
    /**
     * Constructor
     */

    isActive: boolean = true;
    users: any[] = [];
    formFieldHelpers = '';  // Define la propiedad o ajusta el valor necesario

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
