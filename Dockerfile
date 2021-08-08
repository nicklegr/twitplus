# build frontend
FROM node:14.17.3-alpine as frontend-build

WORKDIR /frontend

# スクリプトに変更があっても、bundle installをキャッシュさせる
COPY ["frontend/package.json", "frontend/yarn.lock", "/frontend/"]
RUN yarn install

COPY frontend /frontend/

RUN yarn build

# build server
FROM ruby:2.6.3 as server-build

RUN echo "Asia/Tokyo" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

WORKDIR /server

# スクリプトに変更があっても、bundle installをキャッシュさせる
COPY server/Gemfile /server/
COPY server/Gemfile.lock /server/
RUN bundle install --deployment --without=test --jobs 4

COPY server /server

# merge
FROM gcr.io/distroless/base-debian10

WORKDIR /app

COPY --from=frontend-build --chown=nobody:nobody /frontend/build /app/
COPY --from=server-build --chown=nobody:nobody /server/* /app/

EXPOSE 80
