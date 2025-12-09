import { DataTypes } from "sequelize";
import db from "../db/db.js";

const TipoNotificacion = db.define("tipo_notificacion",{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nombre: {type: DataTypes.STRING}
},{
    timestamps: false,
    freezeTableName: true
});

export default TipoNotificacion;