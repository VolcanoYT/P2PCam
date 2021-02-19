FROM node:current-alpine

# Install Time ~
RUN apk add --no-cache ffmpeg

WORKDIR /data
COPY package.json .
RUN echo ${PREFIX} && npm install --nodedir=${PREFIX}
COPY data .
EXPOSE 3000
ENTRYPOINT ["npm","start"]