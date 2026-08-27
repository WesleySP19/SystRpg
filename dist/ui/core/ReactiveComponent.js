import { Component } from './Component.js';
import { render } from 'preact';
export class ReactiveComponent extends Component {
constructor(opts) {
super(opts);
this._preactRoot = null;
this.storePath = opts.storePath || null;
}
mount(target) {
if (target) this.element = target;
this.target = this.element;
if (!this.target) {
console.error('[ReactiveComponent] Erro: elemento raiz não definido.', this);
return;
}
if (this.store) {
if (this.storePath && this.store.subscribeTo) {
this.unsubscribe = this.store.subscribeTo(this.storePath, () => this.update());
} else {
this.unsubscribe = this.store.subscribe(() => this.update());
}
}
if (this.events) {
for (const [evt, handler] of Object.entries(this.events)) {
const [eventName, selector] = evt.split(' ', 2);
this.target.addEventListener(eventName, (e) => {
const match = e.target.closest(selector);
if (match) {
handler.call(this, e, match);
}
});
}
}
this.target.addEventListener('click', (e) => {
const actionBtn = e.target.closest('[data-action]');
if (actionBtn && this[actionBtn.dataset.action]) {
this[actionBtn.dataset.action](e, actionBtn);
}
});
this.onMount();
this.update(); // Trigger first Preact render
}
update() {
if (!this.target) return;
const vnode = this.template();
render(vnode, this.target);
}
unmount() {
if (this.unsubscribe) this.unsubscribe();
if (this.target) {
render(null, this.target); // Limpa o Virtual DOM
this.target.innerHTML = '';
}
this.onUnmount();
}
}