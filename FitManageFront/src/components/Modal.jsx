import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Modal = ({ title, body, show, onClose, onCancel, type = "info" }) => {
  const headerColors = {
    error: "rgb(241, 110, 93)",
    success: "#d1e7dd",
    info: "#cfe2ff",
    details: "#cfe2ff",
  };

  const textColors = {
    error: "#842029",
    success: "#0f5132",
    info: "#084298",
    details: "#084298",
  };

  const icons = {
    error: <FaExclamationCircle style={{ marginRight: "8px" }} />,
    success: <FaCheckCircle style={{ marginRight: "8px" }} />,
    info: <FaInfoCircle style={{ marginRight: "8px" }} />,
    details: <FaInfoCircle style={{ marginRight: "8px" }} />,
  };

  const handleCancel = () => {
    setModalData({ ...modalData, show: false, onConfirm: null });
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{
          maxWidth: "500px",
          margin: "auto",
          position: "relative",
          top: "50%",
          transform: "translateY(-50%)",
          animation: show ? "fadeInUp 0.4s ease" : "none",
        }}
      >
        <div
          className="modal-content"
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            padding: "0",
          }}
        >
          <div
            className="modal-header"
            style={{
              backgroundColor: headerColors[type],
              color: textColors[type],
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5
              className="modal-title"
              style={{
                fontWeight: "600",
                fontSize: "1.25rem",
                margin: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {icons[type]} {title}
            </h5>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: textColors[type],
                cursor: "pointer",
                lineHeight: "1",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="modal-body" style={{ padding: "20px" }}>
            <p
              style={{
                fontSize: "1rem",
                color: "#555",
                marginBottom: "0",
              }}
            >
              {body}
            </p>
          </div>

          {type === "info" && (
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "16px 20px",
                borderTop: "1px solid #dee2e6"
              }}
            >
              <button
                onClick={onCancel}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "8px",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5a6268"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
              >
                Cancelar
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0b5ed7"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0d6efd"}
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
