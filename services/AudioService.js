export class AudioService {
    constructor() {
        this._channels = {
            music: { audio: null, volume: 0.5 },
            ambience: { audio: null, volume: 0.5 }
        };
        this._masterVolume = 1.0;
    }

    async playSFX(url) {
        try {
            const audio = new Audio(url);
            audio.volume = this._masterVolume * 0.5;
            await audio.play().catch(() => {});
        } catch (e) {
            console.warn('[Audio] SFX failed:', url);
        }
    }

    playChannel(channel, url) {
        if (!this._channels[channel]) return;
        
        // Stop current
        if (this._channels[channel].audio) {
            this._channels[channel].audio.pause();
        }

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this._channels[channel].volume * this._masterVolume;
        audio.play().catch(() => {});
        
        this._channels[channel].audio = audio;
    }

    stopChannel(channel) {
        if (this._channels[channel]?.audio) {
            this._channels[channel].audio.pause();
            this._channels[channel].audio = null;
        }
    }

    setChannelVolume(channel, val) {
        if (!this._channels[channel]) return;
        this._channels[channel].volume = val;
        if (this._channels[channel].audio) {
            this._channels[channel].audio.volume = val * this._masterVolume;
        }
    }

    stopAll() {
        Object.keys(this._channels).forEach(c => this.stopChannel(c));
    }

    setMasterVolume(val) {
        this._masterVolume = val;
        Object.keys(this._channels).forEach(c => {
            if (this._channels[c].audio) {
                this._channels[c].audio.volume = this._channels[c].volume * val;
            }
        });
    }
}
