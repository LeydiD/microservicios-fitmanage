import { enviarCorreo } from "../services/EmailService.js";
import NotificacionService from "../services/NotificacionService.js";
import NotificacionUsuarioService from "../services/NotificacionUsuarioService.js";

export async function enviarCorreoController(req, res) {
  try {
    const { destinatario, asunto, mensaje } = req.body;

    const resultado = await enviarCorreo(destinatario, asunto, mensaje);

    res.status(200).json({
      message: "Correo enviado correctamente",
      resultado,
    });
  } catch (error) {
    console.error("Error en enviarCorreoController:", error);
    res.status(500).json({ message: "Error enviando correo", error: error.message });
  }
}

async function crearNotificacion(req, res) {
  try {
    const notificacion = await NotificacionService.crearNoficacionEvento(
      req.body.titulo,
      req.body.mensaje
    );
    res.status(200).json(notificacion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

async function obtenerNotificaciones(req, res) {
  try {
    const notificaciones =
      await NotificacionUsuarioService.obetnerNotificacionesCliente(
        req.params.dni
      );
    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

async function cambiarEstado(req, res) {
  try {
    const notificacion = await NotificacionUsuarioService.cambiarEstado(
      req.params.id_notificacion
    );
    res.status(200).json(notificacion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

async function crearNotificacionAsistencia(req, res) {
  try {
    const { dni, fecha } = req.body;
    const notificacion = await NotificacionService.crearNotificacionAsistencia(dni, fecha);
    res.status(201).json(notificacion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

async function eliminarNotificacionUsuario(req, res) {
  try {
    await NotificacionService.eliminarNotificacionUsuario(
      req.params.id_notificacion
    );
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export default {
  crearNotificacion,
  obtenerNotificaciones,
  cambiarEstado,
  crearNotificacionAsistencia,
  eliminarNotificacionUsuario,
};