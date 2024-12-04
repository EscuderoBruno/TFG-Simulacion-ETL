import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  sendMessageApi(URL: string, authorizationHeader: string, payload: any): void {
    // Configurar los headers con la autorización
    const headers = new HttpHeaders({
      Authorization: authorizationHeader,
      'Content-Type': 'application/json',
    });

    // Enviar el mensaje mediante POST
    this.http.post(URL, payload, { headers }).subscribe({
      next: (response) => {
        console.log('Mensaje enviado con éxito:', response);
      },
      error: (err) => {
        console.error('Error al enviar el mensaje:', err);
      },
    });
  }
}
