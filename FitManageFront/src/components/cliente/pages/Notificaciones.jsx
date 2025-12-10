import React, { useContext, useEffect, useState } from "react";
import "./Notificaciones.css";
import { FaCheckCircle, FaRegCircle, FaTrash, FaBell, FaCalendar, FaExclamationTriangle } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { useModal } from "../../../context/ModalContext.jsx";
import {
  marcarNotificacionLeida,
  obtenerNotificacionesPorDNI,
  eliminarNotificacion,
} from "../../../api/NotificacionApi.js";

const opciones = [
  { value: "todos", label: "Todos" },
  { value: "asistencias", label: "Asistencias" },
  { value: "eventos", label: "Eventos" },
  { value: "vencimiento", label: "Vencimiento" },
];

const filtroMap = {
  asistencias: "asistencia",
  eventos: "evento",
  vencimiento: "vencimiento",
};

const Notificaciones = () => {
  const [filtro, setFiltro] = useState("todos");
  const [notificaciones, setNotificaciones] = useState([]);
  const { user } = useContext(AuthContext);
  const { showModal } = useModal();

  useEffect(() => {
    let interval;
    if (user?.DNI) {
      obtenerNotificacionesPorDNI(user.DNI)
        .then(setNotificaciones)
        .catch(() => setNotificaciones([]));

      // Consulta periódica cada 10 segundos
      interval = setInterval(() => {
        obtenerNotificacionesPorDNI(user.DNI)
          .then(setNotificaciones)
          .catch(() => setNotificaciones([]));
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const notificacionesFiltradas =
    filtro === "todos"
      ? notificaciones
      : notificaciones.filter(
        (n) => (n.etiqueta || "").toLowerCase() === filtroMap[filtro]
      );

  const notificacionesOrdenadas = [...notificacionesFiltradas].sort((a, b) => {
    if (a.estado === b.estado) return 0;
    return a.estado ? 1 : -1;
  });

  const handleMarcarLeida = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estado: !n.estado } : n))
      );
    } catch (e) {
      showModal("Error", "No se pudo cambiar el estado de la notificación", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (!id) {
      showModal("Error", "No se pudo identificar la notificación", "error");
      return;
    }

    showModal(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar esta notificación?",
      "info",
      async () => {
        try {
          await eliminarNotificacion(id);
          setNotificaciones((prev) => prev.filter((n) => n.id !== id));
        } catch (e) {
          showModal("Error", "No se pudo eliminar la notificación", "error");
        }
      }
    );
  };

  const getIconoPorTipo = (etiqueta) => {
    const tipo = (etiqueta || "").toLowerCase();
    switch (tipo) {
      case "asistencia":
        return <FaCheckCircle className="notif-icon-type" />;
      case "evento":
        return <FaBell className="notif-icon-type" />;
      case "vencimiento":
        return <FaExclamationTriangle className="notif-icon-type" />;
      default:
        return <FaCalendar className="notif-icon-type" />;
    }
  };

  const noLeidas = notificaciones.filter(n => !n.estado).length;

  return (
    <div className="notificaciones-bg">
      <div className="notificaciones-container-modern">
        <div className="notif-header-modern">
          <div className="notif-title-section">
            <div>
              <h1 className="notif-title">Notificaciones</h1>
              {noLeidas > 0 && (
                <p className="notif-subtitle">{noLeidas} sin leer</p>
              )}
            </div>
          </div>
          <select
            className="notif-filter-modern"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            {opciones.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className="notif-list-container">
          {notificacionesOrdenadas.length === 0 ? (
            <div className="notif-empty-state">
              <FaBell className="empty-icon" />
              <p className="empty-text">No hay notificaciones</p>
              <p className="empty-subtext">Te notificaremos cuando haya algo nuevo</p>
            </div>
          ) : (
            notificacionesOrdenadas.map((n, index) => (
              <div
                key={n.id}
                className={`notif-card notif-type-${(n.etiqueta || "").toLowerCase()} ${!n.estado ? "notif-unread" : "notif-read"}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="notif-card-left">
                  <div className={`notif-icon-container notif-icon-type-${(n.etiqueta || "").toLowerCase()}`}>
                    {getIconoPorTipo(n.etiqueta)}
                  </div>
                  <div className="notif-content">
                    <div className="notif-header-row">
                      <h3 className="notif-card-title">{n.titulo}</h3>
                      <span className={`notif-badge notif-badge-${(n.etiqueta || "").toLowerCase()}`}>
                        {n.etiqueta}
                      </span>
                    </div>
                    <p className="notif-card-message">{n.mensaje}</p>
                    {n.fecha_envio && (
                      <p className="notif-card-date">
                        <FaCalendar className="date-icon" />
                        {new Date(n.fecha_envio).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="notif-card-actions">
                  <button
                    className="notif-action-btn notif-read-btn"
                    onClick={() => handleMarcarLeida(n.id)}
                    title={n.estado ? "Marcar como no leída" : "Marcar como leída"}
                  >
                    {n.estado ? (
                      <FaCheckCircle className="action-icon read" />
                    ) : (
                      <FaRegCircle className="action-icon unread" />
                    )}
                  </button>
                  <button
                    className="notif-action-btn notif-delete-btn"
                    onClick={() => handleEliminar(n.id)}
                    title="Eliminar notificación"
                  >
                    <FaTrash className="action-icon delete" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;

