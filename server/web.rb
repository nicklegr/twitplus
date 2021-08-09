# coding: utf-8

require 'pp'
require 'json'
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/url_for'
require 'twitter'
require 'open-uri'
require 'dotenv'

Dotenv.load

set :public_folder, __dir__ + '/build'

$client = nil
$last_auth_time = nil

def twitter_client
  if !$last_auth_time || Time.now - $last_auth_time > 300
    $client = Twitter::REST::Client.new do |config|
      config.consumer_key = ENV["CONSUMER_KEY"]
      config.consumer_secret = ENV["CONSUMER_SECRET"]
      config.access_token = ENV["OAUTH_TOKEN"]
      config.access_token_secret = ENV["OAUTH_TOKEN_SECRET"]
    end
    $last_auth_time = Time.now
  end

  $client
end

def image_urls(status)
  # https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
  return [] unless status[:extended_entities]

  status = status[:retweeted_status] if status[:retweeted_status]

  urls = status[:extended_entities][:media].map do |media|
    if media[:type] != "photo" # photo, video, animated_gif
      nil
    else
      media[:media_url_https]
    end
  end

  urls.compact
end

get "/" do
  redirect "/index.html"
end

get "/api/v1/tweet" do
  status_id = params[:status_id].to_i

  begin
    content_type "application/json"
    twitter_client.status(status_id, tweet_mode: "extended").to_h.to_json
  rescue Twitter::Error::NotFound => e
    404
  end
end

get "/api/v1/photos" do
  status_id = params[:status_id].to_i

  begin
    status = twitter_client.status(status_id, tweet_mode: "extended").to_h
    content_type "application/json"
    image_urls(status).to_json
  rescue Twitter::Error::NotFound => e
    404
  end
end

get "/api/v1/download_image" do
  screen_name = params[:screen_name]
  status_id = params[:status_id].to_i
  index = params[:index].to_i
  url = params[:url]

  # TODO: 404をrescue
  orig_url = "#{url}?name=orig"
  image = open(orig_url).read

  content_type "image/jpeg"
  attachment "#{screen_name}_#{status_id}_#{index}_orig.jpg"
  image
end

get "/api/v1/rate_limit" do
  content_type "application/json"
  Twitter::REST::Request.new(twitter_client, :get, '/1.1/application/rate_limit_status.json').perform[:resources].to_json
end
