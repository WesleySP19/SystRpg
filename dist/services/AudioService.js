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
audio.play().catch(() => {});
audio.onended = () => {
source.disconnect();
sfxGain.disconnect();
};
} else {
audio.volume = this._masterVolume * 0.5;
await audio.play().catch(() => {});
}
} catch (e) {
console.warn('[Audio] SFX failed:', url, e);
}
}
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
const dx = eventX - cameraX;
const dy = eventY - cameraY;
const distance = Math.sqrt(dx * dx + dy * dy);
const maxAudibleDistance = 2000;
let attenuation = 1 - Math.min(distance / maxAudibleDistance, 1);
attenuation = Math.pow(attenuation, 2); // curva quadrática para fading mais natural
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
const newAudio = new Audio(url);
newAudio.crossOrigin = 'anonymous';
newAudio.loop = true;
const newGain = this.ctx.createGain();
newGain.connect(this.masterGain);
const newSource = this.ctx.createMediaElementSource(newAudio);
newSource.connect(newGain);
const now = this.ctx.currentTime;
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