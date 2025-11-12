import React, { useState, useEffect } from "react";
import "./Ganancias.css";
import { Bar, Pie } from "react-chartjs-2";
import { saveAs } from "file-saver";
import Papa from "papaparse";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  obtenerGananciasAnuales,
  obtenerGananciasMensuales,
  obtenerGananciasPorRango,
  obtenerDetalleGananciasPorRango,
  obtenerMembresiasMasVendidasPorMes,
  obtenerMembresiasMasVendidasPorRango,
  obtenerMembresiasMasVendidasPorAnio,
} from "../../../api/GananciasApi.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Ganancias = () => {
  // Estados generales
  const [tipoReporte, setTipoReporte] = useState("Ganancias");
  const [frecuencia, setFrecuencia] = useState("Anual");

  // Para Ganancias
  const [anio, setAnio] = useState("");
  const [inicioGrafico, setInicioGrafico] = useState("");
  const [finGrafico, setFinGrafico] = useState("");
  const [dataGrafico, setDataGrafico] = useState(null);
  const [errorGrafico, setErrorGrafico] = useState("");

  // Para tabla de detalle ganancias
  const [inicioTabla, setInicioTabla] = useState("");
  const [finTabla, setFinTabla] = useState("");
  const [detalleGanancias, setDetalleGanancias] = useState([]);
  const [gananciasTotales, setGananciasTotales] = useState("");
  const [mensaje, setMensajes] = useState("");
  // Para Membresías
  const [mesMembresia, setMesMembresia] = useState("");
  const [dataMembresiasGrafico, setDataMembresiasGrafico] = useState(null);

  // Datos para gráfico de barras (Ganancias)
  const dataBar = {
    labels: dataGrafico?.labels || [],
    datasets: [
      {
        label: "Ingresos en Pesos",
        data: dataGrafico?.data || [],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Datos para gráfico circular (Membresías)
  const dataPie = {
    labels: dataMembresiasGrafico?.labels || [],
    datasets: [
      {
        label: "Membresías Vendidas",
        data: dataMembresiasGrafico?.data || [],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(14, 165, 233, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(14, 165, 233, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // Función para obtener datos del gráfico
  const handleBuscarGrafico = async () => {
    try {
      setErrorGrafico("");
      if (tipoReporte === "Ganancias") {
        let dataObtenida;
        if (frecuencia === "Mensual") {
          if (!anio) {
            setErrorGrafico("Debe seleccionar un año válido.");
            return;
          }
          dataObtenida = await obtenerGananciasMensuales(anio);
          setDataGrafico({
            labels: [
              "Ene",
              "Feb",
              "Mar",
              "Abr",
              "May",
              "Jun",
              "Jul",
              "Ago",
              "Sep",
              "Oct",
              "Nov",
              "Dic",
            ],
            data: dataObtenida,
          });
        } else if (frecuencia === "Diario") {
          const diferenciaDias =
            (new Date(finGrafico) - new Date(inicioGrafico)) /
            (1000 * 60 * 60 * 24);
          if (diferenciaDias > 31 || diferenciaDias < 0) {
            setErrorGrafico(
              "El rango de fechas debe ser máximo de 31 días y válido."
            );
            return;
          }
          dataObtenida = await obtenerGananciasPorRango(
            inicioGrafico,
            finGrafico
          );
          setDataGrafico({
            labels: dataObtenida.map((item) => item.fecha),
            data: dataObtenida.map((item) => item.total),
          });
        } else if (frecuencia === "Anual") {
          dataObtenida = await obtenerGananciasAnuales();
          setDataGrafico({
            labels: dataObtenida.map((item) => item.anio),
            data: dataObtenida.map((item) => item.total),
          });
        }
      } else if (tipoReporte === "Membresias") {
        if (frecuencia === "Mensual") {
          if (!anio || !mesMembresia) {
            setErrorGrafico("Debe seleccionar año y mes para membresías.");
            return;
          }

          const dataObtenida = await obtenerMembresiasMasVendidasPorMes(
            anio,
            mesMembresia
          );

          if (!dataObtenida || dataObtenida.length === 0) {
            setErrorGrafico("No hay datos para el mes y año seleccionados.");
            setDataMembresiasGrafico(null);
            return;
          }

          setDataMembresiasGrafico({
            labels: dataObtenida.map((item) => item.membresium.tipo),
            data: dataObtenida.map((item) => item.cantidadVendida),
          });
        }

        if (frecuencia === "Diario") {
          if (inicioGrafico > finGrafico) {
            setErrorGrafico(
              "La fecha de inicio no puede ser mayor a la de fin."
            );
            setDataMembresiasGrafico(null);
            return;
          }

          const dataObtenida = await obtenerMembresiasMasVendidasPorRango(
            inicioGrafico,
            finGrafico
          );

          if (!dataObtenida || dataObtenida.length === 0) {
            setErrorGrafico("No hay datos en el rango seleccionados.");
            setDataMembresiasGrafico(null);
            return;
          }

          setDataMembresiasGrafico({
            labels: dataObtenida.map((item) => item.membresium.tipo),
            data: dataObtenida.map((item) => item.cantidadVendida),
          });
        }

        if (frecuencia === "Anual") {
          const dataObtenida = await obtenerMembresiasMasVendidasPorAnio(anio);

          if (!dataObtenida || dataObtenida.length === 0) {
            setErrorGrafico("No hay datos en el año seleccionado");
            setDataMembresiasGrafico(null);
            return;
          }

          setDataMembresiasGrafico({
            labels: dataObtenida.map((item) => item.membresium.tipo),
            data: dataObtenida.map((item) => item.cantidadVendida),
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setErrorGrafico(
        error.response?.data?.mensaje || error.message || "Error inesperado"
      );
    }
  };

  // Función para buscar detalle ganancias (solo para tipo Ganancias)
  const handleBuscarTabla = async () => {
    try {
      if (tipoReporte !== "Ganancias") return;
      setMensajes(null);
      if (new Date(inicioTabla) > new Date(finTabla)) {
        setMensajes("La fecha de inicio no puede ser mayor a la de fin.");
        return;
      }
      const data = await obtenerDetalleGananciasPorRango(inicioTabla, finTabla);
      setDetalleGanancias(data.resultados);
      setGananciasTotales(data.total);
    } catch (error) {
      console.error("Error al obtener detalle de ganancias:", error);
    }
  };

  const handleGenerarCSV = () => {
    const csv = Papa.unparse(detalleGanancias, {
      delimiter: ";",
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "detalle_ganancias.csv");
  };

  // Ejecutar búsqueda al cambiar filtros relevantes
  useEffect(() => {
    if (tipoReporte === "Ganancias") {
      if (frecuencia === "Anual") {
        handleBuscarGrafico();
      } else if (frecuencia === "Mensual" && anio) {
        handleBuscarGrafico();
      } else if (frecuencia === "Diario" && inicioGrafico && finGrafico) {
        handleBuscarGrafico();
      }
    } else if (tipoReporte === "Membresias") {
      if (frecuencia === "Mensual" && anio && mesMembresia) {
        handleBuscarGrafico();
      }
      if (frecuencia === "Anual" && anio) {
        handleBuscarGrafico();
      }

      if (frecuencia === "Diario" && inicioGrafico && finGrafico) {
        handleBuscarGrafico();
      }
    }
  }, [tipoReporte, frecuencia, anio, inicioGrafico, finGrafico, mesMembresia]);

  useEffect(() => {
    setAnio("");
    setInicioGrafico("");
    setFinGrafico("");
    setDetalleGanancias([]);
    setGananciasTotales("");
    setDataGrafico(null);
    setDataMembresiasGrafico(null);
    setMesMembresia("");
    setErrorGrafico("");
  }, [frecuencia, tipoReporte]);

  return (
    <div className="dashboard-container">
      <div className="main-card">
        <div className="header-section">
          <div className="header-icon">
            {tipoReporte === "Ganancias" ? (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
          <div className="header-content">
            <h1 className="main-title">
              Dashboard de{" "}
              {tipoReporte === "Ganancias" ? "Ganancias" : "Membresías"}
            </h1>
            <p className="subtitle">
              {tipoReporte === "Ganancias"
                ? "Analiza tus ingresos y rendimiento financiero"
                : "Descubre las membresías más populares"}
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="control-group">
            <label className="control-label">Tipo de Reporte</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${
                  tipoReporte === "Ganancias" ? "active" : ""
                }`}
                onClick={() => setTipoReporte("Ganancias")}
              >
                Ingresos
              </button>
              <button
                className={`toggle-btn ${
                  tipoReporte === "Membresias" ? "active" : ""
                }`}
                onClick={() => setTipoReporte("Membresias")}
              >
                Membresías
              </button>
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Frecuencia</label>
              <select
                className="modern-select"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="Diario">📅 Diario</option>
                <option value="Mensual">📆 Mensual</option>
                <option value="Anual">🗓️ Anual</option>
              </select>
            </div>

            {/* Campos dinámicos basados en selección */}
            {tipoReporte === "Ganancias" && frecuencia === "Mensual" && (
              <div className="filter-group">
                <label className="filter-label">Año</label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="2024"
                  className="modern-input"
                  min="2020"
                  max="2030"
                />
              </div>
            )}

            {tipoReporte === "Ganancias" && frecuencia === "Diario" && (
              <>
                <div className="filter-group">
                  <label className="filter-label">Fecha Inicio</label>
                  <input
                    type="date"
                    value={inicioGrafico}
                    onChange={(e) => setInicioGrafico(e.target.value)}
                    className="modern-input"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Fecha Fin</label>
                  <input
                    type="date"
                    value={finGrafico}
                    onChange={(e) => setFinGrafico(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </>
            )}

            {tipoReporte === "Membresias" && frecuencia === "Mensual" && (
              <>
                <div className="filter-group">
                  <label className="filter-label">Año</label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    placeholder="2024"
                    className="modern-input"
                    min="2020"
                    max="2030"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Mes</label>
                  <select
                    value={mesMembresia}
                    onChange={(e) => setMesMembresia(e.target.value)}
                    className="modern-select"
                  >
                    <option value="">Seleccionar mes</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>
              </>
            )}

            {tipoReporte === "Membresias" && frecuencia === "Anual" && (
              <div className="filter-group">
                <label className="filter-label">Año</label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="2024"
                  className="modern-input"
                  min="2020"
                  max="2030"
                />
              </div>
            )}

            {tipoReporte === "Membresias" && frecuencia === "Diario" && (
              <>
                <div className="filter-group">
                  <label className="filter-label">Fecha Inicio</label>
                  <input
                    type="date"
                    value={inicioGrafico}
                    onChange={(e) => setInicioGrafico(e.target.value)}
                    className="modern-input"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Fecha Fin</label>
                  <input
                    type="date"
                    value={finGrafico}
                    onChange={(e) => setFinGrafico(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errorGrafico && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="15"
                y1="9"
                x2="9"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            {errorGrafico}
          </div>
        )}

        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">
              {tipoReporte === "Ganancias"
                ? "Análisis de Ingresos"
                : "Membresías Más Vendidas"}
            </h3>
            <div className="chart-info">
              <span className="chart-period">{frecuencia}</span>
            </div>
          </div>

          <div className="chart-container">
            {tipoReporte === "Ganancias" && (
              <Bar
                data={dataBar}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "white",
                      bodyColor: "white",
                      borderColor: "rgba(99, 102, 241, 1)",
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        callback: function (value) {
                          return "$" + value.toLocaleString();
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            )}

            {tipoReporte === "Membresias" && (
              <Pie
                data={dataPie}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "white",
                      bodyColor: "white",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Table Section (only for Ganancias) */}
        {tipoReporte === "Ganancias" && (
          <div className="table-section">
            <div className="table-header">
              <h3 className="table-title">Detalle de Transacciones</h3>
              <div className="table-controls">
                <div className="date-inputs">
                  <input
                    type="date"
                    value={inicioTabla}
                    onChange={(e) => setInicioTabla(e.target.value)}
                    className="modern-input small"
                  />
                  <span className="date-separator">hasta</span>
                  <input
                    type="date"
                    value={finTabla}
                    onChange={(e) => setFinTabla(e.target.value)}
                    className="modern-input small"
                  />
                </div>
                <div className="action-buttons">
                  <button onClick={handleBuscarTabla} className="btn-primary">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="m21 21-4.35-4.35"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    Buscar
                  </button>
                  <button
                    onClick={handleGenerarCSV}
                    disabled={
                      !inicioTabla || !finTabla || detalleGanancias.length === 0
                    }
                    className="btn-secondary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <polyline
                        points="7,10 12,15 17,10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="12"
                        y1="15"
                        x2="12"
                        y2="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    Exportar CSV
                  </button>
                </div>
              </div>
            </div>

            {gananciasTotales && (
              <div className="total-earnings">
                <div className="total-card">
                  <div className="total-icon">💰</div>
                  <div className="total-content">
                    <span className="total-label">Ganancias Totales</span>
                    <span className="total-amount">${gananciasTotales}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo de Membresía</th>
                    <th>Fecha</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleGanancias.length > 0 ? (
                    detalleGanancias.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-info">
                            <span>{item.cliente}</span>
                          </div>
                        </td>
                        <td>
                          <span className="membership-badge">
                            {item.tipoMembresia}
                          </span>
                        </td>
                        <td>{item.fecha}</td>
                        <td>
                          <span className="price-tag">${item.precio}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <div className="empty-content">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M8 12l2 2 4-4"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          <p>No hay datos para mostrar</p>
                          <small>
                            {mensaje ||
                              "Selecciona un rango de fechas y haz clic en buscar"}
                          </small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ganancias;
