import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

    // Método para crear una nueva simulación
    create(simulation: { name: string; locationId: number; parameters: object }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/simulations/create`, simulation);
    }

    // Método para obtener todas las simulaciones
    getAllSimulations(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/simulations`);
    }

    // Método para eliminar una simulación por su ID
    deleteSimulation(simulationId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/simulations/delete/${simulationId}`);
    }

    // Método para generar un nuevo JSON basado en los parámetros
    generateNewJson(params: any, locationId: number): any {
        const newJson: any = {};

        // Llamar a getCoordinatesById y suscribirse para obtener las coordenadas
        this._locationsService.getCoordinatesById(locationId).subscribe(coord => {
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
                        } else if (value.startsWith('^bool[')) {
                            newJson[key] = Math.random() < 0.5; // true o false aleatorio
                        } else if (value.startsWith('^array[')) {
                            const arrayDetails = value.match(/\^array\[(\d+)\](\w+)\[(\d+),(\d+)\]/);
                            if (arrayDetails) {
                                const arrayLength = parseInt(arrayDetails[1]);
                                const elementType = arrayDetails[2]; // 'int', 'float', 'bool'
                                const min = parseInt(arrayDetails[3]);
                                const max = parseInt(arrayDetails[4]);
                                newJson[key] = this.generateArray(arrayLength, elementType, min, max);
                            }
                        } else if (value === '^timenow') {
                            newJson[key] = new Date().toISOString();
                        } else if (value.startsWith('^positionlong')) {
                            newJson[key] = coord.long;  // Aquí asignamos la longitud
                        } else if (value.startsWith('^positionlat')) {
                            newJson[key] = coord.lat;   // Aquí asignamos la latitud
                        } else if (value.startsWith('^positioncote')) {
                            newJson[key] = coord.height; // Aquí asignamos la altura
                        }
                    } else if (typeof value === 'object' && !Array.isArray(value)) {
                        newJson[key] = this.generateNewJson(value, locationId);
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
    
    getRandomPosition(type: string): number {
        if (type === '^positionlong') {
            return (Math.random() * 360) - 180; // Longitud aleatoria entre -180 y 180
        } else if (type === '^positionlat') {
            return (Math.random() * 180) - 90;  // Latitud aleatoria entre -90 y 90
        } else if (type === '^positioncota') {
            return this.getRandomInt(0, 8848);  // Cota (altura) aleatoria hasta el Everest
        }
    }    
}

