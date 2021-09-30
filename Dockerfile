FROM node:14-alpine

COPY . /app

WORKDIR /app

RUN rm -rf node_modules package-lock.json

RUN npm install

CMD ["node", "."]