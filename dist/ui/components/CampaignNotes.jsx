import { html } from 'htm/preact';
export function renderQuickJournal(context) {
const journal = context.store.state.journalEntries || [];
if (journal.length === 0) {
return html`<div style="font-size:0.75rem; color:#64748b; font-style:italic; text-align:center; padding:15px;">Nenhum evento recente registrado.</div>`;
}
return journal.slice(-4).reverse().map(e => html`
<div style="font-size:0.7rem; color:#e2e8f0; line-height:1.4; padding-bottom:6px; border-bottom:1px dashed rgba(255,255,255,0.03);">
<strong style="color:var(--accent); font-family:'Cinzel';">[${e.type.toUpperCase()}] ${e.title}</strong>: ${e.content}
</div>
`);
}