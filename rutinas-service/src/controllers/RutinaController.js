import RutinaService from '../services/RutinaService.js';
import axios from 'axios';

async function generarRutina(req, res) {
    const { message, altura, peso, objetivo, nombre, id_cliente } = req.body;

    console.log("📩 Datos recibidos del frontend:", req.body);

    try {
        const resultado = await RutinaService.generarRutinaConIA({
            message, altura, peso, objetivo, nombre, id_cliente
        });

        console.log("✅ Rutina generada correctamente");
        
        // 🔹 CORRECCIÓN: Extraer solo el mensaje del objeto Sequelize
        const mensajeRutina = resultado.mensaje || resultado.dataValues?.mensaje || resultado;
        
        res.json({ 
            response: mensajeRutina,
            success: true 
        });
    } catch (error) {
        console.error("❌ Error al generar rutina:", error?.response?.data || error.message);
        res.status(500).json({ 
            error: 'Error al generar la rutina con IA',
            message: error.message 
        });
    }
}

export const obtenerRutinasCliente = async (req, res) => {
    const { id_cliente } = req.params;

    if (!id_cliente) {
        return res.status(400).json({ error: "Debe proporcionar el id_cliente" });
    }

    try {
        const resultado = await RutinaService.obtenerRutinasDeUnCliente(id_cliente);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


export const guardarPrompt = async (req, res) => {
    try {
        const { mensaje, id_cliente } = req.body;
        if (!mensaje || !id_cliente) {
            return res
                .status(400)
                .json({ error: "Los campos mensaje e id_cliente son obligatorios" });
        }

        const promptGuardado = await RutinaService.guardarPrompt(mensaje, id_cliente);
        res.status(201).json(promptGuardado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { generarRutina, obtenerRutinasCliente, guardarPrompt };