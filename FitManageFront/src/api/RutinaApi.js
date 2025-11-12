const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/rutinas/rutinas`;
import axios from 'axios';

export const generarRutina = async ({ message, altura, peso, objetivo, nombre, id_cliente }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chatbot`, {
      message,
      altura,
      peso,
      objetivo,
      nombre,
      id_cliente
    }, {
      timeout: 300000, // 🔹 5 minutos para la IA
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout: La IA tardó demasiado en responder');
      throw new Error('La generación de la rutina está tomando demasiado tiempo. Intenta con un mensaje más específico.');
    }
    console.error('Error al generar la rutina:', error.response?.data || error.message);
    throw error;
  }
};


export const obtenerRutinasPorCliente = async (id_cliente) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cliente/${id_cliente}`, {
      timeout: 60000
    });
    return response.data;
  } catch (error) {
    throw new Error('No se pudo cargar el historial de rutinas.');
  }
};

