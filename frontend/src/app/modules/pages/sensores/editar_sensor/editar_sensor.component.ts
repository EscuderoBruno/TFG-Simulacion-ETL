import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { SensoresService } from '../sensores.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'editar-sensor',
    templateUrl: './editar_sensor.component.html',
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
export class EditarSensorComponent implements OnInit {

    isActive: boolean = true;
    locationForm: UntypedFormGroup;
    sensorId: number; // ID del sensor a editar
    formFieldHelpers = ''; // Define la propiedad o ajusta el valor necesario

    constructor(
        private _sensoresService: SensoresService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Obtiene el ID del sensor de la ruta
        this.sensorId = Number(this._activatedRoute.snapshot.paramMap.get('id'));

        // Inicializa el formulario principal con un FormArray para coordenadas
        this.locationForm = this._formBuilder.group({
            name: ['', Validators.required],
            coordinates: this._formBuilder.array([]) // FormArray para las coordenadas
        });

        // Cargar datos del sensor existente
        this._sensoresService.getSensorById(this.sensorId).subscribe(
            (sensor) => {
                this.locationForm.patchValue({ name: sensor.name });
                sensor.coordinates.forEach((coord: any) => this.agregarCoordenada(coord));
            },
            (error) => {
                console.error('Error al cargar el sensor:', error);
            }
        );
    }

    // Getter para el FormArray de coordenadas
    get coordinates(): FormArray {
        return this.locationForm.get('coordinates') as FormArray;
    }

    // Método para agregar una nueva coordenada
    agregarCoordenada(coord: any = null): void {
        const sensorForm = this._formBuilder.group({
            lat: [coord?.lat || '', Validators.required],
            long: [coord?.long || '', Validators.required],
            height: [coord?.height || '', Validators.required],
            alias: [coord?.alias || '', Validators.required],
            dev_eui: [coord?.dev_eui || '', Validators.required],
            join_eui: [coord?.join_eui || '', Validators.required],
            dev_addr: [coord?.dev_addr || '', Validators.required]
        });

        this.coordinates.push(sensorForm);
    }

    // Método para eliminar una coordenada específica
    eliminarCoordenada(index: number): void {
        this.coordinates.removeAt(index);
    }

    // Método para enviar el formulario (editar sensor)
    onSubmit(): void {
        if (this.locationForm.valid) {
            console.log('Datos que se envían:', this.locationForm.value);

            this.locationForm.disable(); // Desactiva el formulario para evitar múltiples envíos

            this._sensoresService.editSensor(this.sensorId, this.locationForm.value).subscribe(
                () => {
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sensores';
                    this._router.navigateByUrl(redirectURL);
                },
                (error) => {
                    console.error('Error durante la edición:', error);
                    this.locationForm.enable(); // Rehabilita el formulario si hay un error
                }
            );
        } else {
            console.log('Formulario no válido');
        }
    }

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/sensores']);
    }
}
