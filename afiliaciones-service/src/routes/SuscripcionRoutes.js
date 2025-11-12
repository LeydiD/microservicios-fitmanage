import { Router } from "express";
import SuscripcionController from "../controllers/SuscripcionController.js";

const router = Router();

router.post("/", SuscripcionController.registrar);
// POST batch: obtener últimas suscripciones para una lista de clientes
router.post("/ultimas", SuscripcionController.ultimasPorClientes);
router.get("/cliente/:id", SuscripcionController.obtenerPorCliente);
router.get("/cliente/:id/ultima", SuscripcionController.ultima);
router.get("/cliente/:id/activa", SuscripcionController.verificarActiva);

// NUEVA RUTA
router.get("/cliente/:id/dias", SuscripcionController.diasRestantes);

export default router;
