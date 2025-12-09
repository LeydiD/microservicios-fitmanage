import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    define: { timestamps: false },
  }
);

// Probar conexión
export async function testConnection() {
  try {
    await db.authenticate();
    console.log(" Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error(" Error al conectar a la base de datos:", error);
  }
}

// Crear tablas
export async function createTables() {
  try {
    await db.sync({ alter: false });
    console.log("Tablas sincronizadas correctamente.");
  } catch (error) {
    console.error("Error al sincronizar tablas:", error);
    throw error;
  }
}

export default db;
