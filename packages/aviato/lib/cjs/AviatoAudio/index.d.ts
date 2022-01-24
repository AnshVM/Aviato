/// <reference types="node" />
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
    trim(trimValues: {
        start: String | number;
        end: String | number;
    }): void;
    append(audio: AviatoAudio): void;
    convertToMP3(): Promise<String>;
    cut(cutValues: {
        start: String | number;
        end: String | number;
    }): void;
}
