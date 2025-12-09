import axios from "axios";
import { Op } from "sequelize";
import { NotFoundError, InternalServerError, Conflict, BadRequestError } from "../errors/Errores.js";
import Asistencia from "../models/Asistencia.js";
import { startOfWeek, addDays, format } from "date-fns";

// Base del API Gateway
const GATEWAY = process.env.GATEWAY_URL || "http://localhost:4000";

// Cliente axios con timeout básico
const http = axios.create({ baseURL: GATEWAY, timeout: 5000 });

async function getUltimaSuscripcion(dni) {
  const { data } = await http.get(`/api/afiliaciones/suscripciones/cliente/${dni}/ultima`);
  return data;
}

async function getCliente(dni) {
  const { data } = await http.get(`/api/usuarios/clientes/${dni}`);
  return data;
}

async function enviarCorreo(destinatario, asunto, mensaje) {
  await http.post(`/api/notificaciones/email`, { destinatario, asunto, mensaje });
}

async function registrarAsistencia(dni) {
  if (!dni) throw new BadRequestError("El dni del cliente es requerido");
  try {
    const ultimaSuscripcion = await getUltimaSuscripcion(dni);
    if (!ultimaSuscripcion) throw new NotFoundError("No se encontró la suscripción");

    const hoyDate = new Date();
    const hoy = format(hoyDate, "yyyy-MM-dd");
    const fin = new Date(ultimaSuscripcion.fecha_fin);

    const yaRegistro = await verSiYaRegistroAsistencia(dni, hoy);
    if (yaRegistro) throw new Conflict("Ya registró asistencia hoy.");
    if (hoyDate > fin) throw new Conflict("No cuenta con membresía activa");

    const asistencia = await Asistencia.create({
      fecha: hoy,
      dni_cliente: dni,
    });
    if (!asistencia) throw new InternalServerError("No se pudo crear la asistencia");

    // Notificación por correo (si hay email disponible)
    try {
      const cliente = await getCliente(dni);
      if (cliente?.email) {
        await enviarCorreo(
          cliente.email,
          "Asistencia registrada",
          `Hola ${cliente.nombre || ""}, tu asistencia del ${hoy} fue registrada correctamente.`
        );
      }
    } catch (e) {
      console.warn("No se pudo enviar correo de notificación:", e.message);
    }

    return asistencia;
  } catch (error) {
    throw error;
  }
}

async function verSiYaRegistroAsistencia(dni, fecha) {
  const asistencia = await Asistencia.findOne({
    where: { dni_cliente: dni, fecha },
  });
  return asistencia !== null;
}

async function obtenerAsistenciasPorCliente(dni) {
  const asistencias = await Asistencia.findAll({
    where: { dni_cliente: dni },
    attributes: ["fecha"],
    order: [["fecha", "ASC"]],
  });
  return asistencias.map((a) => a.fecha);
}

async function obtenerAsistenciasPorClienteEnRango(dni, fechaInicio, fechaFin) {
  const asistencias = await Asistencia.findAll({
    where: {
      dni_cliente: dni,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
    },
    attributes: ["fecha"],
    order: [["fecha", "ASC"]],
  });
  return asistencias.map((a) => a.fecha);
}

async function obtenerAsistenciasUltimaSemana(dni) {
  const hoy = new Date();
  const lunes = startOfWeek(hoy, { weekStartsOn: 1 });
  const sabado = addDays(lunes, 5);

  const fechaInicio = format(lunes, "yyyy-MM-dd");
  const fechaFin = format(sabado, "yyyy-MM-dd");

  const asistencias = await Asistencia.findAll({
    where: {
      dni_cliente: dni,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
    },
    attributes: ["fecha"],
  });

  const fechasAsistidas = new Set(
    asistencias.map((a) => new Date(a.fecha).toISOString().slice(0, 10))
  );

  const resultado = [];
  for (let i = 0; i < 6; i++) {
    const fecha = addDays(lunes, i);
    const fechaStr = fecha.toISOString().slice(0, 10);
    const diaSemana = format(fecha, "EEEE");
    resultado.push({ fecha: fechaStr, dia: diaSemana, asistio: fechasAsistidas.has(fechaStr) });
  }
  return resultado;
}

export default {
  registrarAsistencia,
  verSiYaRegistroAsistencia,
  obtenerAsistenciasPorCliente,
  obtenerAsistenciasPorClienteEnRango,
  obtenerAsistenciasUltimaSemana,
};


