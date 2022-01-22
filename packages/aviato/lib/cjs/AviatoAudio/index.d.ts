/// <reference types="node" />
interface trimValues {
    start: String;
    end: String;
}
export declare class AviatoAudio {
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
    append(audio: AviatoAudio): void;
    convertToMP3(): String;
}
export {};
