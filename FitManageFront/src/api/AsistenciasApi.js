const API_URL = `${import.meta.env.VITE_BACKEND_URL}/asistencias/asistencia`;

export const registrarAsistencia = async () => {
  try {
    const dni = localStorage.getItem("DNI");
    if (!dni) {
      throw new Error("No se encontró el DNI en el almacenamiento local");
    }
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_cliente: dni,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar asistencia");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en registrarAsistencia:", error);
    throw error;
  }
};

export async function obtenerAsistenciasPorCliente(dni) {
  try {
    const response = await fetch(`${API_URL}/${dni}`);
    if (!response.ok) throw new Error("Error al obtener asistencias");
    const fechas = await response.json();
    return fechas;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function obtenerAsistenciasSemanal(dni) {
  try {
    const response = await fetch(`${API_URL}/semanal/${dni}`);
    if (!response.ok) throw new Error("Error al obtener asistencias");
    const fechas = await response.json();
    return fechas;
  } catch (error) {
    throw new Error("Error al obtener asistencias semanales: " + error.message);
  }
}

