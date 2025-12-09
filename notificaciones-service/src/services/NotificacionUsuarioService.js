import ClienteNotificacion from "../models/ClienteNotificacion.js";
import { NotFoundError,
  BadRequestError,
  InternalServerError, } from "../errors/Errores.js";
import Notificacion from "../models/Notificacion.js";
import TipoNotificacion from "../models/TipoNotificacion.js";

async function crearNotiUsuario(idNoti, idCliente) {
    if (!idCliente || !idNoti){
         throw new BadRequestError("El nombre no puede estar vacio");
    }
    try {
        const notifiUsuario = await ClienteNotificacion.create({
            id_notificacion: idNoti,
            id_cliente: idCliente,
            fecha_creacion: new Date(),
            estado: false
        });
        if(!notifiUsuario){
            throw new InternalServerError("error al crear la ntoficacion usuario")
        }
        return notifiUsuario;
    } catch (error) {
        throw error;
    }
}

async function obetnerNotificacionesCliente(dni) {
    if(!dni){
         throw new BadRequestError("El dni no puede estar vacio");
    }
    try {
        const notificaciones = await ClienteNotificacion.findAll({
            where: {id_cliente: dni},
            include: [{
                model: Notificacion,
                include: [{
                    model: TipoNotificacion,
                }]
            }]
        })
         return notificaciones.map((notificacionUser) => {
            return {
                id: notificacionUser.id,
                estado: notificacionUser.estado,
                titulo: notificacionUser.notificacion.titulo,
                mensaje: notificacionUser.notificacion.mensaje,
                etiqueta: notificacionUser.notificacion.tipo_notificacion.nombre
            }
        });
    } catch (error) {
        throw error;
    }
}

async function cambiarEstado(id) {
    if(!id){
        throw new BadRequestError("el id es vacío");
    }
    try {
        const nofiUsuario = await ClienteNotificacion.findByPk(id);
        if(!nofiUsuario){
            throw new NotFoundError("No se encontró la notificacion del usuario");
        }
        nofiUsuario.estado = !nofiUsuario.estado;
        await nofiUsuario.save({field:['estado'] });
        return nofiUsuario;
    } catch (error) {
        throw error;
    }
}
export default {crearNotiUsuario, obetnerNotificacionesCliente, cambiarEstado};