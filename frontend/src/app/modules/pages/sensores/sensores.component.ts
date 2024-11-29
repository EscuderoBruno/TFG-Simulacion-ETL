import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { SensoresService } from './sensores.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';


@Component({
    selector     : 'sensores',
    standalone   : true,
    templateUrl  : './sensores.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, RouterModule],
})
export class SensoresComponent
{
    isActive: boolean = true;
    sensors: any[] = [];

    constructor(private _sensoresService: SensoresService,
                private _authService: AuthService,
                private _router: Router
    ) {}

    ngOnInit(): void {
      if (this._authService.isAdmin()) {
        
      }
      this._sensoresService.getAllSensors().subscribe(
        (response) => {
          this.sensors = response;  // Guardar la lista de usuarios
          console.log(this.sensors);
        },
        (error) => {
          console.error('Error al obtener los sensores', error);
        }
      );
    }

    deleteSensor(id) {
      this._sensoresService.deleteSensor(id).subscribe(
        (response) => {
          console.log("Sensor " + id + " eliminadao");
          location.reload();
        },
        (error) => {
          console.error('Error al eliminar el sensor', error);
        }
      );
    }

    openEditSensor(sensorId: number): void {
      this._router.navigate([`sensores/editar/${sensorId}`]);
    }
  
}
