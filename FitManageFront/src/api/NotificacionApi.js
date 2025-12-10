const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL_NOTIFICACIONES = `${API_URL}/notificaciones/notificaciones`;

import axios from "axios";

export const crearNotificacion = async (titulo, mensaje) => {
  try {
    const response = await axios.post(`${API_URL_NOTIFICACIONES}`, {
      titulo,
      mensaje,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error desconocido" };
  }
};

export const obtenerNotificacionesPorDNI = async (dni) => {
  try {
    const response = await axios.get(`${API_URL_NOTIFICACIONES}/${dni}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error desconocido" };
  }
};

export const marcarNotificacionLeida = async (id) => {
  try {
    const response = await axios.patch(`${API_URL_NOTIFICACIONES}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error desconocido" };
  }
};

export const eliminarNotificacion = async (id) => {
  try {
    await axios.delete(`${API_URL_NOTIFICACIONES}/${id}`);
  } catch (error) {
    throw error.response?.data || { message: "Error desconocido" };
  }
};
