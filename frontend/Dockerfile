# Etapa 1: Construir la aplicación Angular
FROM node:22 AS build
ARG NODE_ENV
ARG API_BASE_URL
ENV NODE_ENV "$NODE_ENV"
ENV API_BASE_URL "$API_BASE_URL"

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de la aplicación Angular al contenedor
COPY package.json ./

# Instalar las dependencias de la aplicación Angular
RUN npm install

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli

# Establecer la variable de entorno para solucionar el problema de OpenSSL
ENV NODE_OPTIONS=--openssl-legacy-provider

# Copiar el resto de los archivos de la aplicación Angular al contenedor
COPY . .

# Construir la aplicación Angular
# RUN npm run build --prod
RUN npm run build --prod

# Etapa 2: Servir la aplicación con un servidor web
FROM nginx:alpine

## Copy our default nginx config
COPY --from=build /app/dockeraux/nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos construidos de la aplicación Angular desde la etapa anterior
COPY --from=build /app/dist/etergea-front/* /usr/share/nginx/html/
COPY --from=build /app/src/assets /usr/share/nginx/html/assets/
COPY --from=build /app/dockeraux/scripts/replace_api_url.sh /

CMD ["sh", "/replace_api_url.sh"]

# Comando para ejecutar Nginx
# CMD ["nginx", "-g", "daemon off;"]