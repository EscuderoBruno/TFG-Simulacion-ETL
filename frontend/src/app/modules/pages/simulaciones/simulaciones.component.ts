import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimulacionesService } from './simulaciones.service';
import { SensoresService } from '../sensores/sensores.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    selector: 'simulaciones',
    standalone: true,
    templateUrl: './simulaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, RouterLink, MatIconModule, CommonModule, MatMenuModule, MatTooltipModule, MatProgressBarModule],
})
export class SimulacionesComponent implements OnInit, OnDestroy {
    isActive: boolean = true;
    simulations: any[] = [];
    sensors: any[] = [];
    users: any[] = [];
    activeSimulations: { simulation: any; elapsedTime: number; interval: any }[] = []; // Simulaciones en ejecución

    constructor(
        private _simulationsService: SimulacionesService,
        private _sensoresService: SensoresService,
        private _userService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._simulationsService.getAllSimulations().subscribe(
            (response) => {
                this.simulations = response;  // Guardar la lista de usuarios
                console.log(this.simulations);
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

    simularInstantaneamente(simulationId: number): void {
        const existingSimulationIndex = this.activeSimulations.findIndex(s => s.simulation.id === simulationId);
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
        
        if (simulation) {
            this.activeSimulations.push({ simulation, elapsedTime: 0, interval: null });
            const activeSimulationIndex = this.activeSimulations.length - 1; // Index of the newly added simulation
  
            // Iniciar el temporizador
            this.activeSimulations[activeSimulationIndex].interval = setInterval(() => {
                const percentage = this.getSimulationPercentage(simulationId);

                if (percentage >= 100) {
                    // Detener la simulación automáticamente cuando llegue al 100%
                    this.stopSimulation(activeSimulationIndex);
                } else {
                    // Incrementa el tiempo cada segundo mientras no esté al 100%
                    this.activeSimulations[activeSimulationIndex].elapsedTime += 1;
                }
                this.cdr.detectChanges(); // Forzar la detección de cambios
            }, 1000);
        }
    }

    stopSimulation(index: number): void {
        clearInterval(this.activeSimulations[index].interval); // Limpiar el temporizador
        this.activeSimulations.splice(index, 1); // Eliminar la simulación de la lista de simulaciones activas
    }

    getSensorName(sensorId: number): string {
        const sensor = this.sensors.find(se => se.id === sensorId);
        return sensor ? sensor.name : 'Ubicación no encontrada'; // Manejar el caso en que no se encuentre la localización
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

    // Implementación de OnDestroy
    ngOnDestroy(): void {
        // Detener todas las simulaciones activas al destruir el componente
        this.activeSimulations.forEach((sim, index) => {
            this.stopSimulation(index);
        });
    }
}
