import SuscripcionService from "../services/SuscripcionService.js";

export async function registrar(req, res) {
  try {
    const suscripcion = await SuscripcionService.registrar(
      req.body.id_cliente,
      req.body.id_membresia
    );
    res.status(200).json(suscripcion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function verificarActiva(req, res) {
  try {
    const { id } = req.params;
    const tieneActiva = !(await SuscripcionService.verificarMembresiaExpirada(id));
    res.status(200).json({ tieneActiva });
  } catch (error) {
    res.status(200).json({ tieneActiva: false });
  }
}

export async function obtenerPorCliente(req, res) {
  try {
    const { id } = req.params;
    // Esta función necesita ser implementada en el service
    res.status(501).json({ message: "Función no implementada aún" });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function ultima(req, res) {
  try {
    const { id } = req.params;
    const suscripcion = await SuscripcionService.obtenerUltimaSuscripcion(id);
    if (!suscripcion) {
      return res.status(404).json({ message: "No se encontró ninguna suscripción" });
    }

    res.status(200).json(suscripcion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function diasRestantes(req, res) {
  try {
    const { id } = req.params;
    // Esta función necesita ser implementada en el service
    res.status(501).json({ message: "Función no implementada aún" });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function ultimasPorClientes(req, res) {
  try {
    const { clientes } = req.body || {};
    if (!clientes || !Array.isArray(clientes)) {
      return res
        .status(400)
        .json({ message: 'Se requiere un arreglo "clientes" en el body' });
    }

    const ultimas = await SuscripcionService.obtenerUltimasPorClientes(
      clientes
    );
    res.status(200).json(ultimas);
  } catch (error) {
    console.error("Error en ultimasPorClientes:", error.message || error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Error interno" });
  }
}

export default {
  registrar,
  verificarActiva,
  obtenerPorCliente,
  ultima,
  diasRestantes,
  ultimasPorClientes,
};
