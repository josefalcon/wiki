FROM node:latest

COPY . /wiki

WORKDIR wiki
RUN npm install
