import express from "express";
import RutinaController from "../controllers/RutinaController.js";

const router = express.Router();

router.post("/chatbot", RutinaController.generarRutina);
router.get("/cliente/:id_cliente", RutinaController.obtenerRutinasCliente);
router.post("/prompt", RutinaController.guardarPrompt);

export default router;