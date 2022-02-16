FROM eyevinntechnology/ffmpeg-base:0.3.0

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install -y net-tools netcat

ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN mkdir /media/output

ENV DEBUG "*"
CMD [ "npm", "start" ]
