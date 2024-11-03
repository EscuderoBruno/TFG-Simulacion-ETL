import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { LocalizacionesService } from './localizaciones.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector     : 'localizaciones',
    standalone   : true,
    templateUrl  : './localizaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule],
})
export class LocalizacionesComponent
{
    isActive: boolean = true;
    locations: any[] = [];

    constructor(private _locationsService: LocalizacionesService,
                private _authService: AuthService
    ) {}

    ngOnInit(): void {
      if (this._authService.isAdmin()) {
        
      }
      this._locationsService.getAllLocations().subscribe(
        (response) => {
          this.locations = response;  // Guardar la lista de usuarios
          console.log(this.locations);
        },
        (error) => {
          console.error('Error al obtener las localizaciones', error);
        }
      );
    }

    deleteLocation(id) {
        this._locationsService.deleteLocation(id).subscribe(
          (response) => {
            console.log("Localización " + id + " eliminada");
            location.reload();
          },
          (error) => {
            console.error('Error al eliminar la localizacion', error);
          }
        );
      }
}
