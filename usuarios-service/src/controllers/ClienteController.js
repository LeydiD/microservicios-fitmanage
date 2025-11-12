import {
  listar as listarClientes,
  buscarPorCedula as buscarPCedula,
  registrarCliente as registrarCliente,
  actualizarCliente as actualizarClienteS,
  actualizarContraseña as actualizarContraseñaCliente,
} from "../services/ClienteServices.js";
import apiClient from "../utils/ApiClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export async function listar(req, res) {
  try {
    // Obtener clientes desde la base de datos
    const clientes = await listarClientes();

    // Si no hay clientes, devolver lista vacía
    if (!Array.isArray(clientes) || clientes.length === 0) {
      return res.json([]);
    }

    const clientesIds = clientes.map((c) => c.DNI);
    let ultimas = [];
    try {
      ultimas = await apiClient.obtenerUltimasSuscripciones(clientesIds);
    } catch (err) {
      console.warn(
        "No se pudieron obtener últimas suscripciones desde afiliaciones:",
        err.message || err
      );
      ultimas = [];
    }

    // Mapear por id_cliente
    const mapUltimas = new Map();
    for (const u of ultimas) {
      // Normalizar campo id_cliente
      const id = u.id_cliente ?? u.id_cliente;
      mapUltimas.set(String(id), u);
    }

    const resultado = clientes.map((cliente) => {
      const ultima = mapUltimas.get(String(cliente.DNI));
      let tipoMembresia = null;
      let estadoMembresia = "inactivo";
      let diasRestantes = 0;

      if (ultima && ultima.fecha_fin) {
        const fechaFin = new Date(ultima.fecha_fin);
        const hoy = new Date();
        const diffMs = fechaFin - hoy;
        diasRestantes =
          diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
        estadoMembresia = diasRestantes > 0 ? "activo" : "inactivo";
        tipoMembresia =
          (ultima.membresia && ultima.membresia.tipo) ||
          (ultima.membresium && ultima.membresium.tipo) ||
          ultima.tipo_membresia ||
          ultima.tipo ||
          null;
      }

      return {
        DNI: cliente.DNI,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        tipoMembresia,
        estadoMembresia,
        diasRestantes,
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res
      .status(500)
      .json({ message: "Error al obtener clientes", error: error.message });
  }
}

export async function buscarPorCedula(req, res) {
  try {
    const { id } = req.params;
    const cliente = await buscarPCedula(id);

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar cliente" });
  }
}

export async function registrar(req, res) {
  try {
    const { DNI, nombre, telefono, email, edad, peso, altura } = req.body;

    if (!DNI || !nombre || !telefono || !email || !edad || !peso || !altura) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const clienteExistente = await buscarPCedula(DNI);
    console.log("Cliente existente:", clienteExistente);
    if (clienteExistente) {
      return res.status(400).json({ message: "El cliente ya está registrado" });
    }

    const nuevoCliente = await registrarCliente({
      DNI,
      nombre,
      telefono,
      email,
      edad,
      peso,
      altura,
    });
    const token = jwt.sign({ DNI }, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });
    const link = `${process.env.FRONTEND_URL}/crear-contrasena/${token}`;

    await apiClient.enviarNotificacion(
      email,
      "Crea tu contraseña",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hola ${nombre},</h2>
          <p style="font-size: 16px; color: #555;">
            Gracias por registrarte en <strong>Gym Klinsmann</strong>. Para crear tu contraseña, haz clic en el siguiente botón:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color:rgb(255, 0, 0); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Crear contraseña
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:
          </p>
          <p style="word-break: break-all; font-size: 14px; color:rgb(255, 0, 0);">
            ${link}
          </p>
          <p style="font-size: 14px; color: #999;">
            Este enlace expirará en 3 días.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} Gym Klinsmann. Todos los derechos reservados.
          </p>
        </div>
      `
    );
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export async function actualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const nuevosDatos = req.body;

    const clienteActualizado = await actualizarClienteS(id, nuevosDatos);

    res.json({
      message: "Cliente actualizado correctamente",
      cliente: clienteActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar cliente", error: error.message });
  }
}

export async function crearContraseña(req, res) {
  try {
    const { token } = req.params;
    const { contraseña } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { DNI } = decoded;

    const contraseñaHasheada = await bcrypt.hash(contraseña, 10);
    await actualizarContraseñaCliente(DNI, contraseñaHasheada);

    res.json({ message: "Contraseña creada exitosamente" });
  } catch (error) {
    console.error("Error al crear contraseña:", error.message);
    res.status(400).json({ message: error.message });
  }
}
