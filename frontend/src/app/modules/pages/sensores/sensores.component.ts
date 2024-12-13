import { NgModule, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule aquí
import { SensoresService } from './sensores.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';


@Component({
    selector     : 'sensores',
    standalone   : true,
    templateUrl  : './sensores.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, RouterModule, FormsModule ],
})
export class SensoresComponent
{
    isActive: boolean = true;
    sensors: any[] = [];
    filteredSensors = []; 
    searchTerm: string = ''; // Término de búsqueda
    users: any[] = [];
    showModal: boolean = false; // Controla la visibilidad del modal
    sensorIdToDelete: number | null = null; // ID del usuario a eliminar

    constructor(private _sensoresService: SensoresService,
                private _authService: AuthService,
                private _router: Router
    ) {}

    ngOnInit(): void {
      if (this._authService.isAdmin()) {
        
      }
      this._sensoresService.getAllSensors().subscribe(
        (response) => {
          this.sensors = response; 
          this.filteredSensors = [...this.sensors];
          console.log(this.sensors);
        },
        (error) => {
          console.error('Error al obtener los sensores', error);
        }
      );
      this._authService.getAllUsers().subscribe(
        (response) => {
            this.users = response;  // Guardar la lista de sensores
        },
        (error) => {
            console.error('Error al obtener los usuarios', error);
        }
      );
    }

    confirmDelete(sensorId: number): void {
        event.stopPropagation(); // Detiene la propagación del clic
        this.sensorIdToDelete = sensorId; // Almacena el ID del usuario
        this.showModal = true; // Muestra el modal
    }

    deleteSensor(): void {
        this._sensoresService.deleteSensor(this.sensorIdToDelete).subscribe(
          (response) => {
            console.log("Sensor " + this.sensorIdToDelete + " eliminadao");
            this.sensors = this.sensors.filter((sensor) => sensor.id !== this.sensorIdToDelete);
            this.filterSensors();
            this.showModal = false; // Cierra el modal
            this.sensorIdToDelete = null; // Resetea el ID
          },
          (error) => {
            console.error('Error al eliminar el sensor', error);
            this.showModal = false;
            this.sensorIdToDelete = null;
          }
        );
    }

    cancelDelete(): void {
        this.showModal = false; // Cierra el modal
        this.sensorIdToDelete = null; // Resetea el ID
    }

    getUserName(userId: number): string {
      const user = this.users.find(us => us.id === userId);
      return user ? user.username : 'Usuario no encontrado'; // Manejar el caso en que no se encuentre la localización
    }

    openEditSensor(sensorId: number): void {
      this._router.navigate([`sensores/editar/${sensorId}`]);
    }

    // Filtrar simulaciones por término de búsqueda
    filterSensors(): void {
      const term = this.searchTerm.toLowerCase();
      this.filteredSensors = this.sensors.filter(simulation =>
      simulation.name.toLowerCase().includes(term) || 
      this.getUserName(simulation.userId).toLowerCase().includes(term) ||
      simulation.id.toString().includes(term)
      );
  }
  
}
