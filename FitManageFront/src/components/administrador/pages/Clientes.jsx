import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Clientes.css";
import {
  obtenerClientes,
  obtenerClientePorDNI,
} from "../../../api/ClienteApi.js";
import { useModal } from "../../../context/ModalContext.jsx";

const EstadoBadge = ({ estado }) => {
  const estadoCapitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);
  const clase = estado === "activo" ? "estado-activo" : "estado-inactivo";

  return <span className={`estado-badge ${clase}`}>{estadoCapitalizado}</span>;
};

const Clientes = () => {
  const { showModal } = useModal();
  const [clientes, setClientes] = useState([]);
  const [allClientes, setAllClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [sinResultados, setSinResultados] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
        setAllClientes(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchClientes();
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    let filtrados = allClientes.filter(
      (cliente) =>
        (cliente.nombre || "").toLowerCase().includes(query) ||
        (cliente.DNI || "").includes(query)
    );

    if (estadoFiltro !== "Todos") {
      filtrados = filtrados.filter(
        (cliente) =>
          (cliente.estadoMembresia || "inactivo").toLowerCase() === estadoFiltro
      );
    }

    if (filtrados.length === 0) {
      setSinResultados(true);
    } else {
      setSinResultados(false);
    }
    setClientes(filtrados);
  };

  const handleEstadoChange = (estado) => {
    setEstadoFiltro(estado);

    const query = searchQuery.toLowerCase();
    let filtrados = allClientes.filter(
      (cliente) =>
        (cliente.nombre || "").toLowerCase().includes(query) ||
        (cliente.DNI || "").includes(query)
    );

    if (estado !== "Todos") {
      filtrados = filtrados.filter(
        (cliente) =>
          (cliente.estadoMembresia || "inactivo").toLowerCase() === estado
      );
    }

    if (filtrados.length === 0) {
      setSinResultados(true);
    } else {
      setSinResultados(false);
    }

    setClientes(filtrados);
  };

  const handleViewInfo = async (dni) => {
    try {
      const data = await obtenerClientePorDNI(dni);
      showModal(
        "Información del Cliente",
        <div>
          <p>
            <strong>Nombre:</strong> {data.nombre}
          </p>
          <p>
            <strong>DNI:</strong> {data.DNI}
          </p>
          <p>
            <strong>Teléfono:</strong> {data.telefono}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
          <p>
            <strong>Edad:</strong> {data.edad}
          </p>
          <p>
            <strong>Peso:</strong> {data.peso} kg
          </p>
          <p>
            <strong>Altura:</strong> {data.altura} m
          </p>
        </div>
      );
    } catch (error) {
      showModal(
        "Error",
        "No se pudo obtener la información del cliente.",
        "error"
      );
    }
  };

  const ordenarPorNombre = () => {
    const clientesOrdenados = [...clientes].sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();

      if (nombreA < nombreB) return ordenAscendente ? -1 : 1;
      if (nombreA > nombreB) return ordenAscendente ? 1 : -1;
      return 0;
    });

    setClientes(clientesOrdenados);
    setOrdenAscendente(!ordenAscendente);
  };
  return (
    <div className="clientes-container">
      <div className="clientes-content">
        <div className="search-bar d-flex align-items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o documento de identidad"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-danger" onClick={handleSearch}>
            <i className="bi bi-search me-1"></i> Buscar
          </button>

          <select
            className="form-select w-auto"
            value={estadoFiltro}
            onChange={(e) => handleEstadoChange(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="clientes-list">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={ordenarPorNombre}>
                    Nombre {ordenAscendente ? "▲" : "▼"}
                  </th>
                  <th>Tipo Membresía</th>
                  <th>Estado</th>
                  <th>Días Restantes</th>
                  <th>Información</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr key={index}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.tipoMembresia || "Sin membresía"}</td>
                    <td>
                      <EstadoBadge
                        estado={cliente.estadoMembresia || "inactivo"}
                      />
                    </td>
                    <td>{cliente.diasRestantes ?? 0}</td>
                    <td>
                      <button
                        className="ver-btn"
                        onClick={() => handleViewInfo(cliente.DNI)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sinResultados && (
            <div className="alert alert-warning mt-3" role="alert">
              No se encontraron clientes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientes;
