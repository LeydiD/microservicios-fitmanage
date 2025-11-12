import axios from 'axios';
import Rutina from "../models/Rutina.js";
import apiClient from "../utils/ApiCliente.js";
import db from "../db/db.js"; // 🔹 Importa tu conexión Sequelize

async function generarRutinaConIA({ message, altura, peso, objetivo, nombre, id_cliente }) {
    console.log("🔹 === INICIO DE GENERACIÓN ===");
    console.log("🔹 ID Cliente:", id_cliente);
    console.log("🔹 Mensaje:", message);
    console.log("🔹 Timestamp:", new Date().toISOString());

    try {
        // 🔹 PASO 1: Verificar que el cliente existe (sin transacción aún)
        const cliente = await apiClient.verificarClienteExiste(id_cliente);
        if (!cliente) {
            throw new Error("Cliente no encontrado");
        }

        // 🔹 PASO 2: Construir el prompt para la IA
        const palabrasRutina = ['rutina', 'ejercicio', 'entrenamiento', 'workout', 'entrenar',
            'pecho', 'espalda', 'triceps', 'biceps', 'pierna', 'isquios', 'brazo', 'abdomen',
            'hombro', 'cuadriceps', 'tren superior', 'tren inferior', 'cardio', 'gimnasio'];

        const saludos = ['hola', 'buenas', 'hey', 'hi', 'buenos días', 'buenas tardes', 'buenas noches'];

        const contieneRutina = palabrasRutina.some(p => message.toLowerCase().includes(p));
        const esSoloSaludo = saludos.some(s => message.toLowerCase().includes(s)) && !contieneRutina && message.length < 20;

        let prompt = "";
        if (esSoloSaludo) {
            prompt = `Como entrenador personal de FitManage, saluda brevemente a ${nombre}. Puedes usar algunos emojis.`;
        } else if (contieneRutina) {
            prompt = `No saludes ni al inicio ni al final. Como entrenador de FitManage, diseña una rutina personalizada para ${nombre}.
Altura: ${altura}cm | Peso: ${peso}kg | Objetivo: ${objetivo}
Consulta: "${message}"
Debe incluir: calentamiento, rutina principal (series y repeticiones), descanso e hidratación.`;
        } else {
            prompt = `Responde a: ${message}
Datos del cliente: ${nombre} (${altura}cm, ${peso}kg) con objetivo: ${objetivo}.
Usa emojis y tono profesional.`;
        }

        // 🔹 PASO 3: LLAMAR A LA IA PRIMERO (SIN ABRIR TRANSACCIÓN AÚN)
        console.log("🤖 Llamando a la IA (sin guardar nada en BD aún)...");
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: "Entrenador personal experto en fitness y nutrición." },
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": `${process.env.BACKEND_URL}`,
                    "X-Title": "FitManage-AI-Chat"
                },
                timeout: 240000, // 4 minutos
            }
        );

        const resultado = response.data.choices?.[0]?.message?.content;
        if (!resultado) {
            throw new Error("No se recibió contenido válido de la IA");
        }

        console.log("✅ Respuesta de la IA recibida (longitud):", resultado.length);

        // 🔹 PASO 4: AHORA SÍ ABRIR TRANSACCIÓN Y GUARDAR TODO
        console.log("📝 Iniciando transacción para guardar en BD...");
        const transaction = await db.transaction();

        try {
            // Guardar el prompt del usuario
            const promptGuardado = await Rutina.create({
                mensaje: typeof message === "string" ? message : JSON.stringify(message),
                es_prompt: true,
                id_cliente,
            }, { transaction });
            console.log("✅ Prompt guardado con ID:", promptGuardado.id_rutina);

            // Guardar la respuesta del bot
            const nuevaRutina = await Rutina.create({
                mensaje: resultado,
                es_prompt: false,
                id_cliente,
            }, { transaction });
            console.log("✅ Respuesta guardada con ID:", nuevaRutina.id_rutina);

            // Confirmar transacción
            await transaction.commit();
            console.log("✅ Transacción completada exitosamente");
            console.log("🔹 === FIN DE GENERACIÓN ===");

            // Retornar el objeto de la rutina
            return nuevaRutina;

        } catch (dbError) {
            // Si falla al guardar, hacer rollback
            await transaction.rollback();
            console.error("❌ Error al guardar en BD, rollback ejecutado:", dbError.message);
            throw dbError;
        }

    } catch (error) {
        console.error("❌ Error en generarRutinaConIA:", error.message);

        if (error.code === 'ECONNABORTED') {
            throw new Error("La IA tardó demasiado en responder. Intenta con un mensaje más corto.");
        }

        throw new Error("Error al generar la rutina: " + error.message);
    }
}

async function obtenerRutinasDeUnCliente(id_cliente) {
    try {
        const cliente = await apiClient.verificarClienteExiste(id_cliente);

        if (!cliente) {
            throw new Error("Cliente no encontrado en el microservicio de usuarios.");
        }

        const historial_rutinas = await Rutina.findAll({
            where: { id_cliente },
            order: [["fecha_generacion", "ASC"]]
        });

        return {
            cliente: cliente.nombre,
            rutinas: historial_rutinas,
        };
    } catch (error) {
        console.error("❌ Error al obtener las rutinas del cliente:", error.message);
        throw new Error("No se pudieron obtener las rutinas del cliente: " + error.message);
    }
}

async function guardarPrompt(mensaje, id_cliente) {
    if (!mensaje || !id_cliente) {
        throw new Error("Los parámetros deben estar completos (mensaje e id_cliente)");
    }

    try {
        const cliente = await apiClient.verificarClienteExiste(id_cliente);
        if (!cliente) {
            throw new Error("Cliente no encontrado");
        }

        const nuevoPrompt = await Rutina.create({
            mensaje: typeof mensaje === "string" ? mensaje : JSON.stringify(mensaje),
            es_prompt: true,
            id_cliente,
        });

        return nuevoPrompt;
    } catch (error) {
        console.error("Error al guardar el mensaje del cliente:", error.message);
        throw new Error("No se pudo guardar el mensaje del cliente: " + error.message);
    }
}

export default {
    generarRutinaConIA,
    obtenerRutinasDeUnCliente,
    guardarPrompt
};