import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environment/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConexionesService {
    private _httpClient = inject(HttpClient);

    // Datos
    idConnection: number = 0;
    name: string = '';
    type: number = 0; // 0 para MQTT, 1 para API
    options: Record<string, any> = {}; // Almacena las opciones específicas

    // Método para crear una nueva conexión
    create(connection: { name: string; type: number; options: Record<string, any> }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/connections/create`, connection);
    }

    // Método para obtener todas las conexiones
    getAllConnections(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/connections`);
    }

    // Método para obtener una conexión por su id
    getConnectionById(connectionId: number): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/connections/${connectionId}`);
    }

    // Método para eliminar una conexión por su ID
    deleteConnection(connectionId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/connections/delete/${connectionId}`);
    }

    // Método para editar una conexión por su ID
    editConnection(connectionId: number, connectionData: { name: string; type: number; options: Record<string, any> }): Observable<any> {
        return this._httpClient.put(`${environment.apiBaseUrl}/connections/update/${connectionId}`, connectionData);
    }

    // Método para obtener una opción específica por su clave
    getOptionByKey(connectionId: number, key: string): Observable<any> {
        return this.getConnectionById(connectionId).pipe(
            map((connection) => {
                return connection.options[key] ?? null; // Retorna el valor de la opción o null si no existe
            })
        );
    }
}
