FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência e instala
COPY package*.json ./
RUN npm ci

# Copia todo o código
COPY . .

# Expõe a porta da aplicação
EXPOSE 7007

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
