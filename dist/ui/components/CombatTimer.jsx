export class CombatTimer {
constructor(opts = {}) {
this.duration = opts.duration ?? 30;
this.onExpire = opts.onExpire ?? (() => {});
this.onTick   = opts.onTick   ?? (() => {});
this._remaining = this.duration;
this._interval  = null;
this._running   = false;
}
get remaining() { return this._remaining; }
get pct()       { return this._remaining / this.duration; }
get isRunning() { return this._running; }
start() {
if (this._running) return;
this._running = true;
this._interval = setInterval(() => {
this._remaining = Math.max(0, this._remaining - 1);
this.onTick(this._remaining, this.pct);
if (this._remaining <= 0) {
this.stop();
this.onExpire();
}
}, 1000);
}
stop() {
this._running = false;
clearInterval(this._interval);
this._interval = null;
}
reset(newDuration) {
this.stop();
if (newDuration !== undefined) this.duration = newDuration;
this._remaining = this.duration;
}
restart(newDuration) {
this.reset(newDuration);
this.start();
}
renderInto(el, actorName = '') {
if (!el) return;
const pct = this.pct * 100;
const color = pct > 50 ? 'var(--success)' : pct > 25 ? 'var(--warning)' : 'var(--danger)';
const pulse = pct < 25 ? 'animation: timerPulse 0.5s infinite alternate;' : '';
el.innerHTML = `
<div style="display:flex; align-items:center; gap:12px; padding:8px 16px; background:rgba(0,0,0,0.3); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
<div style="font-size:0.55rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; white-space:nowrap;">
⏱ TURNO DE<br><strong style="color:var(--accent); font-size:0.7rem;">${actorName}</strong>
</div>
<div style="flex:1; display:flex; flex-direction:column; gap:4px;">
<div style="height:6px; background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden;">
<div style="height:100%; width:${pct}%; background:${color}; border-radius:3px; transition:width 1s linear; ${pulse}"></div>
</div>
<div style="display:flex; justify-content:space-between; align-items:center;">
<div style="font-size:0.6rem; color:${color}; font-weight:800; ${pulse}">${this._remaining}s</div>
<div style="display:flex; gap:4px;">
${this._running
? `<button id="timer-pause-btn" style="background:none; border:1px solid rgba(255,255,255,0.1); color:var(--text-dim); border-radius:4px; padding:1px 6px; cursor:pointer; font-size:0.55rem;">⏸</button>`
: `<button id="timer-play-btn"  style="background:none; border:1px solid rgba(255,255,255,0.1); color:var(--success); border-radius:4px; padding:1px 6px; cursor:pointer; font-size:0.55rem;">▶</button>`
}
<button id="timer-reset-btn" style="background:none; border:1px solid rgba(255,255,255,0.1); color:var(--text-dim); border-radius:4px; padding:1px 6px; cursor:pointer; font-size:0.55rem;">↺</button>
</div>
</div>
</div>
</div>
`;
const playBtn  = el.querySelector('#timer-play-btn');
const pauseBtn = el.querySelector('#timer-pause-btn');
const resetBtn = el.querySelector('#timer-reset-btn');
if (playBtn)  playBtn.onclick  = () => this.start();
if (pauseBtn) pauseBtn.onclick  = () => this.stop();
if (resetBtn) resetBtn.onclick  = () => { this.restart(); };
}
}