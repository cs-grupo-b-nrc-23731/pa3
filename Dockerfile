# Usar Node 20.17.0 como imagen base
FROM node:20.17.0-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero
# Nota: Ajustamos la ruta según la ubicación relativa
COPY ./package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el resto de archivos
COPY . .

# Exponer puerto para Angular
EXPOSE 4200

# Comando para iniciar la aplicación
CMD ["npm", "start", "--", "--host", "0.0.0.0"]