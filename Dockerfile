FROM node:5.0.0
MAINTAINER Simon Fan <sf@habem.us>

COPY . /application

ENTRYPOINT ["node", "/application/cli/start.js"]
