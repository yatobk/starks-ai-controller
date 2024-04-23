FROM node:20

WORKDIR /

COPY package.json .

RUN npm install

RUN npm run build

COPY . .

EXPOSE 7000

ENV ADDRESS=0.0.0.0 PORT=7000

CMD ["npm", "start"]