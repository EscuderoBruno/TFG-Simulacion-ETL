import { HttpClient } from '@angular/common/http';
import { CSP_NONCE, inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false; // Estado de autenticación
    private _httpClient = inject(HttpClient); // Cliente HTTP para realizar solicitudes
    private _router = inject(Router); // Servicio de enrutamiento

    // Propiedades del usuario autenticado
    idUser: number = 0;
    user: string = '';
    token: string = '';
    rol: number = -1;
    estado: number = -1;

    constructor() {
        this.loadAuthenticationStatus(); // Cargar estado de autenticación desde almacenamiento local
    }

    // -----------------------------------------------------------------------------------------
    // Métodos de soporte
    // -----------------------------------------------------------------------------------------

    // Carga el estado de autenticación desde el almacenamiento local
    private loadAuthenticationStatus(): void {
        const storedAuthStatus = localStorage.getItem('authenticated');
        this._authenticated = storedAuthStatus === 'true'; // Convertir estado de string a booleano
    }

    // Verifica si el token almacenado ha expirado
    isTokenExpired(): boolean {
        const token = this.accessToken;
        if (!token) {
            this._authenticated = false; // Sin token, el usuario no está autenticado
            return true;
        }
        const expired = AuthUtils.isTokenExpired(token); // Verificar expiración usando utilidad
        if (expired) {
            this._authenticated = false; // Marcar como no autenticado si el token expiró
        }
        return expired;
    }

    // -----------------------------------------------------------------------------------------
    // Métodos de acceso
    // -----------------------------------------------------------------------------------------

    // Getter/Setter del token de acceso
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token); // Guardar token en almacenamiento local
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? ''; // Recuperar token o devolver cadena vacía
    }

    // Verifica si el usuario está autenticado
    get isAuthenticated(): boolean {
        return this._authenticated;
    }

    // Verifica si el usuario tiene rol de administrador
    isAdmin(): Observable<boolean> {
        return this.getAuthenticatedUser().pipe(
            switchMap((response: any) => {
                // Verificar si el rol es de administrador (suponiendo que el rol de admin es 1)
                return of(response.rol === 1);
            }),
            catchError((error) => {
                console.error('Error al verificar el rol del usuario:', error);
                return of(false); // Devolver false si ocurre un error
            })
        );
    }

    // Obtiene la información del usuario actual
    getCurrentUser(): { id: number; username: string; rol: number; estado: number } | null {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null; // Retorna objeto parseado o null si no existe
    }

    // -----------------------------------------------------------------------------------------
    // Métodos de autenticación
    // -----------------------------------------------------------------------------------------

    // Obtener los datos del usuario autenticado
    getAuthenticatedUser(): Observable<any> {
        const token = this.accessToken;
        if (!token) {
            return throwError('No token available'); // No hay token
        }

        // Agregar el token en los encabezados para la autenticación
        const headers = { Authorization: `Bearer ${token}` };

        // Realizamos la solicitud HTTP para obtener los datos del usuario autenticado
        return this._httpClient.get(`${environment.apiBaseUrl}/auth/user/me`, { headers }).pipe(
            switchMap((response: any) => {
                // Actualizar la información del usuario en el servicio
                this.idUser = response.id;
                this.user = response.username;
                this.token = token;
                this.rol = response.rol;
                this.estado = response.estado;

                // Opcionalmente, guardar la información del usuario en localStorage
                localStorage.setItem('userInfo', JSON.stringify({
                    id: this.idUser,
                    username: this.user,
                    rol: this.rol,
                    estado: this.estado
                }));
                localStorage.setItem('userRole', this.rol.toString());
                localStorage.setItem('authenticated', 'true');

                this._authenticated = true; // Marcar como autenticado
                return of(response); // Devolver la respuesta
            }),
            catchError(error => {
                console.error('Error al obtener los datos del usuario:', error);
                return throwError('Error al obtener los datos del usuario: ' + (error.error.message || 'Unknown error'));
            })
        );
    }

    // Inicia sesión con las credenciales proporcionadas
    signIn(credentials: { username: string; password: string }): Observable<any> {
        this.isTokenExpired(); // Verifica si el token ha expirado
        if (this._authenticated) {
            return throwError('User is already logged in.'); // Evita múltiples inicios de sesión
        }

        return this._httpClient.post(`${environment.apiBaseUrl}/auth/login`, credentials).pipe(
            switchMap((response: any) => {
                // Guardar datos del usuario y token en localStorage
                this.idUser = response.user.id;
                this.user = response.user.username;
                this.token = response.token;
                this.rol = response.user.rol;
                this.estado = response.user.estado;

                localStorage.setItem('userInfo', JSON.stringify({
                    id: this.idUser,
                    username: this.user,
                    rol: this.rol,
                    estado: this.estado
                }));
                localStorage.setItem('accessToken', this.token);
                localStorage.setItem('authenticated', 'true');

                this._authenticated = true; // Marcar como autenticado
                return of(response); // Emitir la respuesta
            }),
            catchError(error => {
                console.error('Error al iniciar sesión:', error);
                return throwError('Error al iniciar sesión: ' + (error.error.message || 'Unknown error'));
            })
        );
    }

    // Cierra la sesión del usuario
    signOut(): Observable<any> {
        localStorage.removeItem('accessToken'); // Elimina token
        localStorage.removeItem('userInfo'); // Elimina datos del usuario
        localStorage.removeItem('userRole'); // Elimina rol del usuario
        localStorage.setItem('authenticated', 'false'); // Actualiza estado de autenticación

        this._authenticated = false; // Marcar como no autenticado
        this._router.navigate(['/sign-in']); // Redirigir al login

        return of(true); // Retorna observable de éxito
    }

    // Registra un nuevo usuario
    signUp(user: { username: string; password: string; rol: number; estado: number }): Observable<any> {
        return this._httpClient.post(`${environment.apiBaseUrl}/auth/register`, user);
    }

    // -----------------------------------------------------------------------------------------
    // Métodos de administración de usuarios
    // -----------------------------------------------------------------------------------------

    // Obtiene todos los usuarios
    getAllUsers(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/auth/users`);
    }

    // Elimina un usuario por ID
    deleteUser(userId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/auth/delete/${userId}`);
    }

    // Obtiene un usuario por ID
    getUserById(id: string): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/auth/user/${id}`);
    }

    // Actualiza la información de un usuario por ID
    updateUser(id: string, data: any): Observable<any> {
        return this._httpClient.put(`${environment.apiBaseUrl}/auth/update/${id}`, data);
    }
}
