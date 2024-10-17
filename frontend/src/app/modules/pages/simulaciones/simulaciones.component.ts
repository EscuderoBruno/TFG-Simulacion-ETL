import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { SimulacionesService } from './simulaciones.service';


@Component({
    selector     : 'simulaciones',
    standalone   : true,
    templateUrl  : './simulaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule],
})
export class SimulacionesComponent
{
    isActive: boolean = true;
    simulations: any[] = [];

    constructor(private _simulationsService: SimulacionesService) {}

    ngOnInit(): void {
      this._simulationsService.getAllSimulations().subscribe(
        (response) => {
          this.simulations = response;  // Guardar la lista de usuarios
          console.log(this.simulations);
        },
        (error) => {
          console.error('Error al obtener las simulaciones', error);
        }
      );
    }

    deleteSimulation(id) {
        this._simulationsService.deleteSimulation(id).subscribe(
          (response) => {
            console.log("Simulación " + id + " eliminada");
            location.reload();
          },
          (error) => {
            console.error('Error al eliminar la simulación', error);
          }
        );
      }
}
