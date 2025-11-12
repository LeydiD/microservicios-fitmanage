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
      include: [{ model: Membresia, as: "membresia" }],
    });

    if (!ultimaSuscripcion) {
      throw new NotFoundError("No se encontró ninguna membresía activa.");
    }

    return ultimaSuscripcion;
  } catch (error) {
    throw error;
  }
}

async function verificarMembresiaExpirada(id_cliente) {
  try {
    const ultimaSuscripcion = await obtenerUltimaSuscripcion(id_cliente);

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
            membresia: suscripcion.membresia,
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

    const promises = clientesIds.map(async (id) => {
      try {
        const ultima = await obtenerUltimaSuscripcion(id);
        if (!ultima) return null;
        const ultimaPlain = ultima.toJSON ? ultima.toJSON() : ultima;
        const tipoMembresia =
          ultimaPlain.membresia?.tipo || ultimaPlain.membresium?.tipo || null;
        return {
          id_cliente: ultimaPlain.id_cliente,
          id_suscripcion: ultimaPlain.id_suscripcion,
          fecha_inicio: ultimaPlain.fecha_inicio,
          fecha_fin: ultimaPlain.fecha_fin,
          id_membresia: ultimaPlain.id_membresia,
          membresia: ultimaPlain.membresia || ultimaPlain.membresium || null,
          tipo_membresia: tipoMembresia,
        };
      } catch (err) {
        console.warn(
          `Error obteniendo última suscripción para cliente ${id}:`,
          err.message
        );
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((r) => r !== null);
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
};
