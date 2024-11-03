import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SimulacionesService } from '../simulaciones.service';
import { LocalizacionesService } from '../../localizaciones/localizaciones.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Importar el módulo de Checkbox
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import mqtt from 'mqtt';  // Importa la librería MQTT
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


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
        RouterModule,
        MatCheckboxModule
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
    private mqttClient: any; // Cliente MQTT
    numArrayLocalizacion: 0;
    simulacionesGeneradas: any[] = [];

    jsonData = {
        campo2: "^int[0,10]",
        campo3: "^float[20,25]",
        campo4: "^bool",
        time: "^time",
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
        campo14: "^positioncote",
        campo15: "^positionalias"
    };

    rawFormatJson: string = `{
        "campo2": "^int[0,10]",
        "campo3": "^float[20,25]",
        "campo4": "^bool[8,9]",
        "time": "^time",
        "campo5": "este texto",
        "campo6": "^array[4]int[0,50]",
        "campo7": "^array[4]float[0,50]",
        "campo8": "^array[4]bool",
        "campo9": {
          "campo10": "^array[4]float[0,50]",
          "campo11": "^float[20,25]"
        },
        "campo12": "^positionlong",
        "campo13": "^positionlat",
        "campo14": "^positioncote",
        "campo15": "^positionalias"
    }`;

    constructor(
        private _simulationService: SimulacionesService,
        private _locationsService: LocalizacionesService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
        this._locationsService.getAllLocations().subscribe(
            (response) => {
              this.locations = response;  // Guardar la lista de localizaciones
            },
            (error) => {
              console.error('Error al obtener las localizaciones', error);
            }
        );
        
        // Configuración del formulario principal
        this.simulationForm = this._formBuilder.group({
            name: ['', Validators.required],
            locationId: [null, Validators.required],
            minRegistrosPorInstante: [0, [Validators.required, Validators.min(0)]],
            maxRegistrosPorInstante: [0, [Validators.required, Validators.min(0)]],
            minIntervaloEntreRegistros: [0, [Validators.required, Validators.min(0)]],
            maxIntervaloEntreRegistros: [0, [Validators.required, Validators.min(0)]],
            numElementosASimular: [0, [Validators.required, Validators.min(0)]],
            noRepetirCheckbox: [0],
            parameters: ['']
        }, { validators: this.registrosPorInstanteValidator() });

        // Escuchar cambios en 'noRepetirCheckbox' y 'locationId' para disparar la validación
        this.simulationForm.get('noRepetirCheckbox')?.valueChanges.subscribe(() => this.simulationForm.updateValueAndValidity());
        this.simulationForm.get('locationId')?.valueChanges.subscribe(() => this.simulationForm.updateValueAndValidity());
    }
    
    get formattedFormatJson(): any {
        const jsonString = JSON.stringify(this.jsonData, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }
    
    // Método para enviar el formulario
    onSubmit(): void {
        if (this.simulationForm.valid) {
            if (this.simulacionGenerada == true) {
                const formValue = this.simulationForm.value;
    
                // Genera la simulación y la asigna a parameters
                if (typeof formValue.parameters === 'string') {
                    try {
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

        // Verificar si hay un locationId válido antes de hacer la solicitud
        if (!formValue.locationId) {
            console.error("Se necesita un locationId válido.");
            return;
        }

        // Suscribirse al Observable para obtener la localización
        this._locationsService.getLocationById(formValue.locationId).subscribe(
            (location) => {
                // Verificar que las coordenadas existen
                if (!location.coordinates || location.coordinates.length === 0) {
                    console.error('No se encontraron coordenadas para la localización', location);
                    return;
                }

                // Generar un índice aleatorio basado en el número de coordenadas
                const randomIndex = Math.floor(Math.random() * location.coordinates.length);

                // Intentar parsear los parámetros si son una cadena
                if (typeof formValue.parameters === 'string') {
                    try {
                        formValue.parameters = JSON.parse(formValue.parameters);
                    } catch (error) {
                        console.error("Error al convertir los parámetros a JSON", error);
                        return;
                    }
                }

                // Verificar si hay parámetros válidos para generar un nuevo JSON
                if (formValue.parameters) {
                    // Generar el nuevo JSON
                    this.generatedSimulation = this._simulationService.generateNewJson(formValue.parameters, formValue.locationId, randomIndex, new Date());
                    console.log("Resultado generado:", formValue.parameters); // Imprimir el nuevo JSON generado

                    // Asignar los resultados generados a las variables de estado
                    this.simulacionGenerada = true;
                    this.showAlert = false;
                } else {
                    console.error("No se encontraron parámetros válidos.");
                }
            },
            (error) => {
                console.error('Error al obtener la localización', error);
            }
        );
    }


    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/simulaciones']);
    }

    get formattedSimulationJson(): any {
        const jsonString = JSON.stringify(this.generatedSimulation, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }

    copyToClipboard(): void {
        const textArea = document.createElement('textarea');
        textArea.value = this.rawFormatJson; // Usamos el raw JSON sin formato HTML
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    // Componente de TypeScript
    onKeydown(event: KeyboardEvent) {
        // Si la tecla presionada es Tab
        if (event.key === 'Tab') {
            // Prevenir el comportamiento predeterminado (cambiar el foco)
            event.preventDefault();
            // Obtener la posición del cursor en el textarea
            const textarea = event.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Establecer el valor del textarea incluyendo un tabulador
            textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
            // Mover el cursor a la posición después del tabulador
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    }

    // Validador personalizado
    registrosPorInstanteValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const minRegistros = control.get('minRegistrosPorInstante')?.value;
            const maxRegistros = control.get('maxRegistrosPorInstante')?.value;
            const noRepetir = control.get('noRepetirCheckbox')?.value;
            const locationId = control.get('locationId')?.value;

            if (noRepetir && locationId) {
                // Buscar localización por ID
                const location = this.locations.find(loc => loc.id === locationId);
                const maxCoordinates = location?.coordinates.length || 0;

                // Verificar que los registros no excedan las coordenadas disponibles
                if ((minRegistros > maxCoordinates) || (maxRegistros > maxCoordinates)) {
                    return { registrosExcedenCoordenadas: true };
                }
            }
            return null;
        };
    }

}

