import { Op, fn, col, literal } from "sequelize";
import Membresia from "../models/Membresia.js";
import Suscripcion from "../models/Suscripcion.js";
import Pago from "../models/Pago.js";


export async function obtenerGananciasAnuales() {
    const pagos = await Pago.findAll({
        include: {
            model: Membresia,
            attributes: ['precio'],
            required: true
        },
        attributes: [
            [fn('YEAR', col('fecha_pago')), 'anio']
        ],
        raw: true
    });

    const ganancias = {};
    for (const pago of pagos) {
        const anio = pago.anio;
        const costo = parseFloat(pago['membresium.precio'] ?? 0);

        if (!ganancias[anio]) {
            ganancias[anio] = 0;
        }

        ganancias[anio] += costo;
    }

    return Object.entries(ganancias).map(([anio, total]) => ({
        anio,
        total
    }));
}



export async function obtenerGananciasPorMeses(anio) {
    try {
        const inicioAno = new Date(anio, 0, 1);
        const finAno = new Date(anio, 11, 31, 23, 59, 59);

        const pagos = await Pago.findAll({
            where: {
                fecha_pago: {
                    [Op.between]: [inicioAno, finAno],
                },
            },
            include: {
                model: Membresia,
                attributes: ['precio'],
                required: true
            },
            attributes: [
                [fn("MONTH", col("fecha_pago")), "mes"]
            ],
            raw: true
        });

        const gananciasPorMes = Array(12).fill(0);

        for (const pago of pagos) {
            const mes = parseInt(pago.mes) - 1;
            const precio = parseFloat(pago["membresium.precio"] ?? 0);
            gananciasPorMes[mes] += precio;
        }

        return gananciasPorMes;
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener las ganancias mensuales.");
    }
}


export async function obtenerGananciasPorRangoFechas(fechaInicio, fechaFin) {
    const fechaInicioStr = typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().slice(0, 10);
    const fechaFinStr = typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().slice(0, 10);

    const pagos = await Pago.findAll({
        where: {
            [Op.and]: [
                literal(`DATE(fecha_pago) >= '${fechaInicioStr}'`),
                literal(`DATE(fecha_pago) <= '${fechaFinStr}'`)
            ]
        },
        attributes: [
            [fn('DATE', col('fecha_pago')), 'fecha']
        ],
        include: {
            model: Membresia,
            attributes: ['precio'],
            required: true
        },
        order: [['fecha_pago', 'ASC']],
        raw: true
    });

    const gananciasPorFecha = {};

    for (const pago of pagos) {
        const fecha = pago.fecha;
        const precio = parseFloat(pago["membresium.precio"] ?? 0);
        if (!gananciasPorFecha[fecha]) {
            gananciasPorFecha[fecha] = 0;
        }

        gananciasPorFecha[fecha] += precio;
    }

    return Object.entries(gananciasPorFecha).map(([fecha, total]) => ({
        fecha,
        total
    }));
}


export async function obtenerDetalleGananciasPorRangoFechas(fechaInicio, fechaFin) {
    const fechaInicioStr = typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().slice(0, 10);
    const fechaFinStr = typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().slice(0, 10);

    const resultados = await Pago.findAll({
        where: {
            [Op.and]: [
                literal(`DATE(fecha_pago) >= '${fechaInicioStr}'`),
                literal(`DATE(fecha_pago) <= '${fechaFinStr}'`)
            ]
        },
        include: [
            {
                model: Membresia,
                attributes: ['tipo', 'precio'],
                required: true
            }
        ],
        attributes: ['fecha_pago', 'id_cliente'],
        order: [['fecha_pago', 'ASC']],
        raw: true
    });


    const datosProcesados = resultados.map(r => ({
        cliente: r.id_cliente,
        tipoMembresia: r["membresium.tipo"],
        fecha: r.fecha_pago,
        precio: r["membresium.precio"]
    }));


    const total = datosProcesados.reduce((suma, r) => suma + Number(r.precio), 0).toFixed(2);

    return {
        total,
        resultados: datosProcesados
    };
}


export async function obtenerMembresiasMasVendidasPorAnio(anio) {
    const inicio = new Date(anio, 0, 1);
    const fin = new Date(anio, 11, 31, 23, 59, 59);

    return Suscripcion.findAll({
        where: {
            fecha_inicio: {
                [Op.between]: [inicio, fin],
            },
        },
        include: [Membresia],
        attributes: [
            [col('suscripcion.id_membresia'), 'id_membresia'],
            [fn('COUNT', col('suscripcion.id_membresia')), 'cantidadVendida']
        ],
        group: ['suscripcion.id_membresia', 'membresium.id_membresia'],
        order: [[fn('COUNT', col('suscripcion.id_membresia')), 'DESC']]
    });
}


export async function obtenerMembresiasMasVendidasPorMes(anio, mes) {
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0);

    return Suscripcion.findAll({
        where: {
            fecha_inicio: {
                [Op.between]: [inicio, fin],
            },
        },
        include: [Membresia],
        attributes: [
            'id_membresia',
            [fn('COUNT', col('suscripcion.id_membresia')), 'cantidadVendida']
        ],
        group: ['suscripcion.id_membresia', 'membresium.id_membresia'],
        order: [[fn('COUNT', col('suscripcion.id_membresia')), 'DESC']]

    });
}

// MÁS VENDIDAS POR RANGO DE FECHAS
export async function obtenerMembresiasMasVendidasPorRango(inicio, fin) {
    fin.setDate(fin.getDate() + 1); // Aumentar un día para incluir la fecha final
    return Suscripcion.findAll({
        where: {
            fecha_inicio: {
                [Op.between]: [inicio, fin],
            },
        },
        include: [Membresia],
        attributes: [
            'id_membresia',
            [fn('COUNT', col('suscripcion.id_membresia')), 'cantidadVendida']
        ],
        group: ['suscripcion.id_membresia', 'membresium.id_membresia'],
        order: [[fn('COUNT', col('suscripcion.id_membresia')), 'DESC']]
    });
}