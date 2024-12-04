import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SimulacionesService } from '../simulaciones.service';
import { SensoresService } from '../../sensores/sensores.service';
import { ConexionesService } from '../../conexiones/conexiones.service';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DatePipe } from '@angular/common';


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
        MatCheckboxModule,
        MatDatepickerModule
    ],
    providers: [DatePipe]  // Proveedor de DatePipe
})

export class CrearSimulacionComponent implements OnInit {
  
    simulationForm: UntypedFormGroup;
    formFieldHelpers = '';
    sensors: any[] = [];
    connections: any[] = [];
    generatedSimulation: string = ''; // Propiedad para almacenar la simulación generada
    jsonFormat: any; // Propiedad para almacenar el formato JSON
    showTooltip = false;
    simulacionGenerada = false;
    showAlert = false;
    showAdvise = true;
    numArrayLocalizacion: 0;
    simulacionesGeneradas: any[] = [];
    minDate: Date;
    placeholderText: string = 'Fecha'; // Valor inicial del placeholder

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
        campo15: "^positionalias",
        campo16: "^positiondeveui",
        campo17: "^positionjoineui",
        campo18: "^positiondevaddr"
    };

    rawFormatJson: string = `{
    "campo2": "^int[0,10]",
    "campo3": "^float[20,25]",
    "campo4": "^bool",
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
    "campo15": "^positionalias",
    "campo16": "^positiondeveui",
    "campo17": "^positionjoineui",
    "campo18": "^positiondevaddr"
    }`;

    constructor(
        private _simulationService: SimulacionesService,
        private _sensoresService: SensoresService,
        private _conexionesService: ConexionesService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private sanitizer: DomSanitizer,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        // Obtenemos la fecha y hora actuales y la formateamos
        const formattedDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy 00:00:00');

        // Configuración del formulario principal
        this.simulationForm = this._formBuilder.group({
            name: ['', Validators.required],
            sensorId: [null, Validators.required],
            connectionId: [null, Validators.required],
            minRegistrosPorInstante: ["", [Validators.required, Validators.min(0)]],
            maxRegistrosPorInstante: ["", [Validators.required, Validators.min(0)]],
            minIntervaloEntreRegistros: ["", [Validators.required, Validators.min(0)]],
            maxIntervaloEntreRegistros: ["", [Validators.required, Validators.min(0)]],
            numElementosASimular: ["", [Validators.required, Validators.min(0)]],
            noRepetirCheckbox: [0],
            parameters: [''],
            // Campo fecha con el valor formateado
            date: [formattedDate, Validators.required],
        }, {
            // Aquí aplicamos el validador al formulario completo
            validators: this.registrosPorInstanteValidator()
        });

        // Obtener las ubicaciones de los sensores
        this._sensoresService.getAllSensors().subscribe(
            (response) => {
                this.sensors = response;
            },
            (error) => {
                console.error('Error al obtener los sensores', error);
            }
        );
        // Obtener las conexiones
        this._conexionesService.getAllConnections().subscribe(
            (response) => {
                this.connections = response;
            },
            (error) => {
                console.error('Error al obtener las conexiones', error);
            }
        );
    }

    // Método para convertir la fecha en formato string a Date
    getFechaAsDate(fechaString: string): Date {
        const [datePart, timePart] = fechaString.split(' ');  // Separar la fecha y la hora
        const [day, month, year] = datePart.split('/');      // Separar la fecha en día, mes y año
        const [hours, minutes, seconds] = timePart.split(':'); // Separar la hora en horas, minutos y segundos
        return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds); // Retorna un objeto Date
    }
    
    
    get formattedFormatJson(): any {
        const jsonString = JSON.stringify(this.jsonData, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }
    
    onSubmit(): void {
        if (this.simulationForm.valid) {
            if (this.simulacionGenerada == true) {
                const formValue = this.simulationForm.value;
    
                // Convertir el valor del campo 'fecha' en string a un objeto Date
                let fechaDate: Date;
    
                // Si la fecha es 'now', usamos la fecha actual
                if (formValue.date === 'now') {
                    fechaDate = new Date();
                } else {
                    // Si la fecha no es 'now', la convertimos de string a Date
                    fechaDate = this.getFechaAsDate(formValue.date);
                }
    
                // Luego formateamos la fecha al formato de MySQL (YYYY-MM-DD HH:mm:ss)
                formValue.date = this.getFormattedDate(fechaDate);
    
                // Verificar y convertir los parámetros si son una cadena
                if (typeof formValue.parameters === 'string') {
                    try {
                        formValue.parameters = JSON.parse(formValue.parameters);
                    } catch (error) {
                        console.error("Error al convertir los parámetros a JSON", error);
                        return;
                    }
                }
    
                // Desactivar el formulario para evitar múltiples envíos
                this.simulationForm.disable();
    
                // Enviar el formulario
                this._simulationService.create(formValue).subscribe(
                    (response: any) => {
                        const simulationId = response.id;
                        console.log('Simulación creada exitosamente');
                        this._router.navigate([`/simulaciones/${simulationId}`]);
                    },
                    (error) => {
                        console.error('Error durante el registro:', error);
                        this.simulationForm.enable(); // Habilita el formulario si ocurre un error
                    }
                );

            } else {
                console.log("Genera antes la simulación");
                this.showAlert = true;
            }
        } else {
            console.log('Formulario no válido');
        }
    }    
    
    getFormattedDate(date: Date): string {
        // Cambia el formato de la fecha a MySQL (YYYY-MM-DD HH:mm:ss)
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss')!;
    }
    

    // Método para probar simulación
    testSimulation(): void {
        const formValue = this.simulationForm.value;

        // Verificar si hay un sensorId válido antes de hacer la solicitud
        if (!formValue.sensorId) {
            console.error("Se necesita un sensorId válido.");
            return;
        }

        // Suscribirse al Observable para obtener la localización
        this._sensoresService.getSensorById(formValue.sensorId).subscribe(
            (sensor) => {
                // Verificar que las coordenadas existen
                if (!sensor.coordinates || sensor.coordinates.length === 0) {
                    console.error('No se encontraron coordenadas para la localización', sensor);
                    return;
                }

                // Generar un índice aleatorio basado en el número de coordenadas
                const randomIndex = Math.floor(Math.random() * sensor.coordinates.length);

                // Intentar parsear los parámetros si son una cadena
                if (typeof formValue.parameters === 'string') {
                    try {
                        formValue.parameters = JSON.parse(formValue.parameters);
                    } catch (error) {
                        console.error("Error al convertir los parámetros a JSON", error);
                        return;
                    }
                }

                // Convertir el valor del campo 'fecha' en string a un objeto Date
                let fechaDate: Date;

                // Si la fecha es 'now', usamos la fecha actual
                if (formValue.date === 'now') {
                    fechaDate = new Date();
                } else {
                    // Si la fecha no es 'now', la convertimos de string a Date
                    fechaDate = this.getFechaAsDate(formValue.date);
                }

                // Verificar si hay parámetros válidos para generar un nuevo JSON
                if (formValue.parameters) {
                    // Generar el nuevo JSON
                    this._simulationService.generateNewJson(formValue.parameters, formValue.sensorId, randomIndex, fechaDate)
                    .then(generatedJson => {
                        this.generatedSimulation = generatedJson;
                        console.log('JSON generado:', generatedJson);
                    })
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
            const sensorId = control.get('sensorId')?.value;

            if (noRepetir && sensorId) {
                // Buscar localización por ID
                const sensor = this.sensors.find(loc => loc.id === sensorId);
                const maxCoordinates = sensor?.coordinates.length || 0;

                // Verificar que los registros no excedan las coordenadas disponibles
                if ((minRegistros > maxCoordinates) || (maxRegistros > maxCoordinates)) {
                    return { registrosExcedenCoordenadas: true };
                }
            }
            return null;
        };
    }

    // Método para cambiar el placeholder al hacer clic
    setPlaceholderToNow() {
        this.placeholderText = 'now'; // Cambiar el texto del placeholder
        this.simulationForm.get('date')?.setValue(this.placeholderText); // Establecer la fecha actual
    }

    getSelectedConnection() {
        const connectionId = this.simulationForm.get('connectionId')?.value;
        return this.connections.find(connection => connection.id === connectionId);
    }
    
    // Método para cancelar y redirigir a otra ruta
    cancel(): void {
        this._router.navigate(['/simulaciones']);
    }

}

