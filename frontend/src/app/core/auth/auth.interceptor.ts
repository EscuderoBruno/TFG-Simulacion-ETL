import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service'; // Tu servicio de autenticación
import { AuthUtils } from 'app/core/auth/auth.utils';     // Utilidades para manejar tokens
import { catchError, Observable, throwError } from 'rxjs';

/**
 * Interceptador de autenticación
 *
 * @param req - Solicitud HTTP
 * @param next - Función para pasar la solicitud al siguiente manejador
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    // Inyectar el servicio de autenticación
    const authService = inject(AuthService);

    // Clonar la solicitud HTTP original
    let newReq = req.clone();

    // Verificar si hay un token de acceso válido y si no ha expirado
    if (authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken))
    {
        // Clonar la solicitud agregando el encabezado de autorización
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
        });
    }

    // Pasar la solicitud clonada y manejar la respuesta
    return next(newReq).pipe(
        catchError((error) =>
        {
            // Manejar el error 401 (no autorizado)
            if (error instanceof HttpErrorResponse && error.status === 401)
            {
                // Cerrar la sesión
                authService.signOut();

                // Recargar la aplicación (opcional)
                location.reload();
            }

            // Lanzar el error para que otros manejadores puedan capturarlo
            return throwError(error);
        }),
    );
};

