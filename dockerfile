FROM ubuntu:16.04

WORKDIR /app

RUN echo "LC_ALL=en_US.UTF-8" >> /etc/environment
RUN echo "LANG=en_US.UTF-8" >> /etc/environment
RUN echo "NODE_ENV=development" >> /etc/environment
RUN more "/etc/environment"
#RUN locale-gen en_US en_US.UTF-8
#RUN dpkg-reconfigure locales

RUN apt-get update
#RUN apt-get upgrade -y
#RUN apt-get dist-upgrade -y
# RUN apt-get install curl htop git zip nano ncdu build-essential chrpath libssl-dev libxft-dev pkg-config glib2.0-dev libexpat1-dev gobject-introspection python-gi-dev apt-transport-https libgirepository1.0-dev libtiff5-dev libjpeg-turbo8-dev libgsf-1-dev fail2ban nginx -y
RUN apt-get install curl -y

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash
RUN apt-get install --yes nodejs
RUN node -v
RUN npm -v
RUN npm i -g nodemon
# RUN nodemon -v
# RUN npm install

# Cleanup
RUN apt-get update && apt-get upgrade -y && apt-get autoremove -y

COPY package*.json /app
RUN npm install
COPY . /app
CMD [ "npm", "start" ]
EXPOSE 54000
