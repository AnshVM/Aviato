/// <reference types="node" />
interface trimValues {
    start: String;
    end: String;
}
declare class AviatoAudio {
    audioElement: HTMLAudioElement;
    audioContext: AudioContext;
    audioNode: AudioBufferSourceNode;
    audioBuffer: AudioBuffer;
    duration: number;
    durationInterval: NodeJS.Timer;
    constructor(audioElement: HTMLAudioElement);
    play(): void;
    pause(): void;
    trim(trimValues: trimValues): void;
}
export default AviatoAudio;
