# Étape 1 : Build de l'app front
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]