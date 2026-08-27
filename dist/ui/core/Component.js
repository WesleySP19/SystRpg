import { render as preactRender } from 'preact';
import { effect } from '@preact/signals';
export class Component {
constructor(options = {}) {
this.store = options.store || null;
this.element = options.element || null;
this.props = options.props || {};
this._lastHTML = '';
this._unsubscribe = null;
this._eventCleanups = [];
this._mounted = false;
}
mount() {
if (this._mounted) return;
this._mounted = true;
if (this.store) {
this._unsubscribe = effect(() => {
this.onStoreUpdate(this.store.signal.value);
});
}
this.render();
}
unmount() {
this._mounted = false;
if (this._unsubscribe) {
this._unsubscribe();
this._unsubscribe = null;
}
this._eventCleanups.forEach(fn => fn());
this._eventCleanups = [];
this.onUnmount();
if (this.element) {
try { preactRender(null, this.element); } catch(e){}
this.element.innerHTML = '';
}
}
onStoreUpdate(state) {
this.render();
}
render(subKey) {
if (!this.element || !this._mounted) return;
if (subKey && typeof this['render_' + subKey] === 'function') {
requestAnimationFrame(() => {
if (!this._mounted) return;
this['render_' + subKey]();
});
return;
}
if (this._renderPending) return;
this._renderPending = true;
requestAnimationFrame(() => {
this._renderPending = false;
if (!this._mounted) return;
const output = this.template();
if (typeof output === 'string') {
let html = output.trim();
html = html.replace(/<img(?!.*?loading=)([^>]+)>/g, '<img loading="lazy"$1>');
if (html === this._lastHTML) return;
this._eventCleanups.forEach(fn => fn());
this._eventCleanups = [];
this.element.innerHTML = html;
this._lastHTML = html;
if (this.element && this.element.children) {
Array.from(this.element.children).forEach(child => {
child.__component = this;
});
}
this._bindDelegatedEvents();
if (typeof this.onMount === 'function') {
this.onMount();
}
} else if (output != null) {
preactRender(output, this.element);
if (!this._vdomMounted) {
if (typeof this.onMount === 'function') this.onMount();
this._vdomMounted = true;
}
}
});
}
template() { return ''; }
onMount() {}
onUnmount() {}
_bindDelegatedEvents() {
this.element.querySelectorAll('[data-action]').forEach(el => {
const action = el.dataset.action;
if (typeof this[action] === 'function') {
el.onclick = (e) => this[action](e, el);
}
});
}
listen(target, event, handler) {
target.addEventListener(event, handler);
this._eventCleanups.push(() => target.removeEventListener(event, handler));
}
$(selector) { return this.element?.querySelector(selector) || null; }
$$(selector) { return this.element?.querySelectorAll(selector) || []; }
}