# coding: utf-8

require 'pp'
require 'json'
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/url_for'
require 'open-uri'

set :public_folder, __dir__ + '/build'

def get_tweet(status_id)
  uri = "#{ENV["API_BASE_URI"]}/2/tweets/#{status_id}"
  JSON.parse(URI.open(uri).read, symbolize_names: true)
end

def image_urls(status)
  # https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
  return [] if status[:error] || !status[:data][:extended_entities]

  urls = status[:data][:extended_entities][:media].map do |media|
    if media[:type] != "photo" # photo, video, animated_gif
      nil
    else
      media[:media_url_https]
    end
  end

  urls.compact
end

get "/" do
  send_file File.join(settings.public_folder, "index.html")
end

get "/api/v1/tweet" do
  status_id = params[:status_id].to_i

  begin
    content_type "application/json"
    get_tweet(status_id).to_json
  rescue OpenURI::HTTPError => e
    return [404, {error: "API request failed: #{e.message}"}.to_json]
  end
end

get "/api/v1/photos" do
  status_id = params[:status_id].to_i

  begin
    status = get_tweet(status_id)
    content_type "application/json"
    image_urls(status).to_json
  rescue OpenURI::HTTPError => e
    return [404, {error: "API request failed: #{e.message}"}.to_json]
  end
end

get "/api/v1/download_image" do
  status_id = params[:status_id].to_i
  index = params[:index].to_i

  status = get_tweet(status_id)
  image_url = image_urls(status)[index]
  screen_name = status[:includes][:user][:screen_name]

  # TODO: 404をrescue
  orig_url = "#{image_url}?name=orig"
  image = open(orig_url).read

  content_type "image/jpeg"
  attachment "#{screen_name}-#{status_id}-#{index + 1}-orig.jpg"
  image
end
