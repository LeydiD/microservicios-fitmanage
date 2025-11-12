// index.js
import express from "express";
import dotenv from "dotenv";
import db, { testConnection, createTables } from "./db/db.js";
import suscripcionRoutes from "./routes/SuscripcionRoutes.js";
import membresiaRoutes from "./routes/MembresiaRoutes.js";
import pagoRoutes from "./routes/PagoRoutes.js";
import axios from "axios";
import gananciaRoutes from "./routes/GananciaRoutes.js";

dotenv.config();

const app = express();

// Middleware para JSON
app.use(express.json());

// Health check endpoint para Consul
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'afiliaciones-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas del microservicio de Afiliaciones
app.use("/suscripciones", suscripcionRoutes);
app.use("/membresias", membresiaRoutes);
app.use("/pagos", pagoRoutes);
app.use("/ganancias", gananciaRoutes);

// Puerto desde .env
const PORT = process.env.PORT || 4002;

// Probar conexión a la BD y levantar servidor
async function init() {
  try {
    await testConnection(); // Verifica conexión
    await createTables(); // Crea tablas si no existen

    app.listen(PORT, () => {
      console.log(
        `Microservicio de Suscripciones escuchando en el puerto ${PORT}`
      );
      
      // Registrar en Consul después de 5 segundos
      setTimeout(registerInConsul, 5000);
    });
  } catch (error) {
    console.error("Error iniciando el microservicio de Suscripciones:", error);
  }
}

// Registrar servicio en Consul
async function registerInConsul() {
  const consulUrl = `http://${process.env.CONSUL_HOST || 'consul'}:${process.env.CONSUL_PORT || 8500}`;
  
  try {
    await axios.put(`${consulUrl}/v1/agent/service/register`, {
      ID: 'afiliaciones-service-instance',
      Name: 'afiliaciones-service',
      Address: 'afiliaciones_service',
      Port: parseInt(PORT),
      Check: {
        HTTP: `http://afiliaciones_service:${PORT}/health`,
        Interval: '10s',
        Timeout: '5s'
      }
    });
    console.log('✅ Afiliaciones-service registrado en Consul');
  } catch (error) {
    console.error('❌ Error registrando en Consul:', error.message);
  }
}

init();
