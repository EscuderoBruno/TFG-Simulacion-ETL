import { NgModule, Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimulacionesService } from './simulaciones.service';
import { SensoresService } from '../sensores/sensores.service';
import { ConexionesService } from '../conexiones/conexiones.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator'; // Importa el módulo paginator
import { ChangeDetectorRef } from '@angular/core';
import { MqttService } from 'app/core/envio_mensajes/mqtt.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'simulaciones',
    standalone: true,
    templateUrl: './simulaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, MatProgressBarModule, FormsModule, MatPaginatorModule ],
})
export class SimulacionesComponent implements OnInit, OnDestroy {
    isActive: boolean = true;
    simulations: any[] = [];
    filteredSimulations = []; // Lista filtrada de simulaciones
    paginatedSimulations: any[] = [];
    searchTerm: string = ''; // Término de búsqueda
    sensors: any[] = [];
    connections: any[] = [];
    users: any[] = [];
    activeSimulations: { simulation: any; elapsedTime: number; interval: any; isPaused: boolean }[] = [];
    isPaused: boolean = false; // Controlar si está pausada
    pageSize: number = 5;
    currentPage: number = 0;        
    showModal: boolean = false; // Controla la visibilidad del modal
    simulationIdToDelete: number | null = null; // ID del usuario a eliminar

    constructor(
        private _simulationsService: SimulacionesService,
        private _sensoresService: SensoresService,
        private _conexionesService: ConexionesService,
        private _userService: AuthService,
        private cdr: ChangeDetectorRef,
        private mqttService: MqttService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this._simulationsService.getAllSimulations().subscribe(
            (response) => {
                this.simulations = response;  // Guardar la lista de usuarios
                this.filteredSimulations = [...this.simulations];
                console.log(this.simulations);
                // Llamar a updatePaginatedSimulations después de cargar las simulaciones
                this.updatePaginatedSimulations();
                // Obtener simulaciones activas y cargarlas
                const activeSimulationIds = this._simulationsService.getActiveSimulations();
                activeSimulationIds.forEach(simulationId => {
                    // Llama a startSimulation para cada simulación activa
                    this.startSimulation(simulationId);
                });
            },
            (error) => {
                console.error('Error al obtener las simulaciones', error);
            }
        );
        this._sensoresService.getAllSensors().subscribe(
            (response) => {
                this.sensors = response;  // Guardar la lista de sensores
            },
            (error) => {
                console.error('Error al obtener las localizaciones', error);
            }
        );
        this._userService.getAllUsers().subscribe(
            (response) => {
                this.users = response;  // Guardar la lista de sensores
            },
            (error) => {
                console.error('Error al obtener los usuarios', error);
            }
        );
        // Obtener las conexiones
        this._conexionesService.getAllConnections().subscribe(
            (response) => {
                this.connections = response;
            },
            (error) => {
                console.error('Error al obtener las conexiones', error);
            }
        );
    }

    simularInstantaneamente(simulationId: number): void {
        // Llamar al servicio para simular la simulación instantáneamente
        this._simulationsService.simularInstantaneamente(simulationId, (result) => {
        });
    }    

    toggleSimulation(simulationId: number): void {
        const existingSimulationIndex = this.activeSimulations.findIndex(s => s.simulation.id === simulationId);
        if (this._simulationsService.isSimulationRunning(simulationId)) {
            this._simulationsService.stopSimulation(simulationId);
            this.stopSimulation(existingSimulationIndex);
        } else {
            this._simulationsService.simular(simulationId, (result) => {
            });
            this.startSimulation(simulationId);
        }
    }

    startSimulation(simulationId: number): void {
        const simulation = this.simulations.find(sim => sim.id === simulationId);
        console.log(this._simulationsService.getIsPaused(simulation));
    
        if (simulation) {
            const isPaused = this._simulationsService.getIsPaused(simulationId);
            this.activeSimulations.push({ simulation, elapsedTime: 0, interval: null, isPaused });
            const activeSimulationIndex = this.activeSimulations.length - 1;
    
            this.activeSimulations[activeSimulationIndex].interval = setInterval(() => {
                const percentage = this.getSimulationPercentage(simulationId);
    
                if (percentage >= 100) {
                    this.stopSimulation(activeSimulationIndex);
                } else {
                    this.activeSimulations[activeSimulationIndex].elapsedTime += 1;
                }
                this.cdr.detectChanges();
            }, 1000);
        }
    }    

    stopSimulation(index: number): void {
        clearInterval(this.activeSimulations[index].interval); // Limpiar el temporizador
        this.activeSimulations.splice(index, 1); // Eliminar la simulación de la lista de simulaciones activas
    }

    togglePauseSimulation(simulationId: number): void {
        const activeSimulation = this.activeSimulations.find(s => s.simulation.id === simulationId);
        if (activeSimulation) {
            if (activeSimulation.isPaused) {
                this.resumeSimulation(simulationId);
            } else {
                this.pauseSimulation(simulationId);
            }
        }
    }
    
    pauseSimulation(simulationId: number): void {
        const activeSimulation = this.activeSimulations.find(s => s.simulation.id === simulationId);
        if (activeSimulation) {
            activeSimulation.isPaused = true;
            clearInterval(activeSimulation.interval); // Pausar el temporizador
            this._simulationsService.pauseSimulation(simulationId);
        }
    }
    
    resumeSimulation(simulationId: number): void {
        const activeSimulation = this.activeSimulations.find(s => s.simulation.id === simulationId);
        if (activeSimulation) {
            activeSimulation.isPaused = false;
            // Reiniciar el temporizador
            activeSimulation.interval = setInterval(() => {
                const percentage = this.getSimulationPercentage(simulationId);
    
                if (percentage >= 100) {
                    this.stopSimulation(this.activeSimulations.indexOf(activeSimulation));
                } else {
                    activeSimulation.elapsedTime += 1;
                }
                this.cdr.detectChanges();
            }, 1000);
            this._simulationsService.resumeSimulation(simulationId);
        }
    }    

    getSensorName(sensorId: number): string {
        const sensor = this.sensors.find(se => se.id === sensorId);
        return sensor ? sensor.name : 'Sensor no encontrado'; // Manejar el caso en que no se encuentre la localización
    }

    getConnectioName(connectionId: number): string {
        const connection = this.connections.find(co => co.id === connectionId);
        return connection ? connection.name : 'Conexión no encontrada'; // Manejar el caso en que no se encuentre la conexión
    }
    
    getConnectionType(connectionId: number): number {
        const connection = this.connections.find(conn => conn.id === connectionId);
        return connection ? connection.type : -1; // Devuelve el tipo de conexión (0 para MQTT, 1 para API)
      }      

    formatElapsedTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        // Asegúrate de que siempre haya dos dígitos
        return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(secs)}`;
    }

    padTime(time: number): string {
        return time < 10 ? '0' + time : time.toString();
    }

    getSimulationPercentage(simulationId: number): number {
        const totalGenerados = this._simulationsService.getTotalGenerados(simulationId);
        const numElementosASimular = this.simulations.find(sim => sim.id === simulationId)?.numElementosASimular || 0;

        if (numElementosASimular === 0) return 0;

        const percentage = (totalGenerados / numElementosASimular) * 100;
        return Math.round(percentage); // Redondear al entero más cercano
    }

    getSimulationProgress(simulationId: number): string {
        const totalGenerados = this._simulationsService.getTotalGenerados(simulationId);
        const numElementosASimular = this.simulations.find(sim => sim.id === simulationId)?.numElementosASimular || 0;
    
        // Si `numElementosASimular` es 0, devolver solo el total generado
        if (numElementosASimular === 0) {
            return `${totalGenerados} / ∞`;
        }
    
        // En caso contrario, devolver el progreso en el formato `totalGenerados / numElementosASimular`
        return `${totalGenerados} / ${numElementosASimular}`;
    }

    getUserName(userId: number): string {
        const user = this.users.find(us => us.id === userId);
        return user ? user.username : 'Usuario no encontrado'; // Manejar el caso en que no se encuentre la localización
    }

    confirmDelete(simulationId: number): void {
        this.simulationIdToDelete = simulationId; // Almacena el ID del usuario
        this.showModal = true; // Muestra el modal
    }

    deleteSimulation(): void {
        this._simulationsService.deleteSimulation(this.simulationIdToDelete).subscribe(
            (response) => {
                console.log("Simulación " + this.simulationIdToDelete + " eliminada");
                this.simulations = this.simulations.filter((simulation) => simulation.id !== this.simulationIdToDelete);
                this.filterSimulations();
                this.showModal = false; // Cierra el modal
                this.simulationIdToDelete = null; // Resetea el ID
            },
            (error) => {
                console.error('Error al eliminar la simulación', error);
                this.showModal = false;
                this.simulationIdToDelete = null;
            }
        );
    }

    cancelDelete(): void {
        this.showModal = false; // Cierra el modal
        this.simulationIdToDelete = null; // Resetea el ID
    }

    // Implementación de OnDestroy
    ngOnDestroy(): void {
        // Detener todas las simulaciones activas al destruir el componente
        this.activeSimulations.forEach((sim, index) => {
            this.stopSimulation(index);
        });
    }

    openSimulation(simulationId: number) {
        this._router.navigate([`simulaciones/${simulationId}`]);
    }  
    
    // Método para duplicar una simulación
    duplicateSimulation(simulation: any): void {
        // Crea una nueva simulación con los mismos datos, pero modifica lo necesario (ejemplo: nombre)
        const duplicatedSimulation = { ...simulation, name: `${simulation.name} - Copia` };

        // Llama al servicio para guardar la nueva simulación duplicada
        this._simulationsService.create(duplicatedSimulation).subscribe(
        (newSimulation) => {
            console.log('Simulación duplicada:', newSimulation);
            // Agregar la nueva simulación a la lista (opcional, depende de cómo gestionas el estado)
            this.simulations.push(newSimulation);
            location.reload();
        },
        (error) => {
            console.error('Error al duplicar simulación:', error);
        }
        );
    }

    updatePaginatedSimulations(): void {
        // Si no hay simulaciones filtradas, no hace nada
        if (this.filteredSimulations.length === 0) {
            this.paginatedSimulations = [];
            return;
        }
    
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedSimulations = this.filteredSimulations.slice(startIndex, endIndex);
    }    

    // Llama a este método cuando se cambia la página.
    changePage(event: PageEvent) {
        this.pageSize = event.pageSize; // Actualiza el tamaño de la página
        this.currentPage = event.pageIndex; // Actualiza la página actual
        this.updatePaginatedSimulations(); // Actualiza las simulaciones para la página actual
    }    

    filterSimulations(): void {
        const term = this.searchTerm.toLowerCase();
    
        // Filtrar simulaciones con el término de búsqueda
        this.filteredSimulations = this.simulations.filter(simulation =>
            simulation.name.toLowerCase().includes(term) || 
            this.getUserName(simulation.userId).toLowerCase().includes(term) ||
            simulation.id.toString().includes(term)
        );
    
        // Después de filtrar, actualiza el paginado
        this.currentPage = 0;  // Resetear a la primera página después de filtrar
        this.updatePaginatedSimulations(); // Actualizar las simulaciones paginadas después de aplicar el filtro
    }    

    onCellClick(event: MouseEvent) {
        // Detener la propagación del clic
        event.stopPropagation();
    }      
    
}
