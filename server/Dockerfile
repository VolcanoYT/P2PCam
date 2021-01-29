FROM node:current-alpine

WORKDIR /data
COPY package.json .
RUN echo ${PREFIX} && npm install
COPY data .
EXPOSE 3000
ENTRYPOINT ["npm","start"]