const lamejs = require('lamejs')


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
        console.log('made a change')
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
                console.log(audioBuffer)
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

    append(audio:AviatoAudio){
        const length = this.audioBuffer.length + audio.audioBuffer.length;
        const numOfChannels = Math.min(this.audioBuffer.numberOfChannels,audio.audioBuffer.numberOfChannels);
        const newArrayBuffer = this.audioContext.createBuffer(numOfChannels,length,this.audioBuffer.sampleRate);

        for(let i=0;i<numOfChannels;i++) {
            let newBufferChannelData = newArrayBuffer.getChannelData(i);
            let thisAudioChannelData = this.audioBuffer.getChannelData(i);
            let secondAudioChannelData = audio.audioBuffer.getChannelData(i);
            let j=0;
            for(j=0;j<this.audioBuffer.length;j++){
                newBufferChannelData[j] = thisAudioChannelData[j];
            }
            for(let k=0;k<audio.audioBuffer.length;k++) {
                newBufferChannelData[j] = secondAudioChannelData[k];
                j++;
            }
        }
        this.audioBuffer = newArrayBuffer;
        this.audioNode.disconnect();
        const newAudioNode = this.audioContext.createBufferSource();
        newAudioNode.buffer = newArrayBuffer;
        newAudioNode.connect(this.audioContext.destination);
        this.audioNode = newAudioNode;
        console.log("joined")
    }

    convertToMP3():String{
        const a = new Date();
        const mp3encoder = new lamejs.Mp3Encoder(2,this.audioBuffer.sampleRate,128);
        let mp3data = [];
        const floatLeft = this.audioBuffer.getChannelData(0);
        const floatRight = this.audioBuffer.getChannelData(1);
        let left = new Int32Array(floatLeft.length);
        let right = new Int32Array(floatRight.length);
        for(let i=0;i<floatLeft.length;i++) {
            left[i] = floatLeft[i] < 0 ? floatLeft[i] * 32768 : floatLeft[i] * 32767;
            right[i] = floatRight[i] < 0 ? floatRight[i] * 32768 : floatRight[i] * 32767;
        }
        const sampleBlockSize = 576;
        for(let i=0;i<left.length;i+=sampleBlockSize){
            const leftChunk = left.subarray(i,i+sampleBlockSize);
            const rightChunk = right.subarray(i,i+sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk,rightChunk);
            if(mp3buf.length > 0) {
                mp3data.push(mp3buf);
            }
        }
        console.log(`Encoding took ${((new Date()).getTime() - a.getTime())/1000} seconds`)
        const mp3buf = mp3encoder.flush();
        if(mp3buf.length>0){
            mp3data.push(mp3buf);
        }
        const blob = new Blob(mp3data,{type:'audio/mp3'});
        const url = window.URL.createObjectURL(blob);
        console.log("converted")
        return url
    }

}

export default AviatoAudio;