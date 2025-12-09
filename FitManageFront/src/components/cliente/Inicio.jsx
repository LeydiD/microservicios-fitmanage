import React, { useState, useEffect, useContext } from "react";
import "./Inicio.css";
import logo from "../../../public/Fondo.png";
import { AuthContext } from "../../context/AuthContext.jsx";
import { obtenerFinSuscripcion } from "../../api/ClienteApi.js";
import { obtenerAsistenciasSemanal } from "../../api/AsistenciasApi.js";

const Inicio = () => {
  const { user } = useContext(AuthContext);

  const [fechaFin, setFechaFin] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [rangoSemana, setRangoSemana] = useState({ inicio: "", fin: "" });

  useEffect(() => {
    if (!user?.DNI) return;

    const fetchData = async () => {
      try {
        const fechaFinSuscripcion = await obtenerFinSuscripcion(user.DNI);
        const asistenciasSemanal = await obtenerAsistenciasSemanal(user.DNI);

        setFechaFin(fechaFinSuscripcion.fecha_fin);
        setAsistencias(asistenciasSemanal);

        if (asistenciasSemanal.length > 0) {
          const fechas = asistenciasSemanal.map((d) => new Date(d.fecha));
          const fechaInicio = new Date(Math.min(...fechas));
          const fechaFin = new Date(Math.max(...fechas));

          const inicioStr = fechaInicio.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          const finStr = fechaFin.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          setRangoSemana({ inicio: inicioStr, fin: finStr });
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error.message);
      }
    };

    fetchData();
  }, [user]);

  const dias = asistencias.map((dia) => {
    const fechaObj = new Date(dia.fecha + "T00:00:00");
    const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const nombreDia = fechaObj.toLocaleDateString("es-ES", { weekday: "long" });

    return {
      name: nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1),
      date: fechaFormateada,
      active: dia.asistio,
    };
  });

  const fechaFinFormateada = fechaFin
    ? new Date(fechaFin).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="gym-dashboard">
      <div className="logo-container1">
        <img src={logo} alt="Gym Klinsmann" className="logo1" />
      </div>
      <div className="info">
        <p>
          Hola {user?.nombre}, tu membresía vence el día{" "}
          <strong>{fechaFinFormateada}</strong>
        </p>
        <p>
          SEMANA ACTUAL: DEL <strong>{rangoSemana.inicio}</strong> AL{" "}
          <strong>{rangoSemana.fin}</strong>
        </p>
      </div>
      <div className="days-container">
        {dias.map((day, index) => (
          <div
            key={index}
            className={`day-circle ${day.active ? "active" : ""}`}
          >
            <span className="day-name">{day.name}</span>
            <span className="day-date">{day.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inicio;
