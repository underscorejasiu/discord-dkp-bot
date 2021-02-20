FROM node:12

WORKDIR /app

COPY package.json package-lock.json ./

ENV TZ=Europe/Warsaw
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install

COPY . ./

RUN npm run build

RUN rm -rf node_modules src *.ts tsconfig*

RUN ls

RUN npm install --production

CMD [ "npm", "run", "serve-prod" ]
