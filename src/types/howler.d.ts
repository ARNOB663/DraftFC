declare module 'howler' {
    export class Howl {
        constructor(options: any);
        play(sprite?: string): number;
        pause(id?: number): void;
        stop(id?: number): void;
        mute(muted: boolean, id?: number): void;
        volume(vol?: number, id?: number): number | void;
        fade(from: number, to: number, duration: number, id?: number): void;
        rate(rate?: number, id?: number): number | void;
        seek(seek?: number, id?: number): number | void;
        loop(loop?: boolean, id?: number): boolean | void;
        state(): string;
        playing(id?: number): boolean;
        duration(id?: number): number;
        on(event: string, fn: Function, id?: number): void;
        once(event: string, fn: Function, id?: number): void;
        off(event: string, fn?: Function, id?: number): void;
        load(): void;
        unload(): void;
    }
    export var Howler: any;
}
