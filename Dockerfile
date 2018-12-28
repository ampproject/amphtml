FROM node:12

MAINTAINER Format team <innov-format@teads.tv>

RUN yarn global add gulp-cli

ADD . /var/www
WORKDIR /var/www

RUN yarn

RUN gulp build

EXPOSE 8000

CMD gulp serve --host=0.0.0.0
