FROM node:10-alpine
LABEL maintainer="KlexHub UG (haftungsbeschränkt) <support@support-pp.de>"
WORKDIR /app
COPY . /app
RUN npm install
RUN npm install -g typescript
RUN npm install request
RUN tsc
EXPOSE 8080
CMD [ "node", "./build/index.js" ]