# Usar una imagen oficial de Node.js
FROM node:18

# Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código de la aplicación
COPY . .

# Exponer el puerto del servicio
EXPOSE 4005

# Comando para iniciar el servicio
CMD ["npm", "start"]
