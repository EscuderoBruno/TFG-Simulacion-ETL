import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SimulacionesService } from '../simulaciones.service';
import { SensoresService } from '../../sensores/sensores.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'editar-simulacion',
    templateUrl: './editar_simulacion.component.html',
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
        MatDatepickerModule,
        MatProgressBarModule,
    ],
    providers: [DatePipe]
})

export class EditarSimulacionComponent implements OnInit {

    simulation: any;
    simulationId: number;
    simulationForm: UntypedFormGroup;
    formFieldHelpers = '';
    sensors: any[] = [];
    generatedSimulation: any[] = [];  // Aquí irán los datos de la simulación
    generatedTest: string;
    jsonFormat: any;
    showTooltip = false;
    testGenerado = false;
    showAlert = false;
    showAdvise = true;
    numArrayLocalizacion: 0;
    simulacionesGeneradas: any[] = [];
    minDate: Date;
    placeholderText: string = 'Fecha';
    activeSimulation: { simulation: any; elapsedTime: number; interval?: any; startTime?: number; remainingTime?: number; totalTime?: number } = { simulation: null, elapsedTime: 0 }; // Inicializar valores predeterminados
    simulando = false;
    isExpanded: boolean[] = []; // Lista para saber qué items están expandidos
    isPaused: boolean = false; // Controlar si está pausada

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
    "campo15": "^positionalias",
    "campo16": "^positiondeveui",
    "campo17": "^positionjoineui",
    "campo18": "^positiondevaddr"
    }`;

    constructor(
        private _simulationService: SimulacionesService,
        private _sensoresService: SensoresService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private sanitizer: DomSanitizer,
        private datePipe: DatePipe,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.simulationId = Number(this._activatedRoute.snapshot.paramMap.get('id') || '');
        const formattedDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy 00:00:00');

        this.simulationForm = this._formBuilder.group({
            name: ['', Validators.required],
            sensorId: [null, Validators.required],
            minRegistrosPorInstante: ["", [Validators.required, Validators.min(0)]],
            maxRegistrosPorInstante: ["", [Validators.required, Validators.min(0)]],
            minIntervaloEntreRegistros: ["", [Validators.required, Validators.min(0)]],
            maxIntervaloEntreRegistros: ["", [Validators.required, Validators.min(0)]],
            numElementosASimular: ["", [Validators.required, Validators.min(0)]],
            noRepetirCheckbox: [0],
            parameters: [''],
            date: [formattedDate, Validators.required],
        }, {
            // Aquí aplicamos el validador al formulario completo
            validators: this.registrosPorInstanteValidator()
        });

        if (this.simulationId) {
            const simulationIdNumber = Number(this.simulationId); // Convierte la cadena a número
            if (!isNaN(simulationIdNumber)) {
                this._simulationService.getSimulationById(simulationIdNumber).subscribe(
                (simulation) => {
                    const formattedDate = this.datePipe.transform(simulation.date, 'dd/MM/yyyy HH:mm:ss');
                    simulation.date = formattedDate;
                    console.log('Datos de simulación recibidos:', simulation); // Imprime los datos antes de asignarlos al formulario
                    this.simulation = simulation;
                    this.simulationForm.patchValue(simulation);
                    this.generatedSimulation = simulation.generatedSimulation || '';
                    this.testGenerado = !!simulation.generatedSimulation;
                },
                (error) => {
                    console.error('Error al cargar la simulación', error);
                }
                );
            } else {
                console.error("El ID de simulación no es un número válido.");
            }
        }

        this._sensoresService.getAllSensors().subscribe(
            (response) => {
                this.sensors = response;
            },
            (error) => {
                console.error('Error al obtener los sensores', error);
            }
        );
    }

    get formattedFormatJson(): any {
        const jsonString = JSON.stringify(this.jsonData, null, 2).trim();
        return this.sanitizer.bypassSecurityTrustHtml('<pre>' + jsonString + '</pre>');
    }

    onSubmit(): void {
        this.testSimulation();
        if (this.simulationForm.valid) {
            if (this.testGenerado) {
                const formValue = this.simulationForm.value;
    
                let fechaDate: Date;
    
                if (formValue.date === 'now') {
                    fechaDate = new Date();
                } else {
                    fechaDate = this.getFechaAsDate(formValue.date);
                }
    
                formValue.date = this.getFormattedDate(fechaDate);
    
                if (typeof formValue.parameters === 'string') {
                    try {
                        formValue.parameters = JSON.parse(formValue.parameters);
                    } catch (error) {
                        console.error("Error al convertir los parámetros a JSON", error);
                        return;
                    }
                }
    
                // Deshabilitar el formulario mientras se realiza la actualización
                this.simulationForm.disable();
    
                if (this.simulationId) {
                    this._simulationService.updateSimulation({
                        id: this.simulationId,
                        ...formValue
                    }).subscribe(
                        () => {
                            console.log('Simulación actualizada exitosamente');
                            // Habilitar el formulario después de la actualización exitosa
                            this.simulationForm.enable();
                        },
                        (error) => {
                            console.error('Error durante la actualización de la simulación:', error);
                            // Habilitar el formulario si hay un error
                            this.simulationForm.enable();
                        }
                    );
                }
            } else {
                console.log("Genera antes la simulación");
                this.showAlert = true;
            }
        } else {
            console.log('Formulario no válido');
        }
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
                                this.generatedTest = generatedJson;
                                console.log('JSON generado:', generatedJson);
                            })
                        console.log("Resultado generado:", formValue.parameters); // Imprimir el nuevo JSON generado

                        // Asignar los resultados generados a las variables de estado
                        this.testGenerado = true;
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

    // Método para cambiar el estado de expansión
    toggleExpand(index: number): void {
        this.isExpanded[index] = !this.isExpanded[index];
    }

    // Método para obtener un resumen del contenido de cada item
    getSummary(item: any): string {
        // Aquí seleccionamos algunos campos clave para mostrar en el resumen
        return `{campo2: ${item.campo2}, campo3: ${item.campo3}, campo4: ${item.campo4}, ...}`;
    }

    // Si es necesario, puedes cargar los datos simulados aquí
    simularInstantaneamente(): void {
        this.testGenerado = false;
        this._simulationService.simularInstantaneamente(this.simulationId, (result) => {
            this.generatedSimulation = result;
            this.isExpanded = new Array(this.generatedSimulation.length).fill(false); // Inicializa los estados de expansión
        });
    }

    toggleSimulation(): void {
        this.testGenerado = false;
        if (this._simulationService.isSimulationRunning(this.simulationId)) {
            this._simulationService.stopSimulation(this.simulationId);
            this.simulando = false;
            this.isPaused = false;
            this.stopSimulation();
        } else {
            this.generatedSimulation = [];  // Reinicializamos como array vacío
            this._simulationService.simular(this.simulationId, (result) => {
                // Verificar que 'generatedSimulation' sea un array antes de agregar elementos
                if (Array.isArray(this.generatedSimulation)) {
                    this.generatedSimulation.push(result);  // Solo usa push si es un array
                } else {
                    this.generatedSimulation = [];  // Reinicializamos como array vacío
                    this.generatedSimulation.push(result);  // Ahora podemos agregar el dato
                }
            });
        
            this.startSimulation();
            this.simulando = true;
        }
    }

    // Método para pausar o reanudar la simulación
    togglePauseSimulation(): void {
        if (this.isPaused) {
            // Si está pausada, reanudar la simulación
            this.resumeSimulation();
        } else {
            // Si no está pausada, pausar la simulación
            this.pauseSimulation();
        }
    }

    // Método para pausar la simulación
    pauseSimulation(): void {
        this.isPaused = true;
        this._simulationService.pauseSimulation(this.simulationId);
    }

    // Método para reanudar la simulación
    resumeSimulation(): void {
        this.isPaused = false;
        this._simulationService.resumeSimulation(this.simulationId);
    }

    startSimulation(): void {

        if (this.simulation && !this.activeSimulation.interval) {
  
            this.activeSimulation.elapsedTime = 0;
            this.activeSimulation.interval = setInterval(() => {
                const percentage = this.getSimulationPercentage();

                if (percentage >= 100) {
                    // Detener la simulación automáticamente cuando llegue al 100%
                    this.simulando = false;
                    this.stopSimulation();
                } else {
                    // Incrementa el tiempo cada segundo mientras no esté al 100%
                    this.activeSimulation.elapsedTime += 1;
                }
                this.cdr.detectChanges(); // Forzar la detección de cambios
            }, 1000);
        }
    }

    stopSimulation(): void {
        if (this.activeSimulation.interval) {
            clearInterval(this.activeSimulation.interval);
            this.activeSimulation.interval = null;
        }
    }

    formatElapsedTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        // Asegúrate de que siempre haya dos dígitos
        return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(secs)}`;
    }

    padTime(time: number): string {
        return time < 10 ? '0' + time : time.toString();
    }

    getSimulationPercentage(): number {
        const totalGenerados = this._simulationService.getTotalGenerados(this.simulationId);
        const numElementosASimular = this.simulation.numElementosASimular || 0;

        if (numElementosASimular === 0) return 0;

        const percentage = (totalGenerados / numElementosASimular) * 100;
        return Math.round(percentage); // Redondear al entero más cercano
    }

    getSimulationProgress(): string {
        const totalGenerados = this._simulationService.getTotalGenerados(this.simulationId);
        const numElementosASimular = this.simulation.numElementosASimular || 0;
    
        // Si `numElementosASimular` es 0, devolver solo el total generado
        if (numElementosASimular === 0) {
            return `${totalGenerados} / ∞`;
        }
    
        // En caso contrario, devolver el progreso en el formato `totalGenerados / numElementosASimular`
        return `${totalGenerados} / ${numElementosASimular}`;
    }    


    getFormattedDate(date: Date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss')!;
    }

    getFechaAsDate(fechaString: string): Date {
        const [datePart, timePart] = fechaString.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
    }

    get formattedSimulationJson(): any {
        const jsonString = JSON.stringify(this.generatedTest, null, 2).trim();
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

    // Método para cambiar el placeholder al hacer clic
    setPlaceholderToNow() {
        this.placeholderText = 'now'; // Cambiar el texto del placeholder
        this.simulationForm.get('date')?.setValue(this.placeholderText); // Establecer la fecha actual
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

    onCheckboxChange(event: any): void {
        const isChecked = event.checked ? 1 : 0;
        this.simulationForm.get('noRepetirCheckbox')?.setValue(isChecked);
    }    

    volver() {
        this._router.navigate(['/simulaciones']);
    }
}
