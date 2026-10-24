FROM node:24-bookworm-slim

# ffmpeg-base:0.3.0 is Ubuntu 18.04 (glibc 2.27) which cannot run Node 24
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg net-tools netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN mkdir -p /media/output

ENV DEBUG "*"
CMD [ "npm", "start" ]
