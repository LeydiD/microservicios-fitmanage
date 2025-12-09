import React, { useEffect, useState } from "react";
import "./Membresias.css";
import { Pencil, Trash2, Search } from "lucide-react";
import {
  obtenerMembresias,
  crearMembresia,
  actualizarMembresia,
  desactivarMembresia,
} from "../../../api/MembresiaApi";
import { useModal } from "../../../context/ModalContext.jsx";

const Membresias = () => {
  const { showModal } = useModal();
  const [membresias, setMembresias] = useState([]);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalConfirmacionVisible, setModalConfirmacionVisible] =
    useState(false);
  const [membresiaAEliminar, setMembresiaAEliminar] = useState(null);

  const [nuevaMembresia, setNuevaMembresia] = useState({
    tipo: "",
    duracion: "",
    precio: "",
  });
  const [editarMembresia, setEditarMembresia] = useState({
    id_membresia: "",
    tipo: "",
    precio: "",
  });

  useEffect(() => {
    const cargarMembresias = async () => {
      try {
        const data = await obtenerMembresias();
        setMembresias(data);
      } catch (error) {
        console.error("Error al cargar las membresías:", error);
      }
    };
    cargarMembresias();
  }, []);

  const membresiasFiltradas = membresias.filter(
    (m) =>
      m.activa === 1 &&
      (m.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.precio.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
        m.duracion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleVerDetalle = (membresia) => {
    setMembresiaSeleccionada(membresia);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNuevaMembresia({ tipo: "", duracion: "", precio: "" });
  };

  const handleCloseEditarModal = () => {
    setModalEditarVisible(false);
    setEditarMembresia({ id_membresia: "", tipo: "", precio: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaMembresia((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputEditarChange = (e) => {
    const { name, value } = e.target;
    setEditarMembresia((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarMembresia = async () => {
    try {
      const { tipo, duracion, precio } = nuevaMembresia;
      if (!tipo || !duracion || !precio) {
        showModal("Error al crear", "Todos los campos son obligatorios.");
        return;
      }
      const nueva = await crearMembresia(nuevaMembresia);
      setMembresias([...membresias, nueva]);
      handleCloseModal();
      showModal("Éxito", "La membresía se agregó con éxito.", "success");
    } catch (error) {
      showModal("Error", error.message || "Error al guardar la membresía", "error");
    }
  };

  const handleEditar = (membresia) => {
    setEditarMembresia({
      id_membresia: membresia.id_membresia,
      tipo: membresia.tipo,
      precio: membresia.precio,
    });
    setModalEditarVisible(true);
  };

  const handleActualizarMembresia = async () => {
    try {
      const { id_membresia, tipo, precio } = editarMembresia;

      if (!tipo && !precio) {
        showModal(
          "Campos vacíos",
          "Debes modificar al menos el tipo o el precio."
        );
        return;
      }

      const datosActualizados = {};
      if (tipo) datosActualizados.tipo = tipo;
      if (precio) datosActualizados.precio = precio;

      const actualizada = await actualizarMembresia(
        id_membresia,
        datosActualizados
      );

      setMembresias((prev) =>
        prev.map((m) =>
          m.id_membresia === id_membresia ? actualizada.membresia : m
        )
      );

      setModalEditarVisible(false);
      showModal("Éxito", "Membresía actualizada correctamente.", "success");
    } catch (error) {
      showModal("Error", "Error al actualizar membresia" || error.message, "error");
    }
  };

  const confirmarEliminacion = (membresia) => {
    setMembresiaAEliminar(membresia);
    setModalConfirmacionVisible(true);
  };

  const handleEliminarMembresia = async () => {
    try {
      await desactivarMembresia(membresiaAEliminar.id_membresia);
      setMembresias((prev) =>
        prev.filter((m) => m.id_membresia !== membresiaAEliminar.id_membresia)
      );
      showModal("Exito", "La membresía fue eliminada exitosamente.", "success");
      setModalConfirmacionVisible(false);
      setMembresiaAEliminar(null);
    } catch (error) {
      showModal("Error", "Error al eliminar membresia" || error.message, "error");
      setModalConfirmacionVisible(false);
    }
  };

  const handleCerrarModalConfirmacion = () => {
    setModalConfirmacionVisible(false);
    setMembresiaAEliminar(null);
  };

  return (
    <div className="container-grande">
      <div className="membresias-container">
        <h2 className="titulo">MEMBRESÍAS</h2>

        <div className="busqueda">
          <input
            type="text"
            placeholder="Buscar membresías"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button className="btn-nueva" onClick={handleOpenModal}>
          Nueva +
        </button>

        <div className="lista">
          {membresiasFiltradas.map((m, index) => (
            <div key={index} className="membresia-item">
              <span className="nombre">{m.tipo}</span>
              <span className="precio">${m.precio}</span>

              <div className="acciones">
                <div className="icono-tooltip">
                  <Search
                    className="icono"
                    onClick={() => handleVerDetalle(m)}
                  />
                  <span className="tooltip-text">Ver detalles</span>
                </div>
                <div className="icono-tooltip">
                  <Pencil className="icono" onClick={() => handleEditar(m)} />
                  <span className="tooltip-text">Editar</span>
                </div>
                <div className="icono-tooltip">
                  <Trash2
                    className="icono"
                    onClick={() => confirmarEliminacion(m)}
                  />
                  <span className="tooltip-text">Eliminar</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para crear nueva membresía */}
      {modalVisible && (
        <div className="modal1">
          <div className="modal1-content">
            <h3>Nueva membresía</h3>
            <input
              type="text"
              name="tipo"
              value={nuevaMembresia.tipo}
              onChange={handleInputChange}
              placeholder="Tipo"
              required
            />
            <input
              type="text"
              name="duracion"
              value={nuevaMembresia.duracion}
              onChange={handleInputChange}
              placeholder="Duración"
              required
            />
            <input
              type="number"
              name="precio"
              value={nuevaMembresia.precio}
              onChange={handleInputChange}
              placeholder="Precio"
              required
            />
            <button className="btn-guardar" onClick={handleGuardarMembresia}>
              Guardar
            </button>
            <button className="btn-cancelar" onClick={handleCloseModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal para editar membresía */}
      {modalEditarVisible && (
        <div className="modal1">
          <div className="modal1-content">
            <h3>Editar membresía</h3>
            <input
              type="text"
              name="tipo"
              value={editarMembresia.tipo}
              onChange={handleInputEditarChange}
              placeholder="Nuevo tipo"
            />
            <input
              type="number"
              name="precio"
              value={editarMembresia.precio}
              onChange={handleInputEditarChange}
              placeholder="Nuevo precio"
            />

            <button className="btn-guardar" onClick={handleActualizarMembresia}>
              Actualizar
            </button>
            <button className="btn-cancelar" onClick={handleCloseEditarModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal para ver detalle */}
      {membresiaSeleccionada && (
        <div className="modal1">
          <div className="modal1-content">
            <h3>Detalle de Membresía</h3>
            <p>
              <strong>Tipo:</strong> {membresiaSeleccionada.tipo}
            </p>
            <p>
              <strong>Duración:</strong> {membresiaSeleccionada.duracion}
            </p>
            <p>
              <strong>Precio:</strong> ${membresiaSeleccionada.precio}
            </p>
            <button
              className="btn-cancelar"
              onClick={() => setMembresiaSeleccionada(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {modalConfirmacionVisible && (
        <div className="modal1">
          <div className="modal1-content">
            <h3>Confirmar </h3>
            <p>
              ¿Seguro que deseas eliminar la membresía "
              {membresiaAEliminar.tipo}"?
            </p>
            <button className="btn-guardar" onClick={handleEliminarMembresia}>
              Confirmar
            </button>
            <button
              className="btn-cancelar"
              onClick={handleCerrarModalConfirmacion}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membresias;
