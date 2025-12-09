import { Router } from "express";
import { enviarCorreoController } from "../controllers/NotificacionController.js";
import NotificacionController from "../controllers/NotificacionController.js";

const router = Router();

router.post("/email", enviarCorreoController);
router.post("/", NotificacionController.crearNotificacion);
router.get("/:dni", NotificacionController.obtenerNotificaciones);
router.patch("/:id_notificacion", NotificacionController.cambiarEstado);
router.delete(
  "/:id_notificacion",
  NotificacionController.eliminarNotificacionUsuario
);

export default router;
