interface trimValues {
    start: String,
    end: String
}


class AviatoAudio {
    audioElement: HTMLAudioElement;
    audioContext: AudioContext;
    audioNode: AudioBufferSourceNode;
    audioBuffer: AudioBuffer;
    duration:number;
    durationInterval:NodeJS.Timer;

    constructor(audioElement: HTMLAudioElement) {
        this.duration=0;
        this.audioElement = audioElement;
        this.audioContext = new AudioContext();
        //get audio buffer data from audio element
        fetch(this.audioElement.src)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffer = audioBuffer;
                this.audioNode = this.audioContext.createBufferSource();
                this.audioNode.buffer = this.audioBuffer;
                this.audioNode.connect(this.audioContext.destination);
                console.log("Audio now ready to play")
            })
    }

    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        console.log(this.audioNode)
        try{
            console.log(this.duration);
            this.audioNode.start(0,this.duration);
        }catch(e){
            if(e.code===11){ //AudioBufferSourceNode can only be played once so a new one needs to be create in this case
                const newArrayBuffer = this.audioContext.createBuffer(this.audioBuffer.numberOfChannels,this.audioBuffer.length,this.audioBuffer.sampleRate);
                for(let i=0;i<this.audioBuffer.numberOfChannels;i++){
                    const nowBuffering = newArrayBuffer.getChannelData(i);
                    this.audioBuffer.copyFromChannel(nowBuffering,i,0);
                }
                console.log(newArrayBuffer);
                const newAudioNode = this.audioContext.createBufferSource();
                newAudioNode.buffer = newArrayBuffer;
                this.audioNode.disconnect();
                this.audioNode = newAudioNode;
                this.audioNode.connect(this.audioContext.destination);
                this.audioNode.start(0,this.duration);
            }
        }finally{
            this.durationInterval = setInterval(()=>{
                this.duration++;
            },1000)
        }

    }

    pause() {
        this.audioNode.stop();
        clearInterval(this.durationInterval)
        console.log(this.duration)
    }

    trim(trimValues: trimValues) {
        const start = trimValues.start.substring(0, trimValues.start.length - 1);
        const end = trimValues.end.substring(0, trimValues.end.length - 1);
        const startIndex = Math.floor(parseInt(start) / 100 * this.audioBuffer.length);
        const endIndex = Math.floor(parseInt(end) / 100 * this.audioBuffer.length);
        const numChannels = this.audioBuffer.numberOfChannels;
        const length = endIndex - startIndex + 1;
        const sampleRate = this.audioBuffer.sampleRate
        const newArrayBuffer = this.audioContext.createBuffer(numChannels, length, sampleRate);
        for (let i = 0; i < numChannels; i++) {
            let newBufferChannelData = newArrayBuffer.getChannelData(i);
            let ogBufferChannelData = this.audioBuffer.getChannelData(i);
            let k = 0;
            for (let j = startIndex; j <= endIndex; j++) {
                newBufferChannelData[k] = ogBufferChannelData[j];
                k++;
            }
        }
        this.audioBuffer = newArrayBuffer;
        this.audioNode.disconnect();
        const newAudioNode = this.audioContext.createBufferSource();
        newAudioNode.buffer = newArrayBuffer;
        newAudioNode.connect(this.audioContext.destination);
        this.audioNode = newAudioNode;
    }
}

export default AviatoAudio;