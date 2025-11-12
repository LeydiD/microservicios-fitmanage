-- Script de inicialización para crear todas las bases de datos necesarias
CREATE DATABASE IF NOT EXISTS fitmanage;
CREATE DATABASE IF NOT EXISTS usuarios;
CREATE DATABASE IF NOT EXISTS afiliaciones;
CREATE DATABASE IF NOT EXISTS asistencias;
CREATE DATABASE IF NOT EXISTS notificaciones;
CREATE DATABASE IF NOT EXISTS rutinas;

-- Otorgar permisos al usuario root para todas las bases de datos
GRANT ALL PRIVILEGES ON fitmanage.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON usuarios.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON afiliaciones.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON asistencias.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON notificaciones.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON rutinas.* TO 'root'@'%';

FLUSH PRIVILEGES;