FROM node:lts-alpine

WORKDIR /app

COPY ./package.json .
RUN yarn

COPY ./public ./public
COPY ./src ./src
COPY ./index.html .
COPY ./tsconfig.app.json .
COPY ./tsconfig.node.json .
COPY ./tsconfig.json .
COPY ./vite.config.ts .

EXPOSE 5173

CMD ["yarn", "dev", "--host"]
