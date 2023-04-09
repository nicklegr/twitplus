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

  private static url_prefix = process.env.NODE_ENV === "production" ? "" : "http://localhost:8080"
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
    if (window.location.search != "") {
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
  const [photoUrls, setPhotoUrls] = useState(new Array<string>())
  const [tweet, setTweet] = useState<any>(null)

  useEffect(() => {
    const f = async () => {
      let res = await API.photos(status_id)
      if (!res.ok) {
        setIsNotFound(true)
        return
      }
      let body = await res.json()
      setPhotoUrls(body)

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
        { photoUrls.map((x, i) => <Photo key={`${status_id}-${i}`} url={x} tweet={tweet} index={i} />) }
      </div>
    </div>
  )
}

const Photo = ({url, tweet, index}: {url: string, tweet: any, index: number}) => {
  if (!tweet) {
    return <></>;
  }

  return (
    <div className="photo">
      <a href={API.download_image_url(tweet.data.id, index)}>
        <img alt="" src={`${url}?name=thumb`} />
      </a>
    </div>
  )
}

export default App;
