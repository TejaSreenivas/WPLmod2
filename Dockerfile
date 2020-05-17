FROM node:13-slim
WORKDIR /srv/app/server-mod
COPY package.json /srv/app/server-mod
RUN npm install 

COPY . /srv/app/server-mod
CMD ["npm", "start"]