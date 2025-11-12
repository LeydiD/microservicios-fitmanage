import React from "react";
import "../components/administrador/MenuAdmin.css";


const Button = ({ text, isActive, onClick, icon: Icon }) => {
  return (
    <button
      className={`menu-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {Icon && (
        <span className="btn-icon" aria-hidden>
          <Icon />
        </span>
      )}
      <span className="btn-text">{text}</span>
    </button>
  );
};

export default Button;
