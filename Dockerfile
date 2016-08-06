FROM node:latest

RUN mkdir wiki
WORKDIR wiki

COPY package.json package.json
RUN npm install

COPY . .
ENTRYPOINT ["./env.sh"]
