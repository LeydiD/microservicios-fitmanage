import {
    obtenerGananciasAnuales,
    obtenerGananciasPorMeses,
    obtenerGananciasPorRangoFechas,
    obtenerDetalleGananciasPorRangoFechas,
    obtenerMembresiasMasVendidasPorAnio,
    obtenerMembresiasMasVendidasPorMes,
    obtenerMembresiasMasVendidasPorRango
} from "../services/GananciaService.js";

// Ganancias anuales (por año)
export async function gananciasAnuales(req, res) {
    try {
        const data = await obtenerGananciasAnuales();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Ganancias por meses de un año específico
export async function gananciasMensuales(req, res) {
    const { anio } = req.params;

    if (!anio || isNaN(anio)) {
        return res.status(400).json({ message: "Debe proporcionar un año válido" });
    }

    try {
        const data = await obtenerGananciasPorMeses(parseInt(anio));
        res.json(data);
    } catch (error) {
        console.error("Error al obtener ganancias mensuales:", error);
        res.status(500).json({ message: error.message });
    }
}

// Ganancias por rango de fechas (por día)
export async function gananciasPorRango(req, res) {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: "Debe proporcionar fechaInicio y fechaFin" });
    }


    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ message: "Formato de fechas inválido. Use YYYY-MM-DD" });
    }

    try {
        const data = await obtenerGananciasPorRangoFechas(inicio, fin);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function detalleGananciasPorRango(req, res) {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: "Debe proporcionar fechaInicio y fechaFin" });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ message: "Fechas inválidas. Use formato YYYY-MM-DD" });
    }

    try {
        const data = await obtenerDetalleGananciasPorRangoFechas(inicio, fin);
        res.json(data);
    } catch (error) {
        console.error("Error al obtener detalle de ganancias:", error);
        res.status(500).json({ message: error.message });
    }
}


export async function membresiasMasVendidasPorAnio(req, res) {
    const { anio } = req.query;
    if (!anio) return res.status(400).json({ message: "Debe proporcionar el año" });

    try {
        const data = await obtenerMembresiasMasVendidasPorAnio(anio);
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}

export async function membresiasMasVendidasPorMes(req, res) {
    const { anio, mes } = req.query;
    if (!anio || !mes) return res.status(400).json({ message: "Debe proporcionar año y mes" });

    try {
        const data = await obtenerMembresiasMasVendidasPorMes(anio, mes);
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}

export async function membresiasMasVendidasPorRango(req, res) {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: "Debe proporcionar fechaInicio y fechaFin" });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Validar formato de fechas y orden lógico
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ message: "Fechas inválidas. Use formato YYYY-MM-DD" });
    }

    if (inicio > fin) {
        return res.status(400).json({ message: "La fecha de inicio no puede ser mayor que la fecha de fin" });
    }

    try {
        const data = await obtenerMembresiasMasVendidasPorRango(inicio, fin);
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}