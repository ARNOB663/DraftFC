import { Howl } from 'howler';

class SoundManager {
    private sounds: Record<string, Howl> = {};
    private enabled: boolean = true;

    constructor() {
        this.initializeSounds();
    }

    private initializeSounds() {
        this.sounds = {
            bid_placed: new Howl({ src: ['/sounds/bid_placed.mp3'] }),
            outbid: new Howl({ src: ['/sounds/outbid.mp3'] }),
            sold: new Howl({ src: ['/sounds/sold.mp3'] }),
            timer_tick: new Howl({ src: ['/sounds/timer_tick.mp3'] }),
            game_start: new Howl({ src: ['/sounds/game_start.mp3'] }),
            game_win: new Howl({ src: ['/sounds/game_win.mp3'] }),
        };
    }

    play(soundName: string) {
        if (!this.enabled || !this.sounds[soundName]) return;
        this.sounds[soundName].play();
    }

    toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

export const soundManager = new SoundManager();
