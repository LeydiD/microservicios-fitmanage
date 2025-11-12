import { DataTypes } from "sequelize";
import db from "../db/db.js";

const Rutina = db.define("rutina",
    {
        id_rutina: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        mensaje: { type: DataTypes.TEXT, allowNull: false },
        fecha_generacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        es_prompt: {type: DataTypes.BOOLEAN, allowNull: false },
        id_cliente: {type: DataTypes.INTEGER, allowNull: false }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

export function calcularDuracionEnDias(duracionT) {
    const match = duracionT.match(/\d+/);
    return duracionT.includes("meses") ? parseInt(match) * 30 : duracionT;
}

export default Rutina;
