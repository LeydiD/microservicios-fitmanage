import AsistenciaService from "../services/AsistenciaService.js";

export async function registrarAsistencia(req, res) {
  try {
    const asistencia = await AsistenciaService.registrarAsistencia(
      req.body.id_cliente || req.body.dni || req.body.dni_cliente,
      req.body.dni_administrador || null
    );
    res.status(200).json(asistencia);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function listarAsistenciasPorCliente(req, res) {
  try {
    const { dni } = req.params;
    const fechas = await AsistenciaService.obtenerAsistenciasPorCliente(dni);
    res.json(fechas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
}

export async function obtenerAsistenciaSemanal(req, res) {
  try {
    const { dni } = req.params;
    const resultado = await AsistenciaService.obtenerAsistenciasUltimaSemana(dni);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
}

export default {
  registrarAsistencia,
  listarAsistenciasPorCliente,
  obtenerAsistenciaSemanal,
};
