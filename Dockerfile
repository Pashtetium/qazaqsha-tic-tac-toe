FROM node:20-alpine 

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY server ./server
COPY shared ./shared
COPY public ./public

RUN mkdir -p data

EXPOSE 3000

CMD ["node", "server/index.js"]
