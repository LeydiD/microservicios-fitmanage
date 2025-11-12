import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button";
import { FaHome, FaUserPlus, FaUsers, FaUserFriends, FaIdCardAlt, FaRegMoneyBillAlt, FaChartLine } from "react-icons/fa";
import "./MenuAdmin.css";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { cambiarAvatar } from "../../api/LoginApi.js";
import { FaRegCommentDots } from "react-icons/fa";

const AVATARES = [
  "avatar1.png",
  "avatar2.png",
  "avatar3.png",
  "avatar4.png",
  "avatar5.png",
  "avatar6.png",
  "avatar7.png",
  "avatar8.png",
];

const MenuAdmin = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { logout, user, setUser } = useContext(AuthContext);
  const { showModal } = useModal();
  const [showSelector, setShowSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || "avatar.png"
  );
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [responsiveRadius, setResponsiveRadius] = useState(105); // desktop
  const [circleSize, setCircleSize] = useState(38); // desktop

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 478) {
        setResponsiveRadius(65);
        setCircleSize(28);
      } else {
        setResponsiveRadius(90);
        setCircleSize(38);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  const handleAvatarClick = () => {
    setShowSelector(true);
  };

  const handleCancel = () => {
    setShowSelector(false);
    setSelectedAvatar(user?.avatar || "avatar.png");
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await cambiarAvatar({ DNI: user.DNI, avatar: selectedAvatar });
      setUser({ ...user, avatar: selectedAvatar });
      setShowSelector(false);
      showModal("Éxito", "Avatar actualizado correctamente", "success");
      setTimeout(() => {
        const modalElement = document.querySelector(".modal");
        if (modalElement) {
          const closeButton = modalElement.querySelector(
            'button[aria-label="Close"]'
          );
          if (closeButton) closeButton.click();
        }
      }, 1000);
    } catch (error) {
      showModal("Error", "Error al actualizar avatar", "error");
    }
    setLoading(false);
  };

  const handleAvatarKeyDown = (e, i) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev + 1) % AVATARES.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      setFocusedIndex((prev) => (prev - 1 + AVATARES.length) % AVATARES.length);
    } else if (e.key === "Enter" || e.key === " ") {
      setSelectedAvatar(AVATARES[i]);
    }
  };

  useEffect(() => {
    if (showSelector) {
      const btn = document.getElementById(`avatar-btn-${focusedIndex}`);
      if (btn) btn.focus();
    }
  }, [focusedIndex, showSelector]);

  useEffect(() => {
    if (showSelector) {
      setSelectedAvatar(AVATARES[focusedIndex]);
    }
    // eslint-disable-next-line
  }, [focusedIndex]);

  return (
    <div className={`admin-menu ${isOpen ? "open" : "closed"}`}>
      <div className="admin-profile">
        <div
          className="admin-noti-edit"
          onClick={() => navigate("/admin/enviar-notificacion")}
          style={{ cursor: "pointer" }}
          title="Escribir notificación"
        >
          <FaRegCommentDots style={{ fontSize: 24 }} />
        </div>
        <div className="avatar-container" style={{ position: "relative" }}>
          <img
            src={`/${
              showSelector ? selectedAvatar : user?.avatar || "avatar1.png"
            }`}
            alt="Avatar"
            className="admin-avatar"
            onClick={handleAvatarClick}
            style={{ cursor: "pointer" }}
            title={
              !showSelector ? "Haz clic para cambiar tu avatar" : undefined
            }
          />
          {showSelector && (
            <div className="avatar-circle-selector">
              {AVATARES.map((avatar, i) => {
                const angle = (360 / (AVATARES.length + 2)) * i - 90;
                const x = responsiveRadius * Math.cos((angle * Math.PI) / 180);
                const y = responsiveRadius * Math.sin((angle * Math.PI) / 180);
                return (
                  <button
                    key={avatar}
                    id={`avatar-btn-${i}`}
                    className={`avatar-option-circle-btn${
                      focusedIndex === i ? " selected" : ""
                    }`}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${x}px - ${circleSize / 2}px)`,
                      top: `calc(50% + ${y}px - ${circleSize / 2}px)`,
                      zIndex: 2,
                      width: `${circleSize}px`,
                      height: `${circleSize}px`,
                      padding: 0,
                      border: "none",
                      background: "transparent",
                    }}
                    tabIndex={0}
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setFocusedIndex(i);
                    }}
                    onKeyDown={(e) => handleAvatarKeyDown(e, i)}
                  >
                    <img
                      src={`/${avatar}`}
                      alt={avatar}
                      style={{
                        width: `${circleSize - 6}px`,
                        height: `${circleSize - 6}px`,
                        borderRadius: "50%",
                        border:
                          selectedAvatar === avatar
                            ? "2px solid #d60000"
                            : "2px solid transparent",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                );
              })}
              {/* Botón cancelar (equis) */}
              <button
                className="avatar-circle-btn avatar-cancel"
                style={{
                  position: "absolute",
                  left: `calc(50% + ${
                    responsiveRadius *
                    Math.cos(
                      (((360 / (AVATARES.length + 2)) * AVATARES.length - 90) *
                        Math.PI) /
                        180
                    )
                  }px - ${circleSize / 2}px)`,
                  top: `calc(50% + ${
                    responsiveRadius *
                    Math.sin(
                      (((360 / (AVATARES.length + 2)) * AVATARES.length - 90) *
                        Math.PI) /
                        180
                    )
                  }px - ${circleSize / 2}px)`,
                  zIndex: 2,
                  width: `${circleSize}px`,
                  height: `${circleSize}px`,
                  fontSize: `${circleSize * 0.5}px`, // <-- aquí el cambio
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleCancel}
                disabled={loading}
              >
                ✖
              </button>
              {/* Botón confirmar (chulo) */}
              <button
                className="avatar-circle-btn avatar-confirm"
                style={{
                  position: "absolute",
                  left: `calc(50% + ${
                    responsiveRadius *
                    Math.cos(
                      (((360 / (AVATARES.length + 2)) * (AVATARES.length + 1) -
                        90) *
                        Math.PI) /
                        180
                    )
                  }px - ${circleSize / 2}px)`,
                  top: `calc(50% + ${
                    responsiveRadius *
                    Math.sin(
                      (((360 / (AVATARES.length + 2)) * (AVATARES.length + 1) -
                        90) *
                        Math.PI) /
                        180
                    )
                  }px - ${circleSize / 2}px)`,
                  zIndex: 2,
                  width: `${circleSize}px`,
                  height: `${circleSize}px`,
                  fontSize: `${circleSize * 0.5}px`, // <-- aquí el cambio
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={handleConfirm}
                disabled={loading}
              >
                ✔
              </button>
            </div>
          )}
        </div>
        <span
          className="admin-name"
          style={{ visibility: showSelector ? "hidden" : "visible" }}
        >
          Administrador
        </span>
      </div>
      <nav className="menu">
        <Link to="/admin" onClick={handleLinkClick}>
          <Button text="Inicio" icon={FaHome} />
        </Link>
        <Link to="/admin/registro" onClick={handleLinkClick}>
          <Button text="Registro" icon={FaUserPlus} />
        </Link>
        <Link to="/admin/clientes" onClick={handleLinkClick}>
          <Button text="Clientes" icon={FaUsers} />
        </Link>
        <Link to="/admin/membresias" onClick={handleLinkClick}>
          <Button text="Membresías" icon={FaIdCardAlt} />
        </Link>
        <Link to="/admin/registrar-pago" onClick={handleLinkClick}>
          <Button text="Registrar Pago" icon={FaRegMoneyBillAlt} />
        </Link>
        <Link to="/admin/ganancias" onClick={handleLinkClick}>
          <Button text="Ingresos" icon={FaChartLine} />
        </Link>
      </nav>
      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default MenuAdmin;
