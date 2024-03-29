# build frontend
FROM node:14.17.3-alpine as frontend-build

WORKDIR /frontend

# スクリプトに変更があっても、bundle installをキャッシュさせる
COPY ["frontend/package.json", "frontend/yarn.lock", "/frontend/"]
RUN yarn install

COPY frontend /frontend/

RUN yarn build

# build server
FROM ruby:2.6.3

RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

WORKDIR /app

# スクリプトに変更があっても、bundle installをキャッシュさせる
COPY server/Gemfile /app/
COPY server/Gemfile.lock /app/
RUN bundle install --deployment --without=test --jobs 4

COPY server /app/

# merge frontend
COPY --from=frontend-build --chown=root:root /frontend/build /app/build/

# 長期に実行している ENTRYPOINT の実行バイナリに対し、 docker stop で適切にシグナルを送るには、 exec で起動する必要がある
ENTRYPOINT exec bundle exec rackup -o 0.0.0.0 -p $PORT
