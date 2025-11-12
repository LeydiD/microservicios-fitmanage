import { Router } from "express";
import {
  gananciasAnuales,
  gananciasMensuales,
  gananciasPorRango,
  detalleGananciasPorRango,
  membresiasMasVendidasPorAnio,
  membresiasMasVendidasPorMes,
  membresiasMasVendidasPorRango
} from "../controllers/GananciaController.js";


const router = Router();

router.get("/anuales", gananciasAnuales);
router.get("/mensuales/:anio", gananciasMensuales);
router.get("/rango", gananciasPorRango);
router.get("/detalle-rango", detalleGananciasPorRango);
router.get("/membresias/anio", membresiasMasVendidasPorAnio);
router.get("/membresias/mes", membresiasMasVendidasPorMes);
router.get("/membresias/rango", membresiasMasVendidasPorRango);

export default router;