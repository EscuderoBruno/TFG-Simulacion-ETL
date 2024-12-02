import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ConexionesService } from '../conexiones.service';  // Asegúrate de que este servicio esté correctamente importado
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

@Component({
    selector: 'crear-conexion',
    templateUrl: './crear_conexion.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        ReactiveFormsModule,
        RouterModule
    ],
})
export class CrearConexionComponent implements OnInit {

    isActive: boolean = true;
    connectionForm: UntypedFormGroup;
    formFieldHelpers = ''; // Define la propiedad o ajusta el valor necesario
    @ViewChild(MatSelect) matSelect: MatSelect | undefined;

    constructor(
        private _conexionesService: ConexionesService,  // Cambié el servicio a ConexionesService
        private _formBuilder: FormBuilder,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        // Inicializa el formulario principal para las conexiones
        this.connectionForm = this._formBuilder.group({
            name: ['', Validators.required], // Nombre de la conexión
            type: ['', Validators.required], // Para elegir entre 'MQTT' o 'API'
            options: this._formBuilder.group({
              host: ['', Validators.required],  // Para MQTT y API, si aplica
              token: ['', Validators.required],  // Solo para API, si aplica
              port: ['', Validators.required],   // Solo para MQTT, si aplica
              username: ['', Validators.required], // Para MQTT, si aplica
              password: ['', Validators.required], // Para MQTT, si aplica
              clientId: ['', Validators.required], // Para MQTT, si aplica
              topic: ['', Validators.required], // Tópico, común para ambos
            })
        });
    }

    // Método para enviar el formulario
    onSubmit(): void {
        if (this.connectionForm.valid) {
            // Imprime el valor que estás enviando
            console.log('Datos que se envían:', this.connectionForm.value);
            
            this.connectionForm.disable(); // Desactiva el formulario para evitar múltiples envíos

            // Llamada al servicio para crear la conexión
            this._conexionesService.create(this.connectionForm.value).subscribe(
                () => {
                    const redirectURL = '/conexiones'; // Redirige a la lista de conexiones
                    this._router.navigateByUrl(redirectURL);
                },
                (error) => {
                    console.error('Error durante el registro:', error);
                    this.connectionForm.enable(); // Rehabilita el formulario si hay un error
                }
            );
        } else {
            console.log('Formulario no válido');
        }
    }

    onTypeChange(event: any): void {
    // Actualiza el estado o realiza cualquier acción adicional si es necesario
        console.log('Tipo de conexión cambiado:', event.value);
    }      

    // Función para manejar la selección del tipo de conexión
    onTypeSelect() {
        const type = this.connectionForm.controls['type'].value;
        const options = this.connectionForm.controls['options'] as FormGroup;

        // Lógica para mostrar u ocultar campos basados en la selección del tipo
        if (type === '0') {
            // MQTT
            options.get('host')?.setValidators([Validators.required]);
            options.get('port')?.setValidators([Validators.required]);
            options.get('username')?.setValidators([Validators.required]);
            options.get('password')?.setValidators([Validators.required]);
            options.get('clientId')?.setValidators([Validators.required]);
            options.get('token')?.clearValidators(); // No necesario para MQTT
        } else {
        // API
            options.get('host')?.setValidators([Validators.required]);
            options.get('token')?.setValidators([Validators.required]);
            options.get('port')?.clearValidators(); // No necesario para API
            options.get('username')?.clearValidators(); // No necesario para API
            options.get('password')?.clearValidators(); // No necesario para API
            options.get('clientId')?.clearValidators(); // No necesario para API
        }

        // Actualiza las validaciones del formulario
        options.get('host')?.updateValueAndValidity();
        options.get('token')?.updateValueAndValidity();
        options.get('port')?.updateValueAndValidity();
        options.get('username')?.updateValueAndValidity();
        options.get('password')?.updateValueAndValidity();
        options.get('clientId')?.updateValueAndValidity();
    }

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/conexiones']);
    }
}
