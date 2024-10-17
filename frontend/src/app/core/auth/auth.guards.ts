import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verificar si el usuario está autenticado (tiene un token)
    if (this.authService.accessToken && !this.authService.isTokenExpired()) {
      return true; // Permitir acceso si está autenticado
    } else {
      // Si no está autenticado, redirigir a la página de inicio de sesión
      this.router.navigate(['/sign-in']);
      return false;
    }
  }
}
