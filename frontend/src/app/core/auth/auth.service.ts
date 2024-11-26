import { HttpClient } from '@angular/common/http';
import { CSP_NONCE, inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})

export class AuthService {

    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _router = inject(Router);  // Inyectamos el servicio Router

    // Datos
    idUser: number = 0;
    user: string = '';
    token: string = '';
    rol: number = -1;
    estado: number = -1;

    constructor() {
        this.loadUserRole();  // Carga el rol del usuario al iniciar el servicio
        this.loadAuthenticationStatus(); // Cargar estado de autenticación
    }

    private loadUserRole(): void {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
            this.rol = Number(storedRole);  // Convierte de string a número
        }
    }

    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // Verificar si el usuario está autenticado
    get isAuthenticated(): boolean {
        return this._authenticated;
    }

    private loadAuthenticationStatus(): void {
        const storedAuthStatus = localStorage.getItem('authenticated');
        this._authenticated = storedAuthStatus === 'true'; // Establecer el estado de autenticación
    }

    isTokenExpired(): boolean {
        const token = this.accessToken;
        if (!token) {
          this._authenticated = false; // Si no hay token, no está autenticado
          return true;
        }
    
        const expired = AuthUtils.isTokenExpired(token); // Verifica si el token ha expirado
        if (expired) {
          this._authenticated = false; // Si ha expirado, marca como no autenticado
        }
        return expired;
    }

    // Verificar si el usuario es Admin (rol == 1 o el valor que uses para Admin)
    isAdmin(): boolean {
        return this.rol === 1; // Cambia '1' por el valor que representa a "admin" en tu sistema
    }

    getUserInfo(): { id: number; username: string; rol: number; estado: number } | null {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            return JSON.parse(userInfo); // Devuelve el objeto parseado
        }
        return null; // Si no hay información, retorna null
    }

    getCurrentUser(): { id: number; username: string; rol: number; estado: number } | null {
        return this.getUserInfo(); // Devuelve la información del usuario desde localStorage
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        this.isTokenExpired();
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }
    
        return this._httpClient.post(`${environment.apiBaseUrl}/auth/login`, credentials).pipe(
            switchMap((response: any) => {
                // Almacena los datos del usuario
                this.idUser = response.user.id;
                this.user = response.user.username;
                this.token = response.token;
                this.rol = response.user.rol;  
                this.estado = response.user.estado;
    
                // Almacena la información del usuario en localStorage
                localStorage.setItem('userInfo', JSON.stringify({
                    id: this.idUser,
                    username: this.user,
                    rol: this.rol,
                    estado: this.estado
                }));
    
                localStorage.setItem('userRole', this.rol.toString());  // Convertir a string para almacenarlo
                localStorage.setItem('accessToken', this.token);
                this._authenticated = true;
                localStorage.setItem('authenticated', 'true');  // Persistir autenticación
    
                return of(response);
            }),
            catchError(error => {
                console.error('Error al iniciar sesión:', error);
                return throwError('Error al iniciar sesión: ' + (error.error.message || 'Unknown error'));
            })
        );
    }      

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
    
        // Set the authenticated flag to false
        this._authenticated = false;
    
        // Redirigir al usuario a la página de login
        this._router.navigate(['/sign-in']); // Aquí rediriges al login
    
        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { username: string; password: string; rol: number; estado: number }): Observable<any>
    {
        return this._httpClient.post(`${environment.apiBaseUrl}/auth/register`, user);
    }

    /**
     * Obtener todos los usuarios
     */
    getAllUsers(): Observable<any> {
        return this._httpClient.get(`${environment.apiBaseUrl}/auth/users`);
    }

    /**
     * Obtener todos los usuarios
     */
    deleteUser(userId: number): Observable<any> {
        return this._httpClient.delete(`${environment.apiBaseUrl}/auth/delete/${userId}`);
    }
}
