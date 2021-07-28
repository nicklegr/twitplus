import React, { FormEvent, useState } from 'react';
import './App.css';

const App = () => {
  const [tweetUrl, setTweetUrl] = useState("")
  const [photoUrls, setPhotoUrls] = useState(new Array<string>());
  const [tweet, setTweet] = useState(null);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const tweetUrlRegex = /^https:\/\/twitter.com\/\w+?\/status(?!es)?\/(\d+)/
    const match = tweetUrl.match(tweetUrlRegex)
    if (!match) {
      return
    }
    const status_id = match[1]

    {
      fetch(`http://localhost:8080/api/v1/photos?status_id=${status_id}`)
        .then(x => x.json())
        .then(x => setPhotoUrls(x))
    }
    let res = await fetch(`http://localhost:8080/api/v1/tweet?status_id=${status_id}`)
    let body = await res.json()
    setTweet(body)
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        Tweet URL: <input className="tweet-url" type="text" onChange={(e) => setTweetUrl(e.target.value)} />
      </form>
      <hr />
      { photoUrls.map((x, i) => <Photo url={x} tweet={tweet} index={i + 1} />) }
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
