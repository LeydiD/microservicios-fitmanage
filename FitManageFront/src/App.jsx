import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login.jsx";
import AdminLayout from "./components/administrador/AdminLayout.jsx";
import InicioAdmin from "./components/administrador/pages/Inicio.jsx";
import Registro from "./components/administrador/pages/Registro.jsx";
import Clientes from "./components/administrador/pages/Clientes.jsx";
import ClienteLayout from "./components/cliente/ClienteLayout.jsx";
import InicioCliente from "./components/cliente/Inicio.jsx";
import ActualizarInformacion from "./components/cliente/pages/ActualizarInfo.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CrearContraseña from "./components/CrearContraseña.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import Membresias from "./components/administrador/pages/Membresias.jsx";
import Pagos from "./components/administrador/pages/Pagos.jsx";
import Ganancias from "./components/administrador/pages/Ganancias.jsx";
import RegistrarAsistencia from "./components/cliente/pages/RegistrarAsistencia.jsx";
import Asistencias from "./components/cliente/pages/Asistencias.jsx";
import Rutinas from "./components/cliente/pages/Rutinas.jsx";
// import Notificaciones from "./components/cliente/pages/Notificaciones.jsx";
// import EnviarNotificacion from "./components/administrador/pages/EnviarNotificacion.jsx";

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/crear-contrasena/:token"
            element={<CrearContraseña />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Rutas para Administración */}
          <Route element={<RutaProtegida rolRequerido="Administrador" />}>
            <Route path="/admin" element={<AdminLayout />}>
              {<Route index element={<InicioAdmin />} />}
              {/* <Route
                path="enviar-notificacion"
                element={<EnviarNotificacion />}
              /> */}
              <Route path="registro" element={<Registro />} />
              <Route path="clientes" element={<Clientes />} />
              {<Route path="membresias" element={<Membresias />} />}
              <Route path="registrar-pago" element={<Pagos />} />
              {<Route path="ganancias" element={<Ganancias />} />}
            </Route>
          </Route>

          {/* Rutas para Clientes */}
          <Route element={<RutaProtegida rolRequerido="Cliente" />}>
            <Route path="/cliente" element={<ClienteLayout />}>
              {<Route index element={<InicioCliente />} />}
              <Route path="actualizar" element={<ActualizarInformacion />} />
              <Route
                path="registrar-asistencia"
                element={<RegistrarAsistencia />}
              />
              <Route path="asistencias" element={<Asistencias />} />
              <Route path="rutinas" element={<Rutinas />} />
              {/* <Route path="notificaciones" element={<Notificaciones />} /> */}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
