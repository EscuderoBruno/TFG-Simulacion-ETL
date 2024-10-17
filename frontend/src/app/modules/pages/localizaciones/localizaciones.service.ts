import { HttpClient } from '@angular/common/http';
import { CSP_NONCE, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environment/environment';
import { map } from 'rxjs/operators';  // Importación correcta de map

@Injectable({ providedIn: 'root' })
export class LocalizacionesService {
    private _httpClient = inject(HttpClient);

    // Datos
    idLocation: number = 0;
    name: string = '';
    coordinates: Array<{
        lat: number;
        long: number;
        height: number;
        alias: string;
    }> = []; // Cambiado a un array de coordenadas

    // Método para crear una nueva localización
    create(location: { name: string; coordinates: Array<{ lat: number; long: number; height: number; alias: string }> }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/locations/create`, location);
    }

    // Método para obtener todas las localizaciones
    getAllLocations(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/locations`);
    }

    // Método para obtener una localización por su id
    getLocationById(locationId: number): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/locations/${locationId}`);
    }
    
    // Método para eliminar una localización por su ID
    deleteLocation(locationId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/locations/delete/${locationId}`);
    }

    // Método para obtener las coordenadas por ID
    getCoordinatesById(locationId: number): Observable<{ lat: number; long: number; height: number }> {
        return this.getLocationById(locationId).pipe(
            map((location) => {
                // Asumiendo que las coordenadas están en la primera posición del array
                const coord = location.coordinates[0];
                return {
                    lat: coord.lat,
                    long: coord.long,
                    height: coord.height,
                };
            })
        );
    }
}
