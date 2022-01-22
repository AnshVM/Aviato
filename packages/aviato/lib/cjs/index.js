'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lamejs = require('lamejs');
var AviatoAudio = /** @class */ (function () {
    function AviatoAudio(audioElement) {
        var _this = this;
        console.log('made a change');
        this.duration = 0;
        this.audioElement = audioElement;
        this.audioContext = new AudioContext();
        //get audio buffer data from audio element
        fetch(this.audioElement.src)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (arrayBuffer) { return _this.audioContext.decodeAudioData(arrayBuffer); })
            .then(function (audioBuffer) {
            _this.audioBuffer = audioBuffer;
            _this.audioNode = _this.audioContext.createBufferSource();
            _this.audioNode.buffer = _this.audioBuffer;
            _this.audioNode.connect(_this.audioContext.destination);
            console.log(audioBuffer);
            console.log("Audio now ready to play");
        });
    }
    AviatoAudio.prototype.play = function () {
        var _this = this;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        console.log(this.audioNode);
        try {
            console.log(this.duration);
            this.audioNode.start(0, this.duration);
        }
        catch (e) {
            if (e.code === 11) { //AudioBufferSourceNode can only be played once so a new one needs to be create in this case
                var newArrayBuffer = this.audioContext.createBuffer(this.audioBuffer.numberOfChannels, this.audioBuffer.length, this.audioBuffer.sampleRate);
                for (var i = 0; i < this.audioBuffer.numberOfChannels; i++) {
                    var nowBuffering = newArrayBuffer.getChannelData(i);
                    this.audioBuffer.copyFromChannel(nowBuffering, i, 0);
                }
                console.log(newArrayBuffer);
                var newAudioNode = this.audioContext.createBufferSource();
                newAudioNode.buffer = newArrayBuffer;
                this.audioNode.disconnect();
                this.audioNode = newAudioNode;
                this.audioNode.connect(this.audioContext.destination);
                this.audioNode.start(0, this.duration);
            }
        }
        finally {
            this.durationInterval = setInterval(function () {
                _this.duration++;
            }, 1000);
        }
    };
    AviatoAudio.prototype.pause = function () {
        this.audioNode.stop();
        clearInterval(this.durationInterval);
        console.log(this.duration);
    };
    AviatoAudio.prototype.trim = function (trimValues) {
        var start = trimValues.start.substring(0, trimValues.start.length - 1);
        var end = trimValues.end.substring(0, trimValues.end.length - 1);
        var startIndex = Math.floor(parseInt(start) / 100 * this.audioBuffer.length);
        var endIndex = Math.floor(parseInt(end) / 100 * this.audioBuffer.length);
        var numChannels = this.audioBuffer.numberOfChannels;
        var length = endIndex - startIndex + 1;
        var sampleRate = this.audioBuffer.sampleRate;
        var newArrayBuffer = this.audioContext.createBuffer(numChannels, length, sampleRate);
        for (var i = 0; i < numChannels; i++) {
            var newBufferChannelData = newArrayBuffer.getChannelData(i);
            var ogBufferChannelData = this.audioBuffer.getChannelData(i);
            var k = 0;
            for (var j = startIndex; j <= endIndex; j++) {
                newBufferChannelData[k] = ogBufferChannelData[j];
                k++;
            }
        }
        this.audioBuffer = newArrayBuffer;
        this.audioNode.disconnect();
        var newAudioNode = this.audioContext.createBufferSource();
        newAudioNode.buffer = newArrayBuffer;
        newAudioNode.connect(this.audioContext.destination);
        this.audioNode = newAudioNode;
    };
    AviatoAudio.prototype.append = function (audio) {
        var length = this.audioBuffer.length + audio.audioBuffer.length;
        var numOfChannels = Math.min(this.audioBuffer.numberOfChannels, audio.audioBuffer.numberOfChannels);
        var newArrayBuffer = this.audioContext.createBuffer(numOfChannels, length, this.audioBuffer.sampleRate);
        for (var i = 0; i < numOfChannels; i++) {
            var newBufferChannelData = newArrayBuffer.getChannelData(i);
            var thisAudioChannelData = this.audioBuffer.getChannelData(i);
            var secondAudioChannelData = audio.audioBuffer.getChannelData(i);
            var j = 0;
            for (j = 0; j < this.audioBuffer.length; j++) {
                newBufferChannelData[j] = thisAudioChannelData[j];
            }
            for (var k = 0; k < audio.audioBuffer.length; k++) {
                newBufferChannelData[j] = secondAudioChannelData[k];
                j++;
            }
        }
        this.audioBuffer = newArrayBuffer;
        this.audioNode.disconnect();
        var newAudioNode = this.audioContext.createBufferSource();
        newAudioNode.buffer = newArrayBuffer;
        newAudioNode.connect(this.audioContext.destination);
        this.audioNode = newAudioNode;
        console.log("joined");
    };
    AviatoAudio.prototype.convertToMP3 = function () {
        var a = new Date();
        var mp3encoder = new lamejs.Mp3Encoder(2, this.audioBuffer.sampleRate, 128);
        var mp3data = [];
        var floatLeft = this.audioBuffer.getChannelData(0);
        var floatRight = this.audioBuffer.getChannelData(1);
        var left = new Int32Array(floatLeft.length);
        var right = new Int32Array(floatRight.length);
        for (var i = 0; i < floatLeft.length; i++) {
            left[i] = floatLeft[i] < 0 ? floatLeft[i] * 32768 : floatLeft[i] * 32767;
            right[i] = floatRight[i] < 0 ? floatRight[i] * 32768 : floatRight[i] * 32767;
        }
        var sampleBlockSize = 576;
        for (var i = 0; i < left.length; i += sampleBlockSize) {
            var leftChunk = left.subarray(i, i + sampleBlockSize);
            var rightChunk = right.subarray(i, i + sampleBlockSize);
            var mp3buf_1 = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf_1.length > 0) {
                mp3data.push(mp3buf_1);
            }
        }
        console.log("Encoding took ".concat(((new Date()).getTime() - a.getTime()) / 1000, " seconds"));
        var mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3data.push(mp3buf);
        }
        var blob = new Blob(mp3data, { type: 'audio/mp3' });
        var url = window.URL.createObjectURL(blob);
        console.log("converted");
        return url;
    };
    return AviatoAudio;
}());

exports.AviatoAudio = AviatoAudio;
