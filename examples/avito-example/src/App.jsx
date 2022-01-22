import {AviatoAudio} from 'aviato'
import {useRef,useEffect,useState} from 'react';


function App() {

  const audio = useRef(null);
  const audio6 = useRef(null);
  const [mp3,setmp3] = useState()

  const handlePlay = () => {
    audio.current.play();
  }

  const handlePause = () => {
    audio.current.pause();
  }

  const handleTrim = () => {
    audio.current.trim({start:'25%',end:'75%'})
  }

  const handleJoin = () => {
    audio.current.append(audio6.current);
  }

  const convertToMP3 = () => {
    setmp3(audio.current.convertToMP3())
  }

  useEffect(() => {
    if(audio.current == null && document.getElementById('three')){
      audio.current = new AviatoAudio(document.getElementById('three'));
    }
    if(audio6.current == null && document.getElementById('six')){
      audio6.current = new AviatoAudio(document.getElementById('six'));
    }
  })

  return (
    <div className="App">
        <h1>Hello world</h1>
        <audio id="three" src="3sec.mp3"></audio>
        <audio id="six" src="aud.mp3"></audio>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleTrim}>Trim</button>
        <button onClick={handleJoin}>Join</button>
        <button onClick={convertToMP3}>Convert to mp3</button>
        <audio src={mp3} controls></audio>
    </div>
  );
}

export default App;
