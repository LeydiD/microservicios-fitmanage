import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    define: { timestamps: false },
    // 🔹 CONFIGURACIONES CRÍTICAS PARA EVITAR TIMEOUT
    pool: {
      max: 10,              // Máximo de conexiones simultáneas
      min: 2,               // Mínimo de conexiones activas
      acquire: 300000,      // 5 minutos para adquirir conexión
      idle: 60000,          // 1 minuto antes de liberar conexión inactiva
      evict: 120000         // 2 minutos para revisar conexiones inactivas
    },

    dialectOptions: {
      connectTimeout: 300000,  // 5 minutos de timeout de conexión
    },

    logging: console.log,      // Cambiar a false en producción
    retry: {
      max: 3,                  // Reintentar hasta 3 veces
      timeout: 300000          // 5 minutos entre reintentos
    },

    // Mantener conexión viva
    keepAlive: true,
    keepAliveInitialDelay: 0
  }
);

// Función para probar conexión
export async function testConnection() {
  try {
    await db.authenticate();
    console.log("Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

// Función para crear tablas
export async function createTables() {
  try {
    await db.sync({ alter: false }); // alter: true actualiza tablas existentes
    console.log("Tablas sincronizadas correctamente.");
  } catch (error) {
    console.error("Error al sincronizar tablas:", error);
    throw error;
  }
}

export default db;
