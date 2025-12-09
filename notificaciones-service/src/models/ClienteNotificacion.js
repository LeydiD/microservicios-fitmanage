import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Notificacion from "./Notificacion.js";

const ClienteNotificacion = db.define("cliente_notificacion",{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fecha_creacion: {type: DataTypes.DATEONLY},
    estado: {type: DataTypes.BOOLEAN},
    id_cliente: {type: DataTypes.INTEGER, allowNull: false }
},{
    timestamps: false,
    freezeTableName: true
});

//relacion con notificacion
Notificacion.hasMany(ClienteNotificacion, {
    foreignKey: "id_notificacion"
})
ClienteNotificacion.belongsTo(Notificacion, {
    foreignKey: "id_notificacion"
})


export default ClienteNotificacion;