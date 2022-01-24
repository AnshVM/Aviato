import {useRef,useEffect} from 'react'
import {AviatoAudio} from 'aviatojs'

function App() {

  const audio1Element = useRef<HTMLAudioElement>(null);
  const audio2Element = useRef<HTMLAudioElement>(null);
  let audio1:AviatoAudio,audio2:AviatoAudio;

  const handlePlayAudio1 = () => {
    audio1.play();
  }

  const handlePauseAudio1 = () => {
    audio1.pause();
  }

  const handlePlayAudio2 = () => {
    audio2.play();
  }

  const handlePauseAudio2 = () => {
    audio2.pause();
  }

  const handleAppend = () => {
    audio1.append(audio2);
    //you might wanna convert back to mp3 after performing trim/append operations.
    //you can do that like this
    audio1.convertToMP3()
    .then((url:String)=>console.log(url))
    //returns a url which contains the audio file in mp3 format
    //this url can then be set as the src attribute of another audio element
  }

  const handleTrim = ()=>{
    audio2.trim({start:"20s",end:"25s"}) //cuts first 20% and the last 25% of the audio file
  }

  const handleCut = () => {
    audio2.cut({start:'5s',end:'10s'});
  }

  useEffect(()=>{
    if(audio1Element.current && audio1==null) {
      audio1 = new AviatoAudio(audio1Element.current);
    }
    if(audio2Element.current && audio2==null){
      audio2 = new AviatoAudio(audio2Element.current);
    }
  })

  return (
    <div className="App">
      <audio ref={audio1Element} id="audio1" src="3sec.mp3"></audio>
      <audio ref={audio2Element} id="audio2" src="sw.mp3"></audio>
      <button onClick={handlePlayAudio1}>Play Audio1</button>
      <button onClick={handlePauseAudio2}>Pause Audio1</button>
      <button onClick={handleAppend}>Append Audio2 to Audio1</button>
      <button onClick={handleTrim}>Trim Audio2</button>
      <button onClick={handlePlayAudio2}>Play audio2</button>
      <button onClick={handlePauseAudio2}>Pause audio2</button>
      <button onClick={handleCut}>Cut Audio2</button>
    </div>
  );
}

export default App;
