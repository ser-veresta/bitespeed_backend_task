FROM node:gallium-alpine3.16

WORKDIR /usr

COPY package.json ./

COPY tsconfig.json ./

COPY src ./src

RUN ls -a

RUN npm install

RUN npm build

## this is stage two , where the app actually runs

FROM node:gallium-alpine3.16

WORKDIR /usr

COPY package.json ./

RUN npm install

COPY --from=0 /usr/dist .

RUN npm install pm2 -g

EXPOSE 8080

CMD ["pm2-runtime","index.js"]