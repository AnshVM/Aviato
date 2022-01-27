const lamejs = require('lamejs')

export class AviatoAudio {
    private audioElement: HTMLAudioElement;
    private audioContext: AudioContext;
    private audioNode: AudioBufferSourceNode;
    private audioBuffer: AudioBuffer;
    duration:number;
    private durationInterval:NodeJS.Timer;

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
            })
        console.log('ready')
    }

    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        try{
            this.audioNode.start(0,this.duration);
        }catch(e){
            if(e.code===11){ //AudioBufferSourceNode can only be played once so a new one needs to be create in this case
                const newArrayBuffer = this.audioContext.createBuffer(this.audioBuffer.numberOfChannels,this.audioBuffer.length,this.audioBuffer.sampleRate);
                for(let i=0;i<this.audioBuffer.numberOfChannels;i++){
                    const nowBuffering = newArrayBuffer.getChannelData(i);
                    this.audioBuffer.copyFromChannel(nowBuffering,i,0);
                }
                const newAudioNode = this.audioContext.createBufferSource();
                newAudioNode.buffer = newArrayBuffer;
                this.audioNode.disconnect();
                this.audioNode = newAudioNode;
                this.audioNode.connect(this.audioContext.destination);
                this.audioNode.start(0,this.duration);

            }
        }finally{
            this.audioNode.onended = ()=>{
                if(this.duration===Math.floor(this.audioBuffer.duration)){
                    if(this.durationInterval) clearInterval(this.durationInterval);
                    this.duration = 0;
                }
            }
            this.durationInterval = setInterval(()=>{
                this.duration+=0.1;
            },100)
        }

    }

    pause() {
        this.audioNode.stop();
        clearInterval(this.durationInterval)
    }
    
    trim(trimValues:{start:String|number,end:String|number}) {

        let startIndex=0,endIndex=0;
        if(typeof(trimValues.start)==='string' && typeof(trimValues.end)==='string') {
            const start = parseInt(trimValues.start.substring(0, trimValues.start.length - 1));
            const end = parseInt(trimValues.end.substring(0, trimValues.end.length - 1));
    
            if(trimValues.start[trimValues.start.length-1]==='s' && trimValues.end[trimValues.end.length-1]==='s'){
                startIndex = Math.floor((start/this.audioBuffer.duration) * this.audioBuffer.length-1);
                endIndex = Math.floor((end/this.audioBuffer.duration) * this.audioBuffer.length-1);
            }
    
            else if(trimValues.start[trimValues.start.length-1]==='%' && trimValues.end[trimValues.end.length-1]==='%') {
                startIndex = Math.floor((start) / 100 * this.audioBuffer.length);
                endIndex = Math.floor((end) / 100 * this.audioBuffer.length);
            }
       
        }

        else {
            const {start,end} = trimValues;
            if(typeof(start)==='number' && typeof(end)==='number'){
                startIndex = Math.floor((start) / 100 * this.audioBuffer.length);
                endIndex = Math.floor((end) / 100 * this.audioBuffer.length);
            }
        }

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
        console.log(this.audioBuffer)
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
    }

    convertToMP3():Promise<String>{
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
        const mp3buf = mp3encoder.flush();
        if(mp3buf.length>0){
            mp3data.push(mp3buf);
        }
        const blob = new Blob(mp3data,{type:'audio/mp3'});
        const url = window.URL.createObjectURL(blob);
        return Promise.resolve(url)
    }

    cut(cutValues:{start:String|number,end:String|number}) {
        let startIndex=0,endIndex=0;
        if(typeof(cutValues.start)==='string' && typeof(cutValues.end)==='string') {
            const start = parseInt(cutValues.start.substring(0, cutValues.start.length - 1));
            const end = parseInt(cutValues.end.substring(0, cutValues.end.length - 1));
    
            if(cutValues.start[cutValues.start.length-1]==='s' && cutValues.end[cutValues.end.length-1]==='s'){
                startIndex = Math.floor((start/this.audioBuffer.duration) * this.audioBuffer.length-1);
                endIndex = Math.floor((end/this.audioBuffer.duration) * this.audioBuffer.length-1);
            }
    
            else if(cutValues.start[cutValues.start.length-1]==='%' && cutValues.end[cutValues.end.length-1]==='%') {
                startIndex = Math.floor((start) / 100 * this.audioBuffer.length);
                endIndex = Math.floor((end) / 100 * this.audioBuffer.length);
            }
       
        }

        else {
            const {start,end} = cutValues;
            if(typeof(start)==='number' && typeof(end)==='number'){
                startIndex = Math.floor((start) / 100 * this.audioBuffer.length);
                endIndex = Math.floor((end) / 100 * this.audioBuffer.length);
            }
        }

        const channels = this.audioBuffer.numberOfChannels;
        const length = this.audioBuffer.length-(endIndex-startIndex+1);
        const sampleRate = this.audioBuffer.sampleRate;
        const newArrayBuffer = this.audioContext.createBuffer(channels,length,sampleRate);
        for(let i=0;i<channels;i++) {
            const newBufferChanneData = newArrayBuffer.getChannelData(i);
            const thisBufferChannelData = this.audioBuffer.getChannelData(i);
            let k=0;
            for(let j=0;j<thisBufferChannelData.length;j++){
                newBufferChanneData[k] = thisBufferChannelData[j];
                if(j==startIndex-1) j=endIndex;
                k++;
            }
        }
        this.audioBuffer = newArrayBuffer;
        this.audioNode.disconnect();
        const newAudioNode = this.audioContext.createBufferSource();
        newAudioNode.buffer = newArrayBuffer;
        newAudioNode.connect(this.audioContext.destination);
        this.audioNode = newAudioNode;
        console.log(newArrayBuffer);

    }

}
