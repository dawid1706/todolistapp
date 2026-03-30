FROM node:18-slim

# Ustaw katalog roboczy
WORKDIR /usr/src/app

# Kopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Kopiuj resztę plików aplikacji
COPY . .

# Eksponuj port 3001
EXPOSE 3001

# Uruchom aplikację
CMD [ "node", "index.js" ]