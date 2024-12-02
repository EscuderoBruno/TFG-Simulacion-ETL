import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { ConexionesService } from '../conexiones.service';  // Servicio de conexiones
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'editar-conexion',
    templateUrl: './editar_conexion.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatButtonToggleModule,
        ReactiveFormsModule,
        RouterModule
    ],
})
export class EditarConexionComponent implements OnInit {

    isActive: boolean = true;
    connectionForm: UntypedFormGroup;  // Formulario para editar conexión
    connectionId: number; // ID de la conexión a editar
    formFieldHelpers = ''; // Propiedad para mensajes de ayuda (opcional)

    constructor(
        private _conexionesService: ConexionesService,  // Servicio de conexiones
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Obtiene el ID de la conexión de la ruta
        this.connectionId = Number(this._activatedRoute.snapshot.paramMap.get('id'));

        // Inicializa el formulario principal con un FormArray para las opciones
        this.connectionForm = this._formBuilder.group({
            name: ['', Validators.required],
            type: [0, Validators.required],  // 0 para MQTT, 1 para API
            options: this._formBuilder.group({
                host: ['', Validators.required],
                token: ['', Validators.required],
                port: ['', Validators.required],
                // Otras opciones específicas según sea necesario
            })
        });

        // Cargar los datos de la conexión existente
        this._conexionesService.getConnectionById(this.connectionId).subscribe(
            (connection) => {
                this.connectionForm.patchValue({
                    name: connection.name,
                    type: connection.type,
                    options: connection.options
                });
            },
            (error) => {
                console.error('Error al cargar la conexión:', error);
            }
        );
    }

    // Método para enviar el formulario (editar conexión)
    onSubmit(): void {
        if (this.connectionForm.valid) {
            console.log('Datos que se envían:', this.connectionForm.value);

            this.connectionForm.disable();  // Desactiva el formulario para evitar múltiples envíos

            this._conexionesService.editConnection(this.connectionId, this.connectionForm.value).subscribe(
                () => {
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/conexiones';
                    this._router.navigateByUrl(redirectURL);
                },
                (error) => {
                    console.error('Error durante la edición:', error);
                    this.connectionForm.enable();  // Rehabilita el formulario si hay un error
                }
            );
        } else {
            console.log('Formulario no válido');
        }
    }

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/conexiones']);
    }
}
