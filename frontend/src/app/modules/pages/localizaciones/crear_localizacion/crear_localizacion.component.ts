import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { LocalizacionesService } from '../localizaciones.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'crear-localizacion',
    templateUrl: './crear_localizacion.component.html',
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

export class CrearLocalizacionComponent implements OnInit {
  
    isActive: boolean = true;
    locationForm: UntypedFormGroup;
    formFieldHelpers = ''; // Define la propiedad o ajusta el valor necesario

    constructor(
        private _locationService: LocalizacionesService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Inicializa el formulario principal con un FormArray para coordenadas
        this.locationForm = this._formBuilder.group({
            name: [''],
            coordinates: this._formBuilder.array([]) // FormArray para las coordenadas
        });

        // Añadimos una coordenada inicial por defecto
        this.agregarCoordenada();
    }

    // Getter para el FormArray de coordenadas
    get coordinates(): FormArray {
        return this.locationForm.get('coordinates') as FormArray;
    }

    // Método para agregar una nueva coordenada
    agregarCoordenada(): void {
        const localizacionForm = this._formBuilder.group({
            lat: ['', Validators.required],
            long: ['', Validators.required],
            height: ['', Validators.required],
            alias: ['', Validators.required]
        });

        this.coordinates.push(localizacionForm);
    }

    // Método para eliminar una coordenada específica
    eliminarCoordenada(index: number): void {
        this.coordinates.removeAt(index);
    }

    // Método para enviar el formulario
    onSubmit(): void {
      if (this.locationForm.valid) {
          // Imprime el valor que estás enviando
          console.log('Datos que se envían:', this.locationForm.value);
          
          this.locationForm.disable(); // Desactiva el formulario para evitar múltiples envíos

          this._locationService.create(this.locationForm.value).subscribe(
              () => {
                  const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/localizaciones';
                  this._router.navigateByUrl(redirectURL);
              },
              (error) => {
                  console.error('Error durante el registro:', error);
                  this.locationForm.enable(); // Rehabilita el formulario si hay un error
                  this.locationForm.reset(); // Resetea el formulario si es necesario
              }
          );
      } else {
          console.log('Formulario no válido');
      }
    }

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/localizaciones']);
    }
}

