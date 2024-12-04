import { Injectable } from '@angular/core';
import mqtt, { MqttClient } from 'mqtt';

@Injectable({
  providedIn: 'root',
})
export class MqttService {
  private client: MqttClient;

  constructor() {
    // Constructor modificado para inicializar el cliente MQTT
  }

  sendMessageMqtt(url: string, clientId: string, username: string, password: string, topic: string, message: string): void {
    // Crear la conexión MQTT
    const mqttClient = mqtt.connect(url, {
        clientId: clientId,
        username: username,
        password: password,
        clean: true,           // Sesión limpia
        reconnectPeriod: 1000, // Intentar reconectar cada 1 segundo
        keepalive: 60          // Mantener conexión activa con un ping cada 60 segundos
    });

    // Manejar eventos del cliente
    mqttClient.on('connect', () => {
        console.log('Conexión establecida con el broker MQTT');
        
        // Publicar el mensaje en el tópico indicado
        mqttClient.publish(topic, message, (err) => {
            if (err) {
                console.error('Error al enviar mensaje:', err);
            } else {
                console.log(`Mensaje enviado al tópico ${topic}:`, message);
            }

            // Cerrar la conexión tras enviar el mensaje
            mqttClient.end();
        });
    });

    // Manejar errores de conexión
    mqttClient.on('error', (err) => {
        console.error('Error en la conexión MQTT:', err);
        mqttClient.end(); // Cierra la conexión si ocurre un error
    });

    // Opción para manejar desconexiones
    mqttClient.on('offline', () => {
        console.warn('Cliente MQTT desconectado');
    });
  }
}
