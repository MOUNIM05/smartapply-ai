FROM node:20-alpine

# Dossier de travail dans le conteneur.
WORKDIR /app

# Copie uniquement les fichiers npm pour profiter du cache Docker.
COPY package*.json ./

# Installe les dependances du frontend.
RUN npm install

# Copie le code React/Vite dans le conteneur.
COPY . .

# Port utilise par Vite en developpement.
EXPOSE 5173

# --host 0.0.0.0 permet d'acceder au frontend depuis la machine hote.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
