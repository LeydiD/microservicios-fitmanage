import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import notificacionRoutes from "./routes/notificaciones.js";
import db, { testConnection, createTables } from "./db/db.js";
import ClienteNotificacion from "./models/ClienteNotificacion.js";
import Notificacion from "./models/Notificacion.js";
import TipoNotificacion from "./models/TipoNotificacion.js";
import NotificacionService from "./services/NotificacionService.js";

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint para Consul
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'notificaciones-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/notificaciones", notificacionRoutes);

const PORT = process.env.PORT || 4005;

// Registrar servicio en Consul
async function registerInConsul() {
  const consulUrl = `http://${process.env.CONSUL_HOST || 'consul'}:${process.env.CONSUL_PORT || 8500}`;
  
  try {
    await axios.put(`${consulUrl}/v1/agent/service/register`, {
      ID: 'notificaciones-service-instance',
      Name: 'notificaciones-service',
      Address: 'notificaciones_service',
      Port: parseInt(PORT),
      Check: {
        HTTP: `http://notificaciones_service:${PORT}/health`,
        Interval: '10s',
        Timeout: '5s'
      }
    });
    console.log('✅ Notificaciones-service registrado en Consul');
  } catch (error) {
    console.error('❌ Error registrando en Consul:', error.message);
  }
}

// Probar conexión a la BD y levantar servidor
async function init() {
    try {
        await testConnection(); // Verifica conexión
        await createTables(); // Crea tablas si no existen

       //escuchar puerto 
       app.listen(PORT, () => {
      console.log(`Microservicio Notificaciones corriendo en puerto ${PORT}`);
      
      // Registrar en Consul después de 5 segundos
      setTimeout(registerInConsul, 5000);
    });
    } catch (error) {
        console.error("Error iniciando el microservicio de Suscripciones:", error);
    }
}

init();

//NotificacionService.crearNotificacionGeneral("General prueba", "msj", 2 );