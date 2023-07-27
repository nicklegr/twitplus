import React, { useEffect, useState } from 'react';
import './App.css';

class API {
  static async photos(status_id: string) {
    return fetch(`${this.url_prefix}/api/v1/photos?status_id=${status_id}`)
  }
  static async tweet(status_id: string) {
    return fetch(`${this.url_prefix}/api/v1/tweet?status_id=${status_id}`)
  }
  static download_image_url(status_id: string, index: number) {
    return `${this.url_prefix}/api/v1/download_image?status_id=${status_id}&index=${index}`;
  }
  static download_video_url(status_id: string, index: number) {
    return `${this.url_prefix}/api/v1/download_video?status_id=${status_id}&index=${index}`;
  }

  private static url_prefix = process.env.NODE_ENV === "production" ? "" : "http://localhost:8080"
}

class Media {
  type = "";
  thumb = "";
  url = "";
}

const App = () => {
  const [statusIds, setStatusIds] = useState<string[]>([])
  const onTweetUrlsChange = (text: string) => {
    const tweetUrlRegex = /^https:\/\/twitter.com\/\w+?\/status(?!es)?\/(\d+)/
    let ids: string[] = []
    for (const line of text.split("\n")) {
      const match = line.match(tweetUrlRegex)
      if (!match) {
        continue
      }
      ids.push(match[1])
    }
    setStatusIds(ids)
  }

  useEffect(() => {
    document.title = "Twitplus"
    if (window.location.search !== "") {
      const m = window.location.search.match(/\?uri=https:\/\/twitter.com\/\w+?\/status(?!es)?\/(\d+)/)
      if (m) {
        const statusId = m[1]
        setStatusIds([statusId])
      }
    }
  }, [])

  return (
    <div className="App">
      <form>
        Tweet URL: <textarea className="tweet-url" onChange={(e) => onTweetUrlsChange(e.target.value)} />
      </form>
      { statusIds.map(x => <Tweet key={x} status_id={x} />) }
    </div>
  )
}

const Tweet = ({status_id}: {status_id: string}) => {
  const [isNotFound, setIsNotFound] = useState(false)
  const [medias, setMedias] = useState(new Array<Media>())
  const [tweet, setTweet] = useState<any>(null)

  useEffect(() => {
    const f = async () => {
      let res = await API.photos(status_id)
      if (!res.ok) {
        setIsNotFound(true)
        return
      }
      let body = await res.json()
      let medias = new Array<Media>();
      Object.assign(medias, body);
      setMedias(medias)

      res = await API.tweet(status_id)
      if (!res.ok) {
        setIsNotFound(true)
        return
      }
      body = await res.json()
      setTweet(body)
    }
    f()
  }, [status_id])

  if (isNotFound) {
    return (
      <div className="tweet">
        <hr />
        ツイートは削除されています: {status_id}
      </div>
    )
  }

  if (tweet?.error) {
    return (
      <div className="tweet">
        <hr />
        {tweet.error.text}: <a href={`https://twitter.com/dummy/status/${status_id}`}>{status_id}</a>
      </div>
    )
  }

  return (
    <div className="tweet">
      <hr />
      <div className="tweet-desc">
        <img src={tweet?.includes?.user?.profile_image_url_https} alt="" />
        <a href={`https://twitter.com/${tweet?.includes?.user?.screen_name}`}>@{tweet?.includes?.user?.screen_name}</a>
        <span>　</span>
        <a href={`https://twitter.com/dummy/status/${status_id}`}>{status_id}</a>
        <br />
        <span>{tweet?.data?.text}</span>
      </div>
      <div className="tweet-thumbs">
        { medias.map((x, i) => <Photo key={`${status_id}-${i}`} media={x} tweet={tweet} index={i} />) }
      </div>
    </div>
  )
}

const Photo = ({media, tweet, index}: {media: Media, tweet: any, index: number}) => {
  if (!tweet) {
    return <></>;
  }

  switch (media.type) {
    case "photo":
      return (
        <div className="photo">
          <a href={API.download_image_url(tweet.data.id, index)}>
            <img alt="" src={`${media.thumb}`} />
          </a>
        </div>
      )
    case "video":
      return (
        <div className="photo">
          <a href={API.download_video_url(tweet.data.id, index)}>
            <img alt="" src={`${media.thumb}`} />
          </a>
        </div>
      )
    default:
      return (<div />);
  }
}

export default App;
