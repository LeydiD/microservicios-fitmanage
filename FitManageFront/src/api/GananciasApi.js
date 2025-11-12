import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/afiliaciones`;

// Obtener ganancias anuales
export const obtenerGananciasAnuales = async () => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/anuales`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Obtener ganancias mensuales por año
export const obtenerGananciasMensuales = async (anio) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/mensuales/${anio}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener ganancias mensuales:", error);
        throw error;
    }
};

// Obtener ganancias por rango de fechas
export const obtenerGananciasPorRango = async (fechaInicio, fechaFin) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/rango`, {
            params: {
                fechaInicio,
                fechaFin
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener ganancias por rango de fechas:", error);
        throw error;
    }
};

export const obtenerDetalleGananciasPorRango = async (inicio, fin) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/detalle-rango`, {
            params: {
                fechaInicio: inicio,
                fechaFin: fin,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const obtenerMembresiasMasVendidasPorAnio = async (anio) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/membresias/anio`, {
            params: { anio }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener membresías más vendidas por año:", error);
        throw error;
    }
};

// Obtener membresías más vendidas por mes
export const obtenerMembresiasMasVendidasPorMes = async (anio, mes) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/membresias/mes`, {
            params: { anio, mes }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener membresías más vendidas por mes:", error);
        throw error;
    }
};

// Obtener membresías más vendidas por rango de fechas
export const obtenerMembresiasMasVendidasPorRango = async (fechaInicio, fechaFin) => {
    try {
        const response = await axios.get(`${API_URL}/ganancias/membresias/rango`, {
            params: { fechaInicio, fechaFin }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener membresías más vendidas por rango de fechas:", error);
        throw error;
    }
};
