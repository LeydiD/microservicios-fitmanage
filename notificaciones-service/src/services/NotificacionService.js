import Notificacion from "../models/Notificacion.js";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../errors/Errores.js";
import TipoNotificacion from "../models/TipoNotificacion.js";
import apiClient from "../utils/ApliCliente.js";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import ClienteNotificacion from "../models/ClienteNotificacion.js";

async function crearNotificacionGeneral(titulo, mensaje, tipoNoti) {
  if (!titulo || !mensaje || !tipoNoti) {
    throw new BadRequestError("Campos vacios");
  }
  try {
    const tipoNotifi = await TipoNotificacion.findByPk(tipoNoti);
    if (!tipoNotifi) {
      throw new NotFoundError("No se enctnró el tipo de notificacion");
    }
    const notificacion = await Notificacion.create({
      titulo: titulo,
      mensaje: mensaje,
      fecha_envio: new Date(),
      id_tipo_notificacion: tipoNoti,
    });
    if (!notificacion) {
      throw new InternalServerError("error al crear la notificación");
    }
    return notificacion;
  } catch (error) {
    throw error;
  }
}

async function crearNoficacionEvento(titulo, mensaje) {
  if (!titulo || !mensaje) {
    throw new BadRequestError("Campos vacios");
  }
  try {
    const notificacion = await Notificacion.create({
      titulo: titulo,
      mensaje: mensaje,
      fecha_envio: new Date(),
      id_tipo_notificacion: 1,
    });
    if (!notificacion) {
      throw new InternalServerError("error al crear la notificación");
    }
    const clientes = await apiClient.obtenerTodosClientes();
    for (const cliente of clientes) {
      const notiUsuario = await NotificacionUsuarioService.crearNotiUsuario(
        notificacion.id_notificacion,
        cliente.DNI
      );
      if (!notiUsuario) {
        throw new InternalServerError(
          "no se pudo crear Notificacion Usuario correctamente"
        );
      }
    }
    return notificacion;
  } catch (error) {
    throw error;
  }
}

async function eliminarNotificacionUsuario(id) {
  if (!id) throw new BadRequestError("El id es vacío");
  try {
    const notiUsuario = await ClienteNotificacion.findByPk(id);
    if (!notiUsuario) throw new NotFoundError("No existe la notificación");
    await notiUsuario.destroy();
    return true;
  } catch (error) {
    throw error;
  }
}

export default {
  crearNotificacionGeneral,
  crearNoficacionEvento,
  eliminarNotificacionUsuario,
};

