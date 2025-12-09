import { DataTypes } from "sequelize";
import db from "../db/db.js";
import TipoNotificacion from "./TipoNotificacion.js";

const Notificacion = db.define("notificacion", {
    id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    titulo: {type: DataTypes.STRING(50)},
    mensaje: {type: DataTypes.STRING(100)},
    fecha_envio: {type: DataTypes.DATEONLY} 
},{
    timestamps: false,
    freezeTableName: true
});

//Relacion con tipo notificacion
TipoNotificacion.hasMany(Notificacion, {
    foreignKey: "id_tipo_notificacion"
});

Notificacion.belongsTo(TipoNotificacion, {
    foreignKey: "id_tipo_notificacion"
});

export default Notificacion;