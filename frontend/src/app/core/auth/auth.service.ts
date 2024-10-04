import { HttpClient } from '@angular/common/http';
import { CSP_NONCE, inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({providedIn: 'root'})

export class AuthService {

    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);

    // Datos
    idUser: number = 0;
    user: string = '';
    token: string = '';
    rol: number = -1;
    estado: number = -1;
    //roleSub = new BehaviorSubject(0);

    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
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

            localStorage.setItem('accessToken', this.token);
            this._authenticated = true;

            return of(response);
            }),
            catchError(error => {
                // Agrega aquí más información del error
                console.error('Error al iniciar sesión:', error);
                return throwError('Error al iniciar sesión: ' + (error.error.message || 'Unknown error'));
            })
        );
    }    

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

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
