FROM node:5.5.0
MAINTAINER jkingyens@google.com
RUN apt-get -y update
RUN apt-get -y install openjdk-7-jre protobuf-compiler python-protobuf python2.7
WORKDIR /root
ADD package.json /root/
RUN npm install
ADD . /root
RUN python build.py
ENTRYPOINT [ "/usr/local/bin/node", "/root/dist/validate", "-" ]
