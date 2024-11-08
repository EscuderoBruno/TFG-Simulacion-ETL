import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { SensoresService } from './sensores.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector     : 'sensores',
    standalone   : true,
    templateUrl  : './sensores.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule],
})
export class SensoresComponent
{
    isActive: boolean = true;
    locations: any[] = [];

    constructor(private _sensoresService: SensoresService,
                private _authService: AuthService
    ) {}

    ngOnInit(): void {
      if (this._authService.isAdmin()) {
        
      }
      this._sensoresService.getAllSensors().subscribe(
        (response) => {
          this.locations = response;  // Guardar la lista de usuarios
          console.log(this.locations);
        },
        (error) => {
          console.error('Error al obtener las sensores', error);
        }
      );
    }

    deleteLocation(id) {
        this._sensoresService.deleteSensor(id).subscribe(
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
