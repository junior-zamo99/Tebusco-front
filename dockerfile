# --- ETAPA 1: Construcción (Node.js) ---
FROM node:20-alpine as build

WORKDIR /app

# Copiamos package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código
COPY . .

# Compilamos la app para producción
RUN npm run build

# --- ETAPA 2: Servidor Web (Nginx) ---
FROM nginx:alpine

# Copiamos tu configuración de Nginx (el archivo que creamos arriba)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados desde la Etapa 1
# OJO: En Angular nuevo (v17+), la carpeta build está dentro de "/browser"
COPY --from=build /app/dist/front-tebusco/browser /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]
