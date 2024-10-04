import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';


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
        MatSelectModule,
        MatButtonToggleModule,
        ReactiveFormsModule
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
    signInForm: UntypedFormGroup;

    toggleVisibility() {
      this.isActive = !this.isActive; // Cambia el estado
    }

    constructor(private _authService: AuthService, private _formBuilder: UntypedFormBuilder, private _activatedRoute: ActivatedRoute, private _router: Router) {}

    ngOnInit(): void {
      // Crear el formulario
      this.signInForm = this._formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
        rol: ['', Validators.required],
        estado: ['', Validators.required]
      });
    }
  
    // Función para enviar el formulario
    onSubmit(): void {
      // Verifica si el formulario es válido
      if (this.signInForm.valid) {
        // Desactiva el formulario para evitar múltiples envíos
        this.signInForm.disable();

        // Llama al servicio de autenticación para registrar al usuario
        this._authService.signUp(this.signInForm.value).subscribe(
          () => {
            // Obtiene la URL de redirección o usa una por defecto
            const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
            this._router.navigateByUrl(redirectURL);
          },
          (error) => {
            // Imprime el error completo en la consola
            console.error('Error durante el registro:', error);
            
            // Vuelve a habilitar el formulario
            this.signInForm.enable();

            // Resetea el formulario si es necesario
            this.signInForm.reset(); // o this.signInNgForm.resetForm(); si usas NgForm
          }
        );
      } else {
        console.log('Formulario no válido');
      }
    }

    cancel() {
      this._router.navigate(['/gestion_usuarios']);
    }
}
