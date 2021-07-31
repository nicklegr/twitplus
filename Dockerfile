FROM node:14.17.3-alpine

WORKDIR /usr/src/app

# スクリプトに変更があっても、yarn installをキャッシュさせる
COPY ["package.json", "yarn.lock", "/usr/src/app/"]
RUN yarn install

COPY . /usr/src/app

RUN yarn build
