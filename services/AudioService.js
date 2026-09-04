function isCrossOrigin(url) {
    if (!url) return false;
    if (url.startsWith('/') || url.startsWith('.') || url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
        return false;
    }
    if (typeof window !== 'undefined' && window.location && url.startsWith(window.location.origin)) {
        return false;
    }
    return url.startsWith('http://') || url.startsWith('https://');
}

export class AudioService {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this._channels = {
            music: { audio: null, source: null, gain: null, volume: 0.5 },
            ambience: { audio: null, source: null, gain: null, volume: 0.5 }
        };
        this._masterVolume = 1.0;
    }

    _initAudioContext() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this._masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.error('[AudioService] Failed to initialize AudioContext:', e);
        }
    }

    async playSFX(url) {
        this._initAudioContext();
        try {
            const audio = new Audio(url);
            const useWebAudio = this.ctx && !isCrossOrigin(url);

            if (useWebAudio) {
                audio.crossOrigin = 'anonymous';
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                const sfxGain = this.ctx.createGain();
                sfxGain.gain.setValueAtTime(this._masterVolume * 0.5, this.ctx.currentTime);
                sfxGain.connect(this.ctx.destination);

                const source = this.ctx.createMediaElementSource(audio);
                source.connect(sfxGain);

                audio.play().catch(() => {
                    this.playSyntheticSFX('hit');
                });

                // Clean up when ended
                audio.onended = () => {
                    source.disconnect();
                    sfxGain.disconnect();
                };
            } else {
                audio.volume = this._masterVolume * 0.5;
                audio.play().catch(() => {
                    this.playSyntheticSFX('hit');
                });
            }
        } catch (e) {
            console.warn('[Audio] SFX failed, invoking synthetic sound fallback:', url, e);
            this.playSyntheticSFX('hit');
        }
    }

    /**
     * Procedural synthetic Web Audio sound generator (100% offline & zero-latency)
     * @param {'dice' | 'hit' | 'crit' | 'alert' | 'spell'} type 
     */
    playSyntheticSFX(type = 'dice') {
        this._initAudioContext();
        if (!this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const now = this.ctx.currentTime;

            if (type === 'dice') {
                // Procedural wooden dice roll clatter (3 rapid pitch-modulated clicks)
                for (let i = 0; i < 3; i++) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const startTime = now + (i * 0.045);
                    const freq = 320 + Math.random() * 180;
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, startTime);
                    osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.04);

                    gain.gain.setValueAtTime(this._masterVolume * 0.25, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

                    osc.connect(gain);
                    gain.connect(this.masterGain || this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.045);
                }
            } else if (type === 'hit') {
                // Impact punch / weapon clash (fast noise burst + low thud)
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

                gain.gain.setValueAtTime(this._masterVolume * 0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(gain);
                gain.connect(this.masterGain || this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.13);
            } else if (type === 'crit') {
                // Golden heroic chime (major arpeggio chord: C5, E5, G5, C6)
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const noteStart = now + (idx * 0.06);

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, noteStart);

                    gain.gain.setValueAtTime(this._masterVolume * 0.2, noteStart);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

                    osc.connect(gain);
                    gain.connect(this.masterGain || this.ctx.destination);
                    osc.start(noteStart);
                    osc.stop(noteStart + 0.36);
                });
            } else if (type === 'alert') {
                // Diegetic brass bell ping (dual harmonic sines)
                [880, 1760].forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now);

                    gain.gain.setValueAtTime(this._masterVolume * 0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

                    osc.connect(gain);
                    gain.connect(this.masterGain || this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.42);
                });
            } else if (type === 'spell') {
                // Mystical resonant frequency sweep
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

                gain.gain.setValueAtTime(this._masterVolume * 0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

                osc.connect(gain);
                gain.connect(this.masterGain || this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.42);
            }
        } catch (e) {
            console.warn('[AudioService] Synthetic SFX failed:', e);
        }
    }

    /**
     * Toca um efeito sonoro espacialmente, com volume e pan (esquerda/direita) baseados 
     * na distância e ângulo do evento (x, y) em relação à câmera do usuário.
     */
    async playSpatialSFX(url, eventX, eventY, cameraX, cameraY, cameraScale = 1.0) {
        this._initAudioContext();
        try {
            const audio = new Audio(url);
            const useWebAudio = this.ctx && !isCrossOrigin(url);

            if (useWebAudio) {
                audio.crossOrigin = 'anonymous';
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                
                const sfxGain = this.ctx.createGain();
                const panner = this.ctx.createStereoPanner();
                
                // Cálculo de distância e Pan 
                const dx = eventX - cameraX;
                const dy = eventY - cameraY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // O alcance auditivo efetivo (ex: 2000 pixels do Konva base)
                const maxAudibleDistance = 2000;
                let attenuation = 1 - Math.min(distance / maxAudibleDistance, 1);
                attenuation = Math.pow(attenuation, 2); // curva quadrática para fading mais natural
                
                // Pan baseia-se na distância horizontal
                // Se a distância for muito pequena, o pan é 0 (centro)
                let panValue = 0;
                if (distance > 0) {
                    panValue = (dx / (window.innerWidth / cameraScale)) * 2; // Normaliza
                    panValue = Math.max(-1, Math.min(1, panValue));
                }

                panner.pan.value = panValue;
                sfxGain.gain.value = this._masterVolume * 0.6 * attenuation;
                
                const source = this.ctx.createMediaElementSource(audio);
                source.connect(panner);
                panner.connect(sfxGain);
                sfxGain.connect(this.masterGain);

                audio.play().catch(() => {});

                audio.onended = () => {
                    source.disconnect();
                    panner.disconnect();
                    sfxGain.disconnect();
                };
            } else {
                audio.volume = this._masterVolume * 0.5;
                await audio.play().catch(() => {});
            }
        } catch (e) {
            console.warn('[Audio] Spatial SFX failed:', url, e);
        }
    }

    playChannel(channel, url) {
        this._initAudioContext();
        if (!this._channels[channel]) return;
        
        // Stop current channel audio first
        this.stopChannel(channel);

        const chan = this._channels[channel];
        const audio = new Audio(url);
        const useWebAudio = this.ctx && !isCrossOrigin(url);

        if (useWebAudio) {
            audio.crossOrigin = 'anonymous';
        }
        audio.loop = true;

        if (useWebAudio) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            if (!chan.gain) {
                chan.gain = this.ctx.createGain();
                chan.gain.connect(this.masterGain);
            }

            const source = this.ctx.createMediaElementSource(audio);
            source.connect(chan.gain);
            chan.source = source;

            chan.gain.gain.setValueAtTime(chan.volume, this.ctx.currentTime);
        } else {
            audio.volume = chan.volume * this._masterVolume;
        }

        audio.play().catch(() => {});
        chan.audio = audio;
    }

    stopChannel(channel) {
        const chan = this._channels[channel];
        if (chan) {
            if (chan.audio) {
                chan.audio.pause();
                chan.audio = null;
            }
            if (chan.source) {
                chan.source.disconnect();
                chan.source = null;
            }
        }
    }

    setChannelVolume(channel, val) {
        const chan = this._channels[channel];
        if (!chan) return;
        chan.volume = val;
        
        if (this.ctx && chan.gain && chan.source) {
            chan.gain.gain.setValueAtTime(val, this.ctx.currentTime);
        } else if (chan.audio) {
            chan.audio.volume = val * this._masterVolume;
        }
    }

    stopAll() {
        Object.keys(this._channels).forEach(c => this.stopChannel(c));
    }

    setMasterVolume(val) {
        this._masterVolume = val;
        if (this.ctx && this.masterGain) {
            this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
        } else {
            Object.keys(this._channels).forEach(c => {
                const chan = this._channels[c];
                if (chan.audio) {
                    chan.audio.volume = chan.volume * val;
                }
            });
        }
    }

    async fadeTo(channel, url, durationMs = 2000) {
        try {
            this._initAudioContext();
            const chan = this._channels[channel];
            if (!chan) return;

            const durationSec = durationMs / 1000;
            const useWebAudio = this.ctx && !isCrossOrigin(url) && !(chan.audio && isCrossOrigin(chan.audio.src));

            if (!useWebAudio) {
                await this._fallbackFadeTo(channel, url, durationMs);
                return;
            }

            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const oldAudio = chan.audio;
            const oldGain = chan.gain;
            const oldSource = chan.source;

            // Create new Audio and GainNode for incoming track (to do parallel cross-fade)
            const newAudio = new Audio(url);
            newAudio.crossOrigin = 'anonymous';
            newAudio.loop = true;
            
            const newGain = this.ctx.createGain();
            newGain.connect(this.masterGain);
            
            const newSource = this.ctx.createMediaElementSource(newAudio);
            newSource.connect(newGain);

            const now = this.ctx.currentTime;

            // Ramps: linear fade out of old track, fade in of new track
            if (oldAudio && oldGain) {
                oldGain.gain.setValueAtTime(oldGain.gain.value, now);
                oldGain.gain.linearRampToValueAtTime(0, now + durationSec);
            }

            newGain.gain.setValueAtTime(0, now);
            newGain.gain.linearRampToValueAtTime(chan.volume, now + durationSec);

            newAudio.play().catch(() => {});

            chan.audio = newAudio;
            chan.gain = newGain;
            chan.source = newSource;

            // Cleanup old track after transition finishes
            setTimeout(() => {
                if (oldAudio) {
                    oldAudio.pause();
                }
                if (oldSource) {
                    oldSource.disconnect();
                }
                if (oldGain) {
                    oldGain.disconnect();
                }
            }, durationMs + 100);
        } catch (fadeErr) {
            console.warn('[AudioService] WebAudio fadeTo failed, using fallback:', fadeErr);
            await this._fallbackFadeTo(channel, url, durationMs);
        }
    }

    async _fallbackFadeTo(channel, url, durationMs) {
        const chan = this._channels[channel];
        if (chan.audio) {
            const startVol = chan.audio.volume;
            const steps = 20;
            const interval = durationMs / 2 / steps;
            for (let i = steps; i >= 0; i--) {
                if (!chan.audio) break;
                chan.audio.volume = (i / steps) * startVol;
                await new Promise(r => setTimeout(r, interval));
            }
            if (chan.audio) chan.audio.pause();
        }

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0;
        this._channels[channel].audio = audio;
        await audio.play().catch(() => {});

        const targetVol = chan.volume * this._masterVolume;
        const stepsIn = 20;
        const intervalIn = durationMs / 2 / stepsIn;
        for (let i = 0; i <= stepsIn; i++) {
            audio.volume = (i / stepsIn) * targetVol;
            await new Promise(r => setTimeout(r, intervalIn));
        }
    }
}
