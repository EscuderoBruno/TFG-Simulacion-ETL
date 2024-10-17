import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { SimulacionesService } from '../simulaciones.service';
import { LocalizacionesService } from '../../localizaciones/localizaciones.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'crear-simulacion',
    templateUrl: './crear_simulacion.component.html',
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
        MatExpansionModule,
        MatTooltipModule,
        MatMenuModule,
        ReactiveFormsModule,
        RouterModule
    ],
})

export class CrearSimulacionComponent implements OnInit {
  
    simulationForm: UntypedFormGroup;
    formFieldHelpers = '';
    locations: any[] = [];
    generatedSimulation: string = ''; // Propiedad para almacenar la simulación generada
    jsonFormat: any; // Propiedad para almacenar el formato JSON
    showTooltip = false;
    simulacionGenerada = false;
    showAlert = false;
    showAdvise = true;

    jsonData = {
        campo2: "^int[0,10]",
        campo3: "^float[20,25]",
        campo4: "^bool[8,9]",
        time: "^timenow",
        campo5: "este texto",
        campo6: "^array[4]int[0,50]",
        campo7: "^array[4]float[0,50]",
        campo8: "^array[4]bool",
        campo9: {
          campo10: "^array[4]float[0,50]",
          campo11: "^float[20,25]"
        },
        campo12: "^positionlong",
        campo13: "^positionlat",
        campo14: "^positioncote"
    };

    constructor(
        private _simulationService: SimulacionesService,
        private _locationsService: LocalizacionesService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this._locationsService.getAllLocations().subscribe(
            (response) => {
              this.locations = response;  // Guardar la lista de usuarios
            },
            (error) => {
              console.error('Error al obtener las localizaciones', error);
            }
        );
        // Inicializa el formulario principal con un FormGroup para los parámetros
        this.simulationForm = this._formBuilder.group({
            name: ['', Validators.required],          // Campo de nombre, inicializado vacío
            locationId: [Validators.required],     // ID de la localización, inicializado a 0 o un valor por defecto
            parameters: []
        });
    }

    get formattedFormatJson(): any {
        const jsonString = JSON.stringify(this.jsonData, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }
    

    // Método para enviar el formulario
    onSubmit(): void {
        if (this.simulationForm.valid) {
            if (this.simulacionGenerada == true) {
                // Llamar a la generación de simulación antes de enviar
                const formValue = this.simulationForm.value;
    
                // Genera la simulación y la asigna a parameters
        
                // Si el valor de 'parameters' es una cadena en formato JSON, conviértelo en un objeto
                if (typeof formValue.parameters === 'string') {
                    try {
                        // Convierte la cadena JSON en un objeto
                        formValue.parameters = JSON.parse(formValue.parameters);
                    } catch (error) {
                        console.error("Error al convertir los parámetros a JSON", error);
                        return;
                    }
                }
                this.simulationForm.disable(); // Desactiva el formulario para evitar múltiples envíos
        
                this._simulationService.create(formValue).subscribe(
                    () => {
                        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/simulaciones';
                        this._router.navigateByUrl(redirectURL);
                    },
                    (error) => {
                        console.error('Error durante el registro:', error);
                        this.simulationForm.enable(); // Habilita de nuevo el formulario si hay un error
                    }
                );
            } else {
                console.log("Genera antes la simulación");
                this.showAlert = true;
                this.showAdvise = false;
            }
        } else {
            console.log('Formulario no válido');
        }
    }    

    // Método para probar simulación
    testSimulation(): void {
        
        const formValue = this.simulationForm.value;

        // Si el valor de 'parameters' es una cadena, intenta parsearlo
        if (typeof formValue.parameters === 'string') {
            try {
                formValue.parameters = JSON.parse(formValue.parameters);
            } catch (error) {
                console.error("Error al convertir los parámetros a JSON", error);
                return;
            }
        }

        // Verificar si hay parámetros para generar un nuevo JSON
        if (formValue.parameters) {
            formValue.parameters = this._simulationService.generateNewJson(formValue.parameters, formValue.locationId);
            console.log("Resultado generado:", formValue.parameters); // Imprimir el nuevo JSON generado

            this.generatedSimulation = formValue.parameters;
            this.simulacionGenerada = true;
            this.showAlert = false;
        } else {
            console.error("No se encontraron parámetros válidos.");
        }
    }

    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/simulaciones']);
    }

    get formattedSimulationJson(): any {
        const jsonString = JSON.stringify(this.generatedSimulation, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }

}

