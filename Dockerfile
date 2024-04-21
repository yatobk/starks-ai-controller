FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm run build

COPY . .

EXPOSE 6000

ENV ADDRESS=0.0.0.0 PORT=6000

CMD ["node", "dist/index.js"]