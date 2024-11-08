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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import mqtt from 'mqtt';
import { DatePipe } from '@angular/common';

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
        MatDatepickerModule
    ],
    providers: [DatePipe]
})

export class EditarSimulacionComponent implements OnInit {

    simulation: any;
    simulationForm: UntypedFormGroup;
    formFieldHelpers = '';
    sensors: any[] = [];
    generatedSimulation: string = '';
    jsonFormat: any;
    showTooltip = false;
    simulacionGenerada = false;
    showAlert = false;
    showAdvise = true;
    private mqttClient: any;
    numArrayLocalizacion: 0;
    simulacionesGeneradas: any[] = [];
    minDate: Date;
    placeholderText: string = 'Fecha';

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

    simulationId: string;

    constructor(
        private _simulationService: SimulacionesService,
        private _sensoresService: SensoresService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private sanitizer: DomSanitizer,
        private datePipe: DatePipe
    ) { }

    ngOnInit(): void {
        this.simulationId = this._activatedRoute.snapshot.paramMap.get('id') || '';
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
        });

        if (this.simulationId) {
            const simulationIdNumber = Number(this.simulationId); // Convierte la cadena a número
            if (!isNaN(simulationIdNumber)) {
                this._simulationService.getSimulationById(simulationIdNumber).subscribe(
                (simulation) => {
                    const formValue = this.simulationForm.value;
                    console.log('Datos de simulación recibidos:', simulation); // Imprime los datos antes de asignarlos al formulario
                    this.simulation = simulation;
                    this.simulationForm.patchValue(simulation);
                    this.generatedSimulation = simulation.generatedSimulation || '';
                    this.simulacionGenerada = !!simulation.generatedSimulation;
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
        if (this.simulationForm.valid) {
        if (this.simulacionGenerada) {
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

            this.simulationForm.disable();

            if (this.simulationId) {
            this._simulationService.updateSimulation({
                id: this.simulationId,
                ...formValue
            }).subscribe(
                () => {
                console.log('Simulación actualizada exitosamente');
                this._router.navigate(['/simulaciones']);  // Redirigir después de la actualización.
                },
                (error) => {
                console.error('Error durante la actualización de la simulación:', error);
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
            this.generatedSimulation = this._simulationService.generateNewJson(formValue.parameters, formValue.sensorId, randomIndex, fechaDate);
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

    // Método para cambiar el placeholder al hacer clic
    setPlaceholderToNow() {
        this.placeholderText = 'now'; // Cambiar el texto del placeholder
        this.simulationForm.get('date')?.setValue(this.placeholderText); // Establecer la fecha actual
    }

    volver() {
        // Método vacío que puedes usar si necesitas alguna lógica al volver
    }
}
