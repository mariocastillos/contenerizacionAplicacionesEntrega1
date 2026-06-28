FROM node:20-alpine

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de definición de dependencias e instalar dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar el resto del código fuente de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación Express
EXPOSE 3000

# Comando por defecto para arrancar la aplicación
CMD ["npm", "start"]
