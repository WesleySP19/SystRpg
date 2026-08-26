import{C as c}from"./Boot-CGoZOUiq.js";import{m as i}from"./main-Bk3T2ZrR.js";import{a as p}from"./BattleManager-CjydHzBy.js";import{C as o}from"./CRDTManager-CgAUmNs0.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./y-websocket-DdQpu-E3.js";class _ extends c{constructor(e){super(e),this._isExpanded=!1,this._connected=!1,o&&o.chatHistory&&o.chatHistory.observe(()=>{this.render(),this._scrollToBottom()})}onMount(){if(!this._connected&&o){this._connected=!0;const e=localStorage.getItem("DM_ACTIVE_TABLE")||"global";o.connect(e)}this._isExpanded&&this._scrollToBottom()}_scrollToBottom(){setTimeout(()=>{if(this.element){const e=this.element.querySelector("#chat-history");e&&(e.scrollTop=e.scrollHeight)}},10)}_toggleExpand(){this._isExpanded=!this._isExpanded,this.render(),this._isExpanded&&(this._scrollToBottom(),setTimeout(()=>{var t;const e=(t=this.element)==null?void 0:t.querySelector("#chat-input");e&&e.focus()},50))}_onSubmit(e){e.preventDefault();const t=e.currentTarget.querySelector("#chat-input");!t||!t.value.trim()||(this._handleMessage(t.value.trim()),t.value="")}template(){var a;const e=(a=o)!=null&&a.chatHistory?o.chatHistory.toArray():[],t=e.length>0?e.slice(-50):[{id:"sys_msg",sender:"Sistema",message:"Grimórios conectados via Y-Websocket. Sincronização offline-first ativa! Digite /roll 1d20+FOR para rolar dados.",isSystem:!0}];return i`
            <div id="chat-container" class="glass-accent" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${this._isExpanded?"350px":"60px"};
                height: ${this._isExpanded?"460px":"60px"};
                border-radius: ${this._isExpanded?"16px":"50%"};
                box-shadow: 0 12px 35px rgba(0,0,0,0.85), 0 0 15px rgba(197, 160, 89, 0.25);
                border: 1px solid rgba(197, 160, 89, 0.5);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: ${this._isExpanded?"rgba(15, 12, 18, 0.75)":"var(--accent)"};
                backdrop-filter: blur(12px);
            ">
                ${this._isExpanded?this._renderExpanded(t):this._renderCollapsed()}
            </div>
        `}_renderCollapsed(){return i`
            <button id="chat-toggle" onClick=${()=>this._toggleExpand()} class="btn btn-ghost" style="width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; color: #fff; font-size: 1.5rem; padding: 0; border: none; background: transparent; cursor: pointer; transition: transform 0.2s;" onMouseOver=${e=>e.currentTarget.style.transform="scale(1.1)"} onMouseOut=${e=>e.currentTarget.style.transform="scale(1)"}>
                <i class="fa-solid fa-comment-dots"></i>
            </button>
        `}_renderExpanded(e){return i`
            <div style="background: linear-gradient(135deg, rgba(197, 160, 89, 0.2), rgba(0,0,0,0.8)); padding: 12px 16px; border-bottom: 1px solid rgba(197, 160, 89, 0.3); display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-family: 'Cinzel'; margin: 0; color: var(--accent); font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-dice-d20" style="color: var(--accent); filter: drop-shadow(0 0 5px rgba(197,160,89,0.5));"></i> 
                    Chat Arcana
                </h4>
                <button onClick=${()=>this._toggleExpand()} class="btn btn-ghost btn-sm" style="padding: 4px 8px; color: var(--text-dim); background: transparent; border: none; cursor: pointer;">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
            
            <div id="chat-history" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scroll-behavior: smooth;">
                ${e.map(t=>this._renderMessage(t))}
            </div>
            
            <div style="padding: 12px; border-top: 1px solid rgba(197, 160, 89, 0.3); background: rgba(0,0,0,0.5);">
                <form id="chat-form" onSubmit=${t=>this._onSubmit(t)} style="display: flex; gap: 8px; margin: 0;">
                    <input type="text" name="message" id="chat-input" placeholder="/roll 1d20+FOR..." autocomplete="off" style="flex: 1; background: rgba(255,255,255,0.08); border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s, background 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);" onFocus=${t=>Object.assign(t.currentTarget.style,{background:"rgba(255,255,255,0.12)",borderColor:"var(--accent)"})} onBlur=${t=>Object.assign(t.currentTarget.style,{background:"rgba(255,255,255,0.08)",borderColor:"rgba(197, 160, 89, 0.4)"})} />
                    <button type="submit" class="btn btn-primary btn-sm" style="padding: 0 16px; border-radius: 8px; border: none; background: linear-gradient(135deg, #d4af37, #b38b2d); color: #0a0c10; cursor: pointer; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s;" onMouseOver=${t=>t.currentTarget.style.transform="scale(1.05)"} onMouseOut=${t=>t.currentTarget.style.transform="scale(1)"}>
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `}_renderMessage(e){if(!e)return null;const t=e.isSystem||e.tipo==="sistema",a=e.isRoll||e.tipo==="rolagem",n=e.sender||e.nome||e.de||(t?"Sistema":"Aventureiro"),l=e.message!==void 0?e.message:e.conteudo!==void 0?e.conteudo:"";if(t)return i`
                <div style="text-align: center; margin: 6px 0; animation: fadeIn 0.3s ease;" key=${e.id}>
                    <span style="font-size: 0.75rem; color: var(--accent); font-style: italic; background: rgba(197,160,89,0.12); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.25); display: inline-block;">
                        <i class="fa-solid fa-sparkles" style="margin-right: 4px;"></i> ${l}
                    </span>
                </div>
            `;if(a){const r=e.formula||"",d=e.total!==void 0&&e.total!==null?e.total:"🎲",s=e.details||"";return i`
                <div style="background: linear-gradient(145deg, rgba(34, 197, 94, 0.08), rgba(15, 20, 15, 0.9)); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 10px; padding: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); animation: scaleUp 0.25s ease;" key=${e.id}>
                    <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fa-solid fa-dice-d20" style="color: var(--success); margin-right: 4px;"></i> <strong>${n}</strong> rolou os dados</span>
                        <span style="font-size: 0.65rem; opacity: 0.7;">🎲 Rolagem Arcana</span>
                    </div>
                    <div style="font-family: 'Cinzel'; font-size: 1.1rem; color: var(--success); text-align: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px inset rgba(255,255,255,0.05);">
                        ${r?i`<span style="font-size: 0.8rem; color: var(--text-main); font-family: monospace; opacity: 0.85;">${r}</span><br/>`:null}
                        <strong style="font-size: 1.8rem; color: #22c55e; text-shadow: 0 0 15px rgba(34, 197, 94, 0.6); display: inline-block; margin-top: 2px;">${d}</strong>
                    </div>
                    ${s?i`<div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; margin-top: 6px; font-family: monospace;">${s}</div>`:null}
                </div>
            `}return i`
            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; padding: 8px 12px; animation: fadeInRight 0.2s ease;" key=${e.id}>
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: bold; display: block; margin-bottom: 3px; font-family: 'Cinzel';">${n}</span>
                <span style="font-size: 0.92rem; color: #f3f4f6; word-break: break-word; line-height: 1.4;">${l}</span>
            </div>
        `}_handleMessage(e){const t=this.store.state.currentHero||{name:"Mestre",attributes:{}},a=t.name||"Desconhecido",n=Date.now();let r={id:crypto.randomUUID?crypto.randomUUID():n.toString(),timestamp:n,sender:a,message:e,isSystem:!1,isRoll:!1,tipo:"geral",nome:a,de:a,para:"todos",conteudo:e,avatar:""};if(e.startsWith("/roll ")||e.startsWith("/r ")){const d=e.replace(/^\/(roll|r)\s+/i,"");try{const s=p.resolveFormula(d,t.attributes||{});r.isRoll=!0,r.tipo="rolagem",r.formula=s.formula,r.total=s.total,r.details=`[${s.rolls.join(", ")}] + MOD`,s.isCrit&&(r.details+=" 🎯 CRÍTICO!"),s.isFumble&&(r.details+=" 💀 FALHA CRÍTICA!")}catch(s){r={id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),timestamp:Date.now(),sender:"Sistema",message:`Erro na rolagem: ${s.message}`,isSystem:!0,tipo:"sistema"}}}o&&o.chatHistory&&(o.chatHistory.push([r]),localStorage.getItem("DM_ACTIVE_TABLE")&&o.chatHistory.length>250&&setTimeout(()=>{o.chatHistory.length>250&&o.chatHistory.delete(0,o.chatHistory.length-200)},5e3))}}export{_ as ChatBox};
