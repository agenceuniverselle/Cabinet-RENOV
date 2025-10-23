# -------------------------------
# 🧱 FRONTEND BUILDER - Cabinet RENOV
# -------------------------------

# Étape 1 : Build de l'application React
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur statique (dist)
FROM nginx:alpine

# Copie du build dans le répertoire de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
