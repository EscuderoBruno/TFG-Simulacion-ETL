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
        // Generar un clientId por defecto
        const defaultClientId = this.generateClientId();
    
        // Inicializa el formulario principal para las conexiones
        this.connectionForm = this._formBuilder.group({
            name: ['', Validators.required], // Nombre de la conexión
            type: ['', Validators.required], // Para elegir entre 'MQTT' o 'API'
            options: this._formBuilder.group({
              URL: ['', Validators.required],  // Para MQTT y API, si aplica
              header: ['', Validators.required],  // Solo para API, si aplica
              username: ['', Validators.required], // Para MQTT, si aplica
              password: ['', Validators.required], // Para MQTT, si aplica
              clientId: [defaultClientId, Validators.required], // Para MQTT, si aplica
              topic: ['', Validators.required], // Para MQTT, si aplica
            })
        });
    }

    // Generar un clientId por defecto
    private generateClientId(): string {
        return `mqtt_${Math.random().toString(36).substring(2, 15)}`;
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

    onTypeSelect(): void {
        const type = this.connectionForm.controls['type'].value; // Obtiene el tipo de conexión seleccionado
        const options = this.connectionForm.controls['options'] as FormGroup;
    
        if (type === '0') {
            // Configuración para MQTT
            options.get('URL')?.setValidators([Validators.required]);
            options.get('username')?.setValidators([Validators.required]);
            options.get('password')?.setValidators([Validators.required]);
            options.get('clientId')?.setValidators([Validators.required]);
            options.get('topic')?.setValidators([Validators.required]); // 'topic' es obligatorio para MQTT
            options.get('header')?.clearValidators(); // 'header' no es necesario para MQTT
        } else if (type === '1') {
            // Configuración para API
            options.get('URL')?.setValidators([Validators.required]);
            options.get('header')?.setValidators([Validators.required]); // 'header' es obligatorio para API
            options.get('username')?.clearValidators(); // 'username' no es necesario para API
            options.get('password')?.clearValidators(); // 'password' no es necesario para API
            options.get('clientId')?.clearValidators(); // 'clientId' no es necesario para API
            options.get('topic')?.clearValidators(); // 'topic' no es necesario para API
        }
    
        // Actualiza el estado de todos los campos para reflejar los cambios en las validaciones
        options.get('URL')?.updateValueAndValidity();
        options.get('header')?.updateValueAndValidity();
        options.get('username')?.updateValueAndValidity();
        options.get('password')?.updateValueAndValidity();
        options.get('clientId')?.updateValueAndValidity();
        options.get('topic')?.updateValueAndValidity();
    }    

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/conexiones']);
    }
}
