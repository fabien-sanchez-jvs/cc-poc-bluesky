FROM node:lts-alpine

WORKDIR /api

COPY ./package.json .
RUN echo "nodeLinker: node-modules">.yarnrc.yaml
RUN yarn

COPY ./libs ./libs
COPY ./src ./src
COPY ./tsconfig.build.json .
COPY ./tsconfig.json .
COPY ./nest-cli.json .

EXPOSE 3000

CMD ["yarn", "start:dev"]
