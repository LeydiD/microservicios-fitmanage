import { DataTypes } from "sequelize";
import db from "../db/db.js";

const Asistencia = db.define(
  "asistencia",
  {
    id_asistencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: { type: DataTypes.TIME, allowNull: true },
    dni_cliente: { type: DataTypes.STRING(20), allowNull: false },
    dni_administrador: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

export default Asistencia;
