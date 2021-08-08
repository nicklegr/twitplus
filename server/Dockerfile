FROM ruby:2.6.3

RUN echo "Asia/Tokyo" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# スクリプトに変更があっても、bundle installをキャッシュさせる
COPY Gemfile /usr/src/app/
COPY Gemfile.lock /usr/src/app/
RUN bundle install --deployment --without=test --jobs 4

COPY . /usr/src/app

EXPOSE 80
