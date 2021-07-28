import React, { FormEvent, useEffect, useState } from 'react';
import './App.css';

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
  };

  return (
    <div className="App">
      <form>
        Tweet URL: <textarea className="tweet-url" onChange={(e) => onTweetUrlsChange(e.target.value)} />
      </form>
      <hr />
      { statusIds.map(x => <Tweet status_id={x} />) }
    </div>
  )
}

const Tweet = ({status_id}: {status_id: string}) => {
  const [photoUrls, setPhotoUrls] = useState(new Array<string>());
  const [tweet, setTweet] = useState<any>(null);

  useEffect(() => {
    const f = async () => {
      let res = await fetch(`http://localhost:8080/api/v1/photos?status_id=${status_id}`)
      let body = await res.json()
      setPhotoUrls(body)

      res = await fetch(`http://localhost:8080/api/v1/tweet?status_id=${status_id}`)
      body = await res.json()
      setTweet(body)
    }
    f()
  }, [status_id])

  return (
    <div className="tweet">
      <div className="tweet-desc">
        <img src={tweet?.user?.profile_image_url_https} alt="" />
        <a href={`https://twitter.com/${tweet?.user?.screen_name}`}>@{tweet?.user?.screen_name}</a>
        <br />
        <span>{tweet?.full_text}</span>
      </div>
      <div className="tweet-thumbs">
        { photoUrls.map((x, i) => <Photo url={x} tweet={tweet} index={i + 1} />) }
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
      <a href={`http://localhost:8080/api/v1/download_image?screen_name=${tweet.user.screen_name}&status_id=${tweet.id_str}&index=${index}&url=${url}`}>
        <img alt="" src={`${url}?name=thumb`} />
      </a>
    </div>
  )
}

export default App;
