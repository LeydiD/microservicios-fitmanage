import { Router } from "express";
import AsistenciaController from "../controllers/AsistenciaController.js";

const router = Router();

router.post("/", AsistenciaController.registrarAsistencia);
router.get("/:dni", AsistenciaController.listarAsistenciasPorCliente);
router.get("/semanal/:dni", AsistenciaController.obtenerAsistenciaSemanal);

export default router;
