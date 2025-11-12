import express from "express";
import dotenv from "dotenv";
import db, { testConnection, createTables } from "./db/db.js";
import RutinaRoutes from './routes/RutinaRoutes.js'
import axios from "axios";

dotenv.config();

const app = express();

// Middleware para JSON
app.use(express.json());

// Health check endpoint para Consul
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'rutinas-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use("/rutinas", RutinaRoutes);

// Puerto desde .env
const PORT = process.env.PORT || 4004;

// Probar conexión a la BD y levantar servidor
async function init() {
    try {
        await testConnection(); // Verifica conexión
        await createTables(); // Crea tablas si no existen

        app.listen(PORT, () => {
            console.log(
                `Microservicio de Rutinas escuchando en el puerto ${PORT}`
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
            ID: 'rutinas-service-instance',
            Name: 'rutinas-service',
            Address: 'rutinas_service',
            Port: parseInt(PORT),
            Check: {
                HTTP: `http://rutinas_service:${PORT}/health`,
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
