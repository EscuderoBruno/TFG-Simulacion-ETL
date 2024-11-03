import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verificar si el usuario tiene rol de administrador
    if (this.authService.isAdmin()) {
      return true;
    }

    // Si no es admin, redirigir a la página principal
    this.router.navigate(['']);
    return false;
  }
}
