import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Inicio.css";
import logo from "../../../../public/Logo.png";
import {
  obtenerClientePorDNI,
  obtenerDiasRestantes,
} from "../../../api/ClienteApi.js";
import { registrarAsistencia } from "../../../api/AsistenciasApi.js";

function Inicio() {
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    dias: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isError, setIsError] = useState(false); // NUEVO

  const handleBuscar = async () => {
    setError("");
    setMensaje("");
    setIsError(false);
    try {
      const [clienteData, diasData] = await Promise.all([
        obtenerClientePorDNI(dni),
        obtenerDiasRestantes(dni),
      ]);
      setCliente({
        nombre: clienteData.nombre,
        email: clienteData.email,
        telefono: clienteData.telefono,
        dias: diasData?.dias ?? diasData?.diasRestantes ?? diasData ?? "",
      });
      localStorage.setItem("DNI", dni);
    } catch (err) {
      setIsError(true);
      setMensaje("Cliente no encontrado.");
      setCliente({ nombre: "", email: "", telefono: "", dias: "" });
      localStorage.removeItem("DNI");
    }
  };

  const handleAsistencia = async () => {
    setError("");
    setMensaje("");
    setIsError(false);
    try {
      await registrarAsistencia();
      setMensaje("Asistencia registrada con éxito");
    } catch (err) {
      setIsError(true);
      setMensaje("La asistencia ya fue registrada el día de hoy");
    }
  };

  return (
    <div className="container-fluid inicio-container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 p-3 d-flex justify-content-center align-items-center">
        {/* Columna del formulario */}
        <div className="col-12 col-md-6 mb-4">
          <div className="form-box p-4 rounded-4 bg-white h-100">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3 d-flex align-items-center justify-content-between">
                <label className="form-label mb-0 me-2 w-50">
                  Identificación
                </label>
                <input
                  type="text"
                  className="form-control me-2 w-100"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={handleBuscar}
                >
                  Buscar
                </button>
              </div>

              {error && <div className="text-danger mb-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={cliente.nombre}
                  disabled
                  style={{ backgroundColor: "#d9d9d9" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={cliente.email}
                  disabled
                  style={{ backgroundColor: "#d9d9d9" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Número de contacto</label>
                <input
                  type="text"
                  className="form-control"
                  value={cliente.telefono}
                  disabled
                  style={{ backgroundColor: "#d9d9d9" }}
                />
              </div>

              <div className="text-center mb-3">
                <strong className="fs-5">Días restantes</strong>
                <div className="fs-3">{cliente.dias || "0"}</div>
              </div>

              {mensaje && (
                <div
                  className={`alert ${
                    isError ? "alert-danger" : "alert-success"
                  } text-center`}
                  role="alert"
                >
                  {mensaje}
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleAsistencia}
                >
                  Asistencia
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna del logo */}
        <div className="col-12 col-md-4 text-center">
          <img
            src={logo}
            alt="Logo"
            className="img-fluid"
            style={{ maxWidth: "300px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Inicio;
