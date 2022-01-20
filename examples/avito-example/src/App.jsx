import {AviatoAudio} from 'aviato'
import {useRef,useEffect,useState} from 'react';


function App() {

  const audio = useRef(null);

  const handlePlay = () => {
    audio.current.play();
  }

  const handlePause = () => {
    audio.current.pause();
  }

  const handleTrim = () => {
    audio.current.trim({start:'25%',end:'75%'})
  }

  useEffect(() => {
    if(audio.current == null && document.querySelector('audio')){
      audio.current = new AviatoAudio(document.querySelector('audio'))
    }
  })

  return (
    <div className="App">
        <h1>Hello world</h1>
        <audio src="aud.mp3"></audio>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleTrim}>Trim</button>
    </div>
  );
}

export default App;
