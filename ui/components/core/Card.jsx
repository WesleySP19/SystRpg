import { html } from 'htm/preact';

export function Card({ children, className = '', style = {}, title, icon, actions, glass = true }) {
    const baseClass = glass ? 'card glass-accent' : 'card bg-black/60';
    
    return html`
        <div class="${baseClass} ${className}" style=${{
            padding: '25px', 
            borderRadius: '20px', 
            border: '1px solid rgba(197,160,89,0.2)', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            ...style
        }}>
            ${(title || icon || actions) ? html`
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.2rem; font-weight:bold; display:flex; align-items:center; gap:10px;">
                        ${icon ? html`<i class="fa-solid ${icon}"></i>` : ''}
                        ${title}
                    </div>
                    ${actions ? html`<div style="display:flex; gap:10px;">${actions}</div>` : ''}
                </div>
            ` : ''}
            <div style="position:relative; z-index:2;">
                ${children}
            </div>
        </div>
    `;
}
