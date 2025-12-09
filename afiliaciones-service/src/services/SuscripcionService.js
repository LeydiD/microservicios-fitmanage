import Suscripcion from "../models/Suscripcion.js";
import { calcularEstado } from "../models/Suscripcion.js";
import Membresia from "../models/Membresia.js";
import { Op } from "sequelize";
import apiClient from "../utils/ApiClient.js";

import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../errors/Errores.js";

//Registrar nueva suscripcion
async function registrar(id_cliente, id_membresia) {
  if (!id_cliente || !id_membresia || isNaN(id_membresia)) {
    throw new BadRequestError("DNI o membresia no valida.");
  }
  try {
    // Verificar cliente via API Gateway
    await apiClient.verificarClienteExiste(id_cliente);

    const membresia = await Membresia.findByPk(id_membresia);
    if (!membresia) {
      throw new NotFoundError("Membresia no encontrada");
    }
    const fechaInicio = new Date();
    const fechaFin = new Date(
      calcularFechafin(fechaInicio, parseInt(membresia.duracion))
    );
    //const estado = calcularEstado(fechaInicio, fechaFin);

    const suscripcion = await Suscripcion.create({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      id_cliente: id_cliente,
      id_membresia: id_membresia,
    });
    return suscripcion;
  } catch (error) {
    throw error;
  }
}

function calcularFechafin(fechaInicio, dias) {
  const nuevaFecha = new Date(fechaInicio);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
}

async function obtenerUltimaSuscripcion(id_cliente) {
  try {
    const ultimaSuscripcion = await Suscripcion.findOne({
      where: { id_cliente },
      order: [["fecha_fin", "DESC"]],
      include: [{ model: Membresia }],
    });

    // Si no hay suscripción, devolver null en lugar de lanzar excepción.
    // Esto permite a los llamadores manejar el caso (p.ej. devolver listado sin membresía)
    if (!ultimaSuscripcion) return null;

    return ultimaSuscripcion;
  } catch (error) {
    throw error;
  }
}

async function verificarMembresiaExpirada(id_cliente) {
  try {
    const ultimaSuscripcion = await obtenerUltimaSuscripcion(id_cliente);

    // Si no existe suscripción, consideramos que está expirada / no activa
    if (!ultimaSuscripcion) return true;

    const hoy = new Date();
    const fechaFin = new Date(ultimaSuscripcion.fecha_fin);

    return fechaFin < hoy;
  } catch (error) {
    throw error;
  }
}

async function obtenerClientesActivos() {
  const hoy = new Date();

  try {
    // Obtener suscripciones activas
    const suscripcionesActivas = await Suscripcion.findAll({
      where: {
        fecha_fin: { [Op.gte]: hoy }, // suscripción vigente
      },
      include: [{ model: Membresia }],
    });

    // Obtener información de clientes via API
    const clientesConInfo = [];
    for (const suscripcion of suscripcionesActivas) {
      try {
        const clienteInfo = await apiClient.obtenerInfoCliente(
          suscripcion.id_cliente
        );
        clientesConInfo.push({
          ...clienteInfo,
          suscripcion: {
            id_suscripcion: suscripcion.id_suscripcion,
            fecha_inicio: suscripcion.fecha_inicio,
            fecha_fin: suscripcion.fecha_fin,
            estado: suscripcion.estado,
            membresia: suscripcion.membresia || suscripcion.membresium || null,
          },
        });
      } catch (error) {
        console.warn(
          `No se pudo obtener info del cliente ${suscripcion.id_cliente}:`,
          error.message
        );
      }
    }

    return clientesConInfo;
  } catch (error) {
    throw error;
  }
}

async function obtenerUltimasPorClientes(clientesIds = []) {
  try {
    if (!Array.isArray(clientesIds) || clientesIds.length === 0) return [];

    // Normalizar IDs a números cuando sea posible para evitar problemas de comparación
    const idsNum = clientesIds.map((c) => (isNaN(Number(c)) ? c : Number(c)));

    // Obtener todas las suscripciones de los clientes pedidos, ordenadas por fecha_fin desc
    const suscripciones = await Suscripcion.findAll({
      where: { id_cliente: idsNum },
      order: [
        ["id_cliente", "ASC"],
        ["fecha_fin", "DESC"],
      ],
      include: [{ model: Membresia }],
    });

    // Reducir a la última por cliente
    const map = new Map();
    for (const sus of suscripciones) {
      const plain = sus.toJSON ? sus.toJSON() : sus;
      const key = String(plain.id_cliente);
      if (!map.has(key)) {
        const tipoMembresia = plain.membresia?.tipo || plain.membresium?.tipo || null;
        map.set(key, {
          id_cliente: plain.id_cliente,
          id_suscripcion: plain.id_suscripcion,
          fecha_inicio: plain.fecha_inicio,
          fecha_fin: plain.fecha_fin,
          id_membresia: plain.id_membresia,
          membresia: plain.membresia || plain.membresium || null,
          tipo_membresia: tipoMembresia,
        });
      }
    }

    // Construir resultado en el mismo orden de entrada
    const resultado = clientesIds
      .map((c) => map.get(String(isNaN(Number(c)) ? c : Number(c))))
      .filter((r) => r !== undefined && r !== null);

    return resultado;
  } catch (error) {
    throw error;
  }
}

async function calcularDiasRestantes(id_cliente) {
  try {
    const ultimaSuscripcion = await obtenerUltimaSuscripcion(id_cliente);
    if (!ultimaSuscripcion) return 0;

    const fechaFin = new Date(ultimaSuscripcion.fecha_fin);
    const hoy = new Date();

    // Resetear horas para cálculo limpio de días
    fechaFin.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    const diferenciaTiempo = fechaFin - hoy;
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    return diferenciaDias > 0 ? diferenciaDias : 0;
  } catch (error) {
    throw error;
  }
}

export default {
  registrar,
  obtenerUltimaSuscripcion,
  verificarMembresiaExpirada,
  obtenerClientesActivos,
  obtenerUltimasPorClientes,
  calcularDiasRestantes,
};
