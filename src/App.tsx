import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

const App = () => {
  const [tweetUrl, setTweetUrl] = useState("")

  return (
    <div className="App">
      Tweet URL: <input className="tweet-url" type="text" onChange={(e) => setTweetUrl(e.target.value)}></input>
      <hr />
      <a href={tweetUrl}>{tweetUrl}</a>
    </div>
  )
}

export default App;
