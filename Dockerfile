FROM node:18-alpine

WORKDIR /usr

COPY package.json ./
COPY tsconfig.json ./
COPY ecosystem.config.js ./
COPY .env ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npm run build


FROM node:18-alpine

WORKDIR /usr
COPY package.json ./
COPY ecosystem.config.js ./
COPY .env ./
RUN npm install --only=production
COPY --from=0 /usr/build .
COPY --from=0 /usr/src/templates ./src
RUN npm install pm2 -g
EXPOSE 3000 

CMD ["pm2-runtime", "ecosystem.config.js","src/server.js", "--env", "production"]
