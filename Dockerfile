# Usando a imagem do Node.js
FROM node:21-alpine

# Definindo o diretório de trabalho no contêiner
WORKDIR /app

# Copiando os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalando as dependências
RUN npm install

# Copiando o restante dos arquivos da aplicação
COPY . .

# Gerando o Prisma Client
RUN npx prisma generate

# Expondo a porta da aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:dev"]
