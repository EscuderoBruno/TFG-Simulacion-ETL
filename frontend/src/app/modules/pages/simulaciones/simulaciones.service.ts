import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { environment } from 'environment/environment';
import { SensoresService } from '../sensores/sensores.service';
import { ConexionesService } from '../conexiones/conexiones.service';
import { MqttService } from 'app/core/envio_mensajes/mqtt.service';
import { ApiService } from 'app/core/envio_mensajes/api.service';

@Injectable({ providedIn: 'root' })
export class SimulacionesService {

    constructor(private _httpClient: HttpClient,
                private _sensoresService: SensoresService,
                private _conexionesService: ConexionesService,
                private mqttService: MqttService,
                private apiService: ApiService
    ) {}

    // Datos
    idSimulation: number = 0;
    name: string = '';
    simulacionesGeneradas: any[] = [];
    intervalId: any; // Para almacenar el ID del setTimeout
    intervals: { [key: number]: any } = {}; // Almacena los intervalos por ID de simulación
    isRunning: { [key: number]: boolean } = {}; // Almacena el estado de cada simulación
    totalGenerados: { [simulationId: number]: number } = {}; // Almacenar totalGenerados por ID de simulación
    paused: { [key: number]: boolean } = {};  // Diccionario que mantiene el estado de pausa de cada simulación
    simulacionesGeneradasPorId: { [key: number]: any[] } = {}; // Objeto para almacenar las simulaciones generadas por cada simulationId

    // Método para crear una nueva simulación
    create(simulation: {
        name: string;
        sensorId: number;
        connectionId: number;
        parameters: object;
        minRegistrosPorInstante: number;
        maxRegistrosPorInstante: number;
        minIntervaloEntreRegistros: number;
        maxIntervaloEntreRegistros: number;
        numElementosASimular: number;
        noRepetirCheckbox: boolean;
        date: Date
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

    // Método para actualizar una simulación
    updateSimulation(simulation: {
        id: number;
        name: string;
        sensorId: number;
        connectionId: number;
        parameters: object;
        minRegistrosPorInstante: number;
        maxRegistrosPorInstante: number;
        minIntervaloEntreRegistros: number;
        maxIntervaloEntreRegistros: number;
        numElementosASimular: number;
        noRepetirCheckbox: boolean;
        date: Date;
    }): Observable<any> {
        return this._httpClient.put(`${environment.apiBaseUrl}/simulations/update/${simulation.id}`, simulation);
    }

    // Método para eliminar una simulación por su ID
    deleteSimulation(simulationId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/simulations/delete/${simulationId}`);
    }

    // -------------------------------------------------------- GENERAR SIMULACIÓN ------------------------------------------------------------ //

    // Método para generar un nuevo JSON basado en los parámetros
    async generateNewJson(params: any, sensorId: number, numArrayLocalizaciones: number, time: Date): Promise<any> {
        const coord = await this._sensoresService.getCoordinatesById(sensorId, numArrayLocalizaciones).toPromise();
        const newJson: any = {};
    
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
                            newJson[key] = this.getRandomFloat(min, max).toFixed(2);
                        }
                    } else if (value.startsWith('^bool')) {
                        newJson[key] = Math.random() < 0.5; // true o false aleatorio
                    } else if (value.startsWith('^array[')) {
                        const arrayDetails = value.match(/^\^array\[(\d+)\](\w+)(?:\[(\d+),(\d+)\])?/);
                        if (arrayDetails) {
                            const arrayLength = parseInt(arrayDetails[1]);
                            const elementType = arrayDetails[2];
                            let min = 0;
                            let max = 100;
                            if (arrayDetails[3] && arrayDetails[4]) {
                                min = parseInt(arrayDetails[3]);
                                max = parseInt(arrayDetails[4]);
                            }
                            if (elementType === 'bool') {
                                newJson[key] = this.generateBooleanArray(arrayLength);
                            } else {
                                newJson[key] = this.generateArray(arrayLength, elementType, min, max);
                            }
                        }
                    } else if (value === '^time') {
                        newJson[key] = time.toISOString();
                    } else if (value.startsWith('^positionlong')) {
                        newJson[key] = coord.long;
                    } else if (value.startsWith('^positionlat')) {
                        newJson[key] = coord.lat;
                    } else if (value.startsWith('^positioncote')) {
                        newJson[key] = coord.height;
                    } else if (value.startsWith('^positionalias')) {
                        newJson[key] = coord.alias;
                    } else if (value.startsWith('^positiondeveui')) {
                        newJson[key] = coord.dev_eui;
                    } else if (value.startsWith('^positionjoineui')) {
                        newJson[key] = coord.alias;
                    } else if (value.startsWith('^positiondevaddr')) {
                        newJson[key] = coord.alias;
                    }
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    newJson[key] = await this.generateNewJson(value, sensorId, numArrayLocalizaciones, time);
                } else {
                    newJson[key] = value;
                }
            }
        }
    
        return newJson;
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
        this.paused[simulationId] = false;

        // Inicializar el array para almacenar las simulaciones generadas de este simulationId
        this.simulacionesGeneradasPorId[simulationId] = [];

        // Obtener la simulación por ID y suscribirse para recibir los datos
        this.getSimulationById(simulationId).subscribe(
            (simulacion) => {
                let totalGenerados = 0;
                let usedIndices: Set<number> = new Set(); // Set para rastrear índices ya usados
                let time = new Date(simulacion.date);

                const executeSimulationStep = () => {
                    // Comprobar si se ha alcanzado el límite de elementos a simular
                    if (simulacion.numElementosASimular > 0 && totalGenerados >= simulacion.numElementosASimular) {
                        console.log("Resultado final generado:", this.simulacionesGeneradasPorId[simulationId]); // Imprimir todas las simulaciones generadas para este simulationId
                        this.isRunning[simulationId] = false; // Cambia el estado a inactivo al finalizar
                        return; // Termina la simulación
                    }

                    // Si está pausada, simplemente no guardamos los datos pero seguimos ejecutando
                    if (this.paused[simulationId]) {
                        setTimeout(executeSimulationStep, 1000); // Esperar antes de continuar el ciclo
                        return; // No guardamos los datos cuando está pausada
                    }

                    // Generar un número aleatorio dentro del rango de registros por instante
                    let random = Math.floor(Math.random() * (simulacion.maxRegistrosPorInstante - simulacion.minRegistrosPorInstante + 1)) + simulacion.minRegistrosPorInstante;

                    // Ajustar si el total generado excede el número deseado (solo si no es ilimitado)
                    if (simulacion.numElementosASimular > 0 && totalGenerados + random > simulacion.numElementosASimular) {
                        random = simulacion.numElementosASimular - totalGenerados;
                    }

                    // Generar los registros para esta instancia
                    for (let j = 0; j < random; j++) {
                        if (!simulacion.sensorId) {
                            console.error("Se necesita un sensorId válido.");
                            return;
                        }

                        this._sensoresService.getSensorById(simulacion.sensorId).subscribe(
                            (sensor) => {
                                if (!sensor.coordinates || sensor.coordinates.length === 0) {
                                    console.error('No se encontraron coordenadas para la localización', sensor);
                                    return;
                                }

                                let randomIndex: number;
                                if (simulacion.noRepetirCheckbox === 1) {
                                    const availableIndices = sensor.coordinates.map((_, idx) => idx).filter(idx => !usedIndices.has(idx));
                                    
                                    if (availableIndices.length === 0) {
                                        console.warn("No quedan localizaciones únicas disponibles.");
                                        // Si no hay localizaciones únicas disponibles, se permite la repetición
                                        if (sensor.coordinates.length > 0) {
                                            randomIndex = Math.floor(Math.random() * sensor.coordinates.length);  // Se elige aleatoriamente una coordenada
                                        } else {
                                            return;  // Si no hay coordenadas, no se puede continuar
                                        }
                                    } else {
                                        randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                                        usedIndices.add(randomIndex); // Marcamos la localización como usada
                                    }
                                } else {
                                    randomIndex = Math.floor(Math.random() * sensor.coordinates.length); // Si no hay restricción de repetición, seleccionamos aleatoriamente
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
                                    this.generateNewJson(parameters, simulacion.sensorId, randomIndex, time)
                                    .then((newSimulacion) => {
                                        // Almacenar la simulación generada en el array correspondiente al simulationId
                                        this.simulacionesGeneradasPorId[simulationId].push(newSimulacion);
                                        this.sendMessage(newSimulacion, simulacion.connectionId);
                                        callback(newSimulacion); // Llamar al callback
                                    })
                                    .catch((error) => {
                                        console.error('Error al generar el JSON:', error);
                                    });                                 
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
                };

                // Iniciar el primer paso de la simulación
                executeSimulationStep();
            },
            (error) => {
                console.error("Error al obtener la simulación", error);
            }
        );
    }

    // Método para pausar la simulación
    pauseSimulation(simulationId: number): void {
        this.paused[simulationId] = true;
        console.log(`Simulación ${simulationId} pausada.`);
    }

    // Método para reanudar la simulación
    resumeSimulation(simulationId: number): void {
        this.paused[simulationId] = false;
        console.log(`Simulación ${simulationId} reanudada.`);
    }

    // Método para iniciar la simulación sin esperar entre intervalos
    simularInstantaneamente(simulationId: number, callback: (result: any) => void): void {
        this.totalGenerados[simulationId] = 0; // Inicializar totalGenerados para esta simulación
        this.simulacionesGeneradas = []; // Inicializar resultados de simulación

        // Obtener la simulación por ID y suscribirse para recibir los datos
        this.getSimulationById(simulationId).subscribe(
            (simulacion) => {
                let totalGenerados = 0;
                let time = new Date(simulacion.date);

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
                        if (!simulacion.sensorId) {
                            console.error("Se necesita un sensorId válido.");
                            return;
                        }

                        const currentRecordTime = new Date(time); // Capturar tiempo actual para este registro específico

                        this._sensoresService.getSensorById(simulacion.sensorId).subscribe(
                            (sensor) => {
                                // Verificar que las coordenadas existen
                                if (!sensor.coordinates || sensor.coordinates.length === 0) {
                                    console.error("No se encontraron coordenadas para la localización", sensor);
                                    return;
                                }

                                // Selección de índice sin repetir en este instante
                                let randomIndex: number;
                                if (simulacion.noRepetirCheckbox === 1) {
                                    const availableIndices = sensor.coordinates
                                        .map((_, idx) => idx)
                                        .filter((idx) => !usedIndices.has(idx));

                                    if (availableIndices.length === 0) {
                                        console.warn("No quedan localizaciones únicas disponibles en este instante.");
                                        return;
                                    }

                                    randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                                    usedIndices.add(randomIndex);
                                } else {
                                    randomIndex = Math.floor(Math.random() * sensor.coordinates.length);
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
                                    this.generateNewJson(parameters, simulacion.sensorId, randomIndex, currentRecordTime)
                                    .then((newSimulacion) => {
                                        this.simulacionesGeneradas.push(newSimulacion);
                                        this.sendMessage(newSimulacion, simulacion.connectionId);
                                    })
                                    .catch((error) => {
                                        console.error('Error al generar el JSON:', error);
                                    });                                
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

    getIsPaused(simulationId: number): boolean {
        return this.paused[simulationId];
    }

    // Enviar mensaje con las simulaciones generadas por MQTT o API
    sendMessage(message: string, connectionId: number): void {
        const messageMQTT = JSON.stringify(message);
        
        this._conexionesService.getConnectionById(connectionId).subscribe(
            (conexion) => {
                // Conexión y envio por MQTT
                if (conexion.type == 0) {
                    this.mqttService.sendMessageMqtt(
                        conexion.options.URL,        // Broker URL
                        conexion.options.clientId,   // Client ID
                        conexion.options.username,   // Username
                        conexion.options.password,   // Password
                        conexion.options.topic,      // Tópico
                        messageMQTT                  // Mensaje
                    );
                    // Conexión y envio por API
                } else if (conexion.type == 1) {
                    this.apiService.sendMessageApi(
                        conexion.options.URL,
                        conexion.options.header, 
                        messageMQTT
                    );
                }
            }, (error) => {
                console.error('Error al obtener la conexión:', error);  // Manejo de error si no se obtiene la conexión
            }
        );
    }
        
}

