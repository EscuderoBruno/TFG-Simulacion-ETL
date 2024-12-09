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
        ReactiveFormsModule,
        RouterModule
    ],
})
export class EditarConexionComponent implements OnInit {
    connectionForm: UntypedFormGroup;
    connectionId: number;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _conexionesService: ConexionesService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Obtener el ID de la conexión desde la ruta
        this.connectionId = +this._activatedRoute.snapshot.paramMap.get('id');

        // Inicializar el formulario
        this.connectionForm = this._formBuilder.group({
            name: ['', Validators.required],
            type: [0, Validators.required], // 0: MQTT, 1: API
            options: this._formBuilder.group({
                URL: ['', Validators.required],
                username: [''],
                password: [''],
                topic: [''],
                clientId: [''],
                header: [''],
            }),
        });

        // Cargar datos de la conexión existente
        this._conexionesService.getConnectionById(this.connectionId).subscribe((connection) => {
            this.connectionForm.patchValue({
                name: connection.name,
                type: connection.type,
                options: connection.options,
            });
        });
    }

    onTypeSelect(): void {
        // Lógica adicional para manejar cambios en el tipo de conexión
    }

    onSubmit(): void {
        if (this.connectionForm.valid) {
            this._conexionesService
                .editConnection(this.connectionId, this.connectionForm.value)
                .subscribe(() => {
                    this._router.navigate(['/conexiones']);
                });
        }
    }

    cancel(): void {
        this._router.navigate(['/conexiones']);
    }
}
