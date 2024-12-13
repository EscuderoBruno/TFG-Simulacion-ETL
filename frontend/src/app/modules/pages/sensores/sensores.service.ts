import { HttpClient } from '@angular/common/http';
import { CSP_NONCE, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environment/environment';
import { map } from 'rxjs/operators';  // Importación correcta de map

@Injectable({ providedIn: 'root' })
export class SensoresService {
    private _httpClient = inject(HttpClient);

    // Datos
    idsensor: number = 0;
    name: string = '';
    coordinates: Array<{
        lat: number;
        long: number;
        height: number;
        alias: string;
        dev_eui: string;
        join_eui: string;
        dev_addr: string;
    }> = []; // Cambiado a un array de coordenadas

    // Método para crear un nueva sensor
    create(sensor: { name: string; coordinates: Array<{ lat: number; long: number; height: number; alias: string; dev_eui: string; join_eui: string; dev_addr: string; }> }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/sensors/create`, sensor);
    }

    // Método para obtener todas las sensores
    getAllSensors(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/sensors`);
    }

    // Método para obtener un sensor por su id
    getSensorById(sensorId: number): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/sensors/${sensorId}`);
    }
    
    // Método para eliminar un sensor por su ID
    deleteSensor(sensorId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/sensors/delete/${sensorId}`);
    }

    // Método para editar un sensor por su ID
    editSensor(sensorId: number, sensorData: { name: string; coordinates: Array<{ lat: number; long: number; height: number; alias: string; dev_eui: string; join_eui: string; dev_addr: string; }> }): Observable<any> {
        return this._httpClient.put(`${environment.apiBaseUrl}/sensors/update/${sensorId}`, sensorData);
    }

    // Método para obtener las coordenadas por ID
    getCoordinatesById(sensorId: number, numArray: number): Observable<{ lat: number; long: number; height: number, alias: string, dev_eui: string, join_eui: string, dev_addr: string, }> {
        return this.getSensorById(sensorId).pipe(
            map((sensor) => {
                // Asumiendo que las coordenadas están en la primera posición del array
                const coord = sensor.coordinates[numArray];
                return {
                    lat: coord.lat,
                    long: coord.long,
                    height: coord.height,
                    alias: coord.alias,
                    dev_eui: coord.dev_eui,
                    join_eui: coord.join_eui,
                    dev_addr: coord.dev_addr,
                };
            })
        );
    }
}
