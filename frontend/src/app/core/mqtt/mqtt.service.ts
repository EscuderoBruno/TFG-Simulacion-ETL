import { Injectable } from '@angular/core';
import mqtt, { MqttClient } from 'mqtt';

@Injectable({
  providedIn: 'root',
})
export class MqttService {
  private client: MqttClient;

  constructor() {
    // Configuración para conectarse al broker HiveMQ Cloud usando WebSockets TLS (Puerto 8884)
    this.client = mqtt.connect('wss://b1f3d09eed3e4e998e98502c5567a212.s1.eu.hivemq.cloud:8884/mqtt', {
      clientId: 'clientId-A9UZcYmtr4',  // Puedes cambiar este ID, asegúrate de que sea único
      username: 'admin_genesis',  // Si no estás usando autenticación, puedes dejarlo vacío
      password: 'Genesis1',  // Lo mismo con la contraseña
      clean: true,  // Activa una sesión limpia para este cliente
      reconnectPeriod: 1000,  // Intentará reconectar cada segundo si la conexión falla
      keepalive: 60,  // Enviar un ping al broker cada 60 segundos
    });

    this.client.on('connect', () => {
      console.log('Conectado a HiveMQ Cloud');
    });

    this.client.on('error', (err) => {
      console.error('Error de conexión MQTT:', err);
    });

    this.client.on('message', (topic, message) => {
      // Aquí manejas los mensajes que recibes
      console.log('Mensaje recibido en el tópico', topic, ':', message.toString());
    });
  }

  sendMessage(topic: string, message: string): void {
    if (this.client.connected) {
      this.client.publish(topic, message, (err) => {
        if (err) {
          console.error('Error al enviar mensaje:', err);
        } else {
          console.log('Mensaje enviado al tópico', topic, ':', message);
        }
      });
    } else {
      console.error('Cliente MQTT no conectado.');
    }
  }

  // Puedes suscribirte a un tópico
  subscribeToTopic(topic: string): void {
    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error('Error al suscribirse al tópico:', err);
      } else {
        console.log('Suscripción exitosa al tópico:', topic);
      }
    });
  }
}
