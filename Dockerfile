FROM node:5.7.0

MAINTAINER Caleb Sotelo <caleb.sotelo@openx.com>

ADD . /app

WORKDIR /app

RUN npm install
RUN npm install -g gulp

CMD ["gulp"]