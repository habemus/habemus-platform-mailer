FROM node:6.9.4
MAINTAINER Simon Fan <sf@habem.us>

COPY . /application

ENTRYPOINT ["node", "/application/cli/start.js"]
