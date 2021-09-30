FROM node:12.18.0

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN npm install -g nodemon
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .
RUN npm install yarn
RUN yarn install

RUN chmod +x docker-entrypoint.sh  
ENTRYPOINT ./docker-entrypoint.sh

RUN tar -xvf ./T.tar -C ./public/images

EXPOSE 8080
