# Imagem base oficial leve Node.js
FROM node:20-alpine

# Cria diretório da aplicação
WORKDIR /usr/src/app

# Copia arquivos de definição de dependências
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

# Copia o código fonte do projeto
COPY . .

# Expõe a porta que a aplicação vai rodar (padrão 8000)
EXPOSE 8000

# Variável de ambiente de produção
ENV NODE_ENV=production
ENV PORT=8000

# Executa o servidor Node
CMD [ "npm", "start" ]
