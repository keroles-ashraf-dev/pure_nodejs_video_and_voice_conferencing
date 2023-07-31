FROM node:16

WORKDIR /app

COPY package.json .

RUN npm cache verify

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "up" ]
