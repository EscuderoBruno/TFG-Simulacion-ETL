import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { environment } from 'environment/environment';
import { LocalizacionesService } from '../localizaciones/localizaciones.service';

@Injectable({ providedIn: 'root' })
export class SimulacionesService {

    constructor(private _httpClient: HttpClient,
                private _locationsService: LocalizacionesService,
    ) {}

    // Datos
    idSimulation: number = 0;
    name: string = '';
    simulacionesGeneradas: any[] = [];
    intervalId: any; // Para almacenar el ID del setTimeout
    intervals: { [key: number]: any } = {}; // Almacena los intervalos por ID de simulación
    isRunning: { [key: number]: boolean } = {}; // Almacena el estado de cada simulación
    totalGenerados: { [simulationId: number]: number } = {}; // Almacenar totalGenerados por ID de simulación

    // Método para crear una nueva simulación
    create(simulation: {
        name: string;
        locationId: number;
        parameters: object;
        minRegistrosPorInstante: number;
        maxRegistrosPorInstante: number;
        minIntervaloEntreRegistros: number;
        maxIntervaloEntreRegistros: number;
        numElementosASimular: number;
        noRepetirCheckbox: boolean;
    }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/simulations/create`, simulation);
    }

    // Método para obtener todas las simulaciones
    getAllSimulations(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/simulations`);
    }

    // Método para obtener una simulacion dado su ID
    getSimulationById(simulationId: number): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/simulations/${simulationId}`);
    }

    // Método para eliminar una simulación por su ID
    deleteSimulation(simulationId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/simulations/delete/${simulationId}`);
    }

    // -------------------------------------------------------- GENERAR SIMULACIÓN ------------------------------------------------------------ //

    // Método para generar un nuevo JSON basado en los parámetros
    generateNewJson(params: any, locationId: number, numArrayLocalizaciones: number, time: Date): any {
        const newJson: any = {};

        // Llamar a getCoordinatesById y suscribirse para obtener las coordenadas
        this._locationsService.getCoordinatesById(locationId, numArrayLocalizaciones).subscribe(coord => {
            // Una vez que tenemos las coordenadas, llenamos el newJson
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    const value = params[key];

                    if (typeof value === 'string' && value.startsWith('^')) {
                        if (value.startsWith('^int[')) {
                            const range = value.match(/\[(\d+),(\d+)\]/);
                            if (range) {
                                const min = parseInt(range[1]);
                                const max = parseInt(range[2]);
                                newJson[key] = this.getRandomInt(min, max);
                            }
                        } else if (value.startsWith('^float[')) {
                            const range = value.match(/\[(\d+),(\d+)\]/);
                            if (range) {
                                const min = parseFloat(range[1]);
                                const max = parseFloat(range[2]);
                                newJson[key] = this.getRandomFloat(min, max);
                            }
                        } else if (value.startsWith('^bool')) {
                            newJson[key] = Math.random() < 0.5; // true o false aleatorio
                        } else if (value.startsWith('^array[')) {
                            // Ajustar la expresión regular para capturar tanto el tamaño como el tipo de elemento
                            const arrayDetails = value.match(/^\^array\[(\d+)\](\w+)(?:\[(\d+),(\d+)\])?/);
                            
                            if (arrayDetails) {
                                const arrayLength = parseInt(arrayDetails[1]); // Longitud del array
                                const elementType = arrayDetails[2]; // Tipo de elemento: 'int', 'float', 'bool'
                                
                                // Inicializa min y max solo si el tipo es int o float
                                let min = 0;
                                let max = 100;
                        
                                // Comprueba si es necesario obtener min y max
                                if (arrayDetails[3] && arrayDetails[4]) {
                                    min = parseInt(arrayDetails[3]);
                                    max = parseInt(arrayDetails[4]);
                                }
                        
                                // Generar el array dependiendo del tipo
                                if (elementType === 'bool') {
                                    newJson[key] = this.generateBooleanArray(arrayLength);
                                } else {
                                    newJson[key] = this.generateArray(arrayLength, elementType, min, max);
                                }
                            }
                        } else if (value === '^time') {
                            newJson[key] = time.toISOString();
                        } else if (value.startsWith('^positionlong')) {
                            newJson[key] = coord.long;  // Aquí asignamos la longitud
                        } else if (value.startsWith('^positionlat')) {
                            newJson[key] = coord.lat;   // Aquí asignamos la latitud
                        } else if (value.startsWith('^positioncote')) {
                            newJson[key] = coord.height; // Aquí asignamos la altura
                        } else if (value.startsWith('^positionalias')) {
                            newJson[key] = coord.alias; // Aquí asignamos la altura
                        }
                    } else if (typeof value === 'object' && !Array.isArray(value)) {
                        newJson[key] = this.generateNewJson(value, locationId, numArrayLocalizaciones, time);
                    } else {
                        newJson[key] = value; // Copiar otros valores como están
                    }
                }
            }
        });

        return newJson;  // Aquí regresamos el nuevo JSON
    } 
    
    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    getRandomFloat(min: number, max: number): number {
        return (Math.random() * (max - min)) + min;
    }
    
    generateArray(length: number, type: string, min: number, max: number): any[] {
        const arr = [];
        for (let i = 0; i < length; i++) {
            if (type === 'int') {
                arr.push(this.getRandomInt(min, max));
            } else if (type === 'float') {
                arr.push(this.getRandomFloat(min, max));
            } else if (type === 'bool') {
                arr.push(Math.random() < 0.5); // true o false aleatorio
            }
        }
        return arr;
    }

    generateBooleanArray(length) {
        const array = [];
        for (let i = 0; i < length; i++) {
            array.push(Math.random() < 0.5); // Booleano aleatorio (true o false)
        }
        return array;
    }    
    
    getRandomPosition(type: string): number {
        if (type === '^positionlong') {
            return (Math.random() * 360) - 180; // Longitud aleatoria entre -180 y 180
        } else if (type === '^positionlat') {
            return (Math.random() * 180) - 90;  // Latitud aleatoria entre -90 y 90
        } else if (type === '^positioncota') {
            return this.getRandomInt(0, 8848);  // Cota (altura) aleatoria hasta el Everest
        }
    }    

    // Método para iniciar la simulación
    simular(simulationId: number, callback: (result: any) => void): void {
        if (this.isRunning[simulationId]) return; // No iniciar si ya está en curso
        this.isRunning[simulationId] = true; // Cambia el estado a activo
        this.totalGenerados[simulationId] = 0; // Inicializar totalGenerados para esta simulación

        // Obtener la simulación por ID y suscribirse para recibir los datos
        this.getSimulationById(simulationId).subscribe(
            (simulacion) => {
                let totalGenerados = 0;
                let usedIndices: Set<number> = new Set(); // Set para rastrear índices ya usados
                let time = new Date();

                const executeSimulationStep = () => {
                    if (totalGenerados >= simulacion.numElementosASimular) {
                        console.log("Resultado generado:", this.simulacionesGeneradas); // Imprimir el resultado final
                        this.isRunning[simulationId] = false; // Cambia el estado a inactivo al finalizar
                        return; // Termina la simulación
                    }

                    // Generar un número aleatorio dentro del rango de registros por instante
                    let random = Math.floor(Math.random() * (simulacion.maxRegistrosPorInstante - simulacion.minRegistrosPorInstante + 1)) + simulacion.minRegistrosPorInstante;

                    // Ajustar si el total generado excede el número deseado
                    if (totalGenerados + random > simulacion.numElementosASimular) {
                        random = simulacion.numElementosASimular - totalGenerados;
                    }

                    // Generar los registros para esta instancia
                    for (let j = 0; j < random; j++) {
                        if (!simulacion.locationId) {
                            console.error("Se necesita un locationId válido.");
                            return;
                        }

                        this._locationsService.getLocationById(simulacion.locationId).subscribe(
                            (location) => {
                                // Verificar que las coordenadas existen
                                if (!location.coordinates || location.coordinates.length === 0) {
                                    console.error('No se encontraron coordenadas para la localización', location);
                                    return;
                                }

                                // Selección de índice sin repetir, si el checkbox está activo
                                let randomIndex: number;
                                if (simulacion.noRepetirCheckbox === 1) {
                                    const availableIndices = location.coordinates.map((_, idx) => idx).filter(idx => !usedIndices.has(idx));
                                    
                                    if (availableIndices.length === 0) {
                                        console.warn("No quedan localizaciones únicas disponibles.");
                                        return;
                                    }

                                    randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                                    usedIndices.add(randomIndex);
                                } else {
                                    randomIndex = Math.floor(Math.random() * location.coordinates.length);
                                }

                                // Intentar parsear los parámetros si son una cadena
                                let parameters = simulacion.parameters;
                                if (typeof parameters === 'string') {
                                    try {
                                        parameters = JSON.parse(parameters);
                                    } catch (error) {
                                        console.error("Error al convertir los parámetros a JSON", error);
                                        return;
                                    }
                                }

                                if (parameters) {
                                    // Generar el nuevo JSON
                                    this.simulacionesGeneradas.push(this.generateNewJson(parameters, simulacion.locationId, randomIndex, time));
                                } else {
                                    console.error("No se encontraron parámetros válidos.");
                                }
                            },
                            (error) => {
                                console.error('Error al obtener la localización', error);
                            }
                        );
                    }

                    totalGenerados += random;
                    this.totalGenerados[simulationId] = totalGenerados;
                    console.log(`Total generados ${simulationId}: ${totalGenerados}`);

                    // Ejecutar el próximo paso de simulación después de un intervalo
                    const intervalo = Math.floor(Math.random() * (simulacion.maxIntervaloEntreRegistros - simulacion.minIntervaloEntreRegistros + 1)) + simulacion.minIntervaloEntreRegistros;
                    this.intervals[simulationId] = setTimeout(executeSimulationStep, intervalo * 1000);

                    time = new Date(time.getTime() + intervalo * 1000);
                    console.log(time);
                };

                // Iniciar el primer paso de la simulación
                executeSimulationStep();
            },
            (error) => {
                console.error("Error al obtener la simulación", error);
            }
        );
    }

    // Método para iniciar la simulación sin esperar entre intervalos
    simularInstantaneamente(simulationId: number, callback: (result: any) => void): void {
        this.totalGenerados[simulationId] = 0; // Inicializar totalGenerados para esta simulación
        this.simulacionesGeneradas = []; // Inicializar resultados de simulación

        // Obtener la simulación por ID y suscribirse para recibir los datos
        this.getSimulationById(simulationId).subscribe(
            (simulacion) => {
                let totalGenerados = 0;
                let time = new Date(); // Hora inicial de simulación

                const executeSimulationStep = () => {
                    if (totalGenerados >= simulacion.numElementosASimular) {
                        console.log("Resultado generado:", this.simulacionesGeneradas); // Imprimir el resultado final
                        this.isRunning[simulationId] = false; // Cambia el estado a inactivo al finalizar
                        callback(this.simulacionesGeneradas); // Llamar al callback con el resultado
                        return; // Termina la simulación
                    }

                    // Generar un número aleatorio dentro del rango de registros por instante
                    let registrosEnEsteInstante = Math.floor(
                        Math.random() * (simulacion.maxRegistrosPorInstante - simulacion.minRegistrosPorInstante + 1)
                    ) + simulacion.minRegistrosPorInstante;

                    // Ajustar si el total generado excede el número deseado
                    if (totalGenerados + registrosEnEsteInstante > simulacion.numElementosASimular) {
                        registrosEnEsteInstante = simulacion.numElementosASimular - totalGenerados;
                    }

                    let usedIndices: Set<number> = new Set(); // Resetear índices para este instante

                    for (let j = 0; j < registrosEnEsteInstante; j++) {
                        if (!simulacion.locationId) {
                            console.error("Se necesita un locationId válido.");
                            return;
                        }

                        const currentRecordTime = new Date(time); // Capturar tiempo actual para este registro específico

                        this._locationsService.getLocationById(simulacion.locationId).subscribe(
                            (location) => {
                                // Verificar que las coordenadas existen
                                if (!location.coordinates || location.coordinates.length === 0) {
                                    console.error("No se encontraron coordenadas para la localización", location);
                                    return;
                                }

                                // Selección de índice sin repetir en este instante
                                let randomIndex: number;
                                if (simulacion.noRepetirCheckbox === 1) {
                                    const availableIndices = location.coordinates
                                        .map((_, idx) => idx)
                                        .filter((idx) => !usedIndices.has(idx));

                                    if (availableIndices.length === 0) {
                                        console.warn("No quedan localizaciones únicas disponibles en este instante.");
                                        return;
                                    }

                                    randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                                    usedIndices.add(randomIndex);
                                } else {
                                    randomIndex = Math.floor(Math.random() * location.coordinates.length);
                                }

                                // Intentar parsear los parámetros si son una cadena
                                let parameters = simulacion.parameters;
                                if (typeof parameters === "string") {
                                    try {
                                        parameters = JSON.parse(parameters);
                                    } catch (error) {
                                        console.error("Error al convertir los parámetros a JSON", error);
                                        return;
                                    }
                                }

                                if (parameters) {
                                    // Generar el nuevo JSON con el tiempo específico para este registro
                                    this.simulacionesGeneradas.push(
                                        this.generateNewJson(parameters, simulacion.locationId, randomIndex, currentRecordTime)
                                    );
                                } else {
                                    console.error("No se encontraron parámetros válidos.");
                                }
                            },
                            (error) => {
                                console.error("Error al obtener la localización", error);
                            }
                        );
                    }

                    totalGenerados += registrosEnEsteInstante;
                    this.totalGenerados[simulationId] = totalGenerados;
                    console.log(`Total generados ${simulationId}: ${totalGenerados}`);

                    // Avanzar el tiempo para el siguiente instante
                    const intervalo = Math.floor(
                        Math.random() * (simulacion.maxIntervaloEntreRegistros - simulacion.minIntervaloEntreRegistros + 1)
                    ) + simulacion.minIntervaloEntreRegistros;
                    time = new Date(time.getTime() + intervalo * 1000);

                    // Continuar con el siguiente paso sin esperar
                    executeSimulationStep();
                };

                // Iniciar el primer paso de la simulación
                executeSimulationStep();
            },
            (error) => {
                console.error("Error al obtener la simulación", error);
            }
        );
    }



    // Método para detener la simulación
    stopSimulation(simulationId: number) {
        clearTimeout(this.intervals[simulationId]);
        this.isRunning[simulationId] = false; // Cambiar el estado a inactivo
    }

    // Método para comprobar si la simulación está en curso
    isSimulationRunning(simulationId: number): boolean {
        return !!this.isRunning[simulationId];
    }

    // Método para obtener totalGenerados
    getTotalGenerados(simulationId: number): number {
        return this.totalGenerados[simulationId] || 0; // Devuelve 0 si no existe
    }

    getActiveSimulations(): number[] {
        // Retorna una lista con los IDs de las simulaciones activas
        return Object.keys(this.isRunning)
            .filter(simulationId => this.isRunning[parseInt(simulationId, 10)])
            .map(id => parseInt(id, 10));
    }
    
}

