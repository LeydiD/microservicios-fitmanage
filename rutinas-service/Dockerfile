# Imagen base con Node
FROM node:18

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (ajústalo si tu servicio usa otro)
EXPOSE 4004

# Comando de arranque
CMD [ "npm", "start" ]
