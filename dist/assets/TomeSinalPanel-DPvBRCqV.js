import{C as p}from"./Boot-CGoZOUiq.js";import{C as r}from"./CRDTManager-CgAUmNs0.js";import"./main-Bk3T2ZrR.js";import"./BattleManager-CjydHzBy.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./y-websocket-DdQpu-E3.js";class k extends p{constructor(e){super(e),this.masterId="DM_ACTIVE_MASTER",this.messages={},this.eventSource=null,this.activeTable=localStorage.getItem("DM_ACTIVE_TABLE")||"Mesa-01",this.sessionActive=!1,this.characterTokens=[],this.selectedCharId=null}template(){return this.store.state.players,`
            <div class="tome-sinal-pane animate-fadeIn" style="display:flex; flex-direction:column; height: 100vh; background:var(--bg-main); overflow:hidden;">
                <header style="background:var(--primary-dark); padding:20px; display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid var(--primary);">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; box-shadow: 0 0 15px var(--primary);">
                            <i class="fa-solid fa-satellite-dish"></i>
                        </div>
                        <div>
                            <h2 style="margin:0; font-family:'Cinzel',serif; color:#fff; font-size:1.5rem;">TOME.Sinal v2 — Sincronização por QR</h2>
                            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Módulo V14.2 — Central de Comunicações</span>
                        </div>
                    </div>
                    <div>
                        ${this.sessionActive?`<button class="btn btn-danger" onclick="this.closest('.tome-sinal-pane').__component.encerrarSessao()"><i class="fa-solid fa-stop"></i> Encerrar Sessão Atual</button>`:`<button class="btn btn-primary" onclick="this.closest('.tome-sinal-pane').__component.iniciarSessao()"><i class="fa-solid fa-play"></i> Iniciar Sessão de Hoje</button>`}
                    </div>
                </header>

                <div style="display:flex; flex:1; overflow:hidden;">
                    <!-- Lista Lateral de Personagens -->
                    <div style="width: 280px; background: rgba(0,0,0,0.4); border-right: 1px solid rgba(197, 160, 89, 0.2); display: flex; flex-direction: column; overflow-y: auto;">
                        <div style="padding: 15px; font-family: 'Cinzel'; font-size: 1.1rem; color: var(--accent); border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            PERSONAGENS
                        </div>
                        <div id="character-list" style="display:flex; flex-direction:column;">
                            ${this.sessionActive?this.renderCharacterList():'<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Sessão inativa. Inicie a sessão para gerar QR Codes.</div>'}
                        </div>
                    </div>

                    <!-- Fio de Chat Privado -->
                    <div style="flex:1; display:flex; flex-direction:column; background: var(--bg-surface);">
                        ${this.selectedCharId?this.renderChatArea():'<div style="flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-family:Cinzel,serif; font-size:1.2rem;">Selecione um personagem ao lado para abrir o chat privado.</div>'}
                    </div>
                </div>
            </div>
        `}renderCharacterList(){return this.characterTokens.map(e=>{const s=this.selectedCharId===e.characterId,t=e.connected?"var(--success)":"var(--danger)";return`
                <div onclick="this.closest('.tome-sinal-pane').__component.selectCharacter('${e.characterId}')" 
                     style="padding: 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; background: ${s?"rgba(197, 160, 89, 0.15)":"transparent"}; border-left: ${s?"3px solid var(--accent)":"3px solid transparent"};">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${t}; box-shadow: 0 0 5px ${t};"></span>
                        <strong style="color: #fff; font-size: 0.95rem;">${e.nome}</strong>
                    </div>
                </div>
            `}).join("")}renderChatArea(){const e=this.characterTokens.find(s=>s.characterId===this.selectedCharId);return e?`
            <!-- Chat Header -->
            <div style="padding: 15px 20px; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(197, 160, 89, 0.2); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: var(--accent); font-family: 'Cinzel';"><i class="fa-solid fa-shield-halved"></i> Chat: ${e.nome}</h3>
                </div>
                ${e.connected?'<span style="font-size: 0.8rem; color: var(--success);"><i class="fa-solid fa-check-circle"></i> Jogador Online</span>':`<button class="btn btn-ghost btn-sm" onclick="this.closest('.tome-sinal-pane').__component.showQRModal('${e.characterId}')"><i class="fa-solid fa-qrcode"></i> Ver QR desta Sessão</button>`}
            </div>

            <!-- Messages Container -->
            <div id="chat-history-${e.characterId}" style="flex:1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                ${this.renderMessages(e.characterId)}
            </div>

            <!-- Input Area -->
            <div style="padding: 15px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; gap: 10px; margin-bottom: 10px;">
                    <select id="msg-type-${e.characterId}" class="input" style="width: 180px;">
                        <option value="sussurro">Sussurro (Privado)</option>
                        <option value="voz_divina">Voz Divina</option>
                        <option value="alerta">Alerta (Vibração)</option>
                    </select>
                </div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="msg-input-${e.characterId}" class="input" style="flex:1; font-size: 1rem; padding: 12px;" placeholder="Mensagem para ${e.nome}..." onkeypress="if(event.key==='Enter') this.closest('.tome-sinal-pane').__component.sendMessage('${e.characterId}')">
                    <button class="btn btn-primary" onclick="this.closest('.tome-sinal-pane').__component.sendMessage('${e.characterId}')" style="padding: 0 25px;"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
                </div>
            </div>
        `:""}renderMessages(e){const s=this.messages[e]||[];return s.length===0?'<div style="text-align:center; opacity:0.5; font-size:0.9rem; margin-top:20px;">Nenhuma mensagem neste fio de conversa.</div>':s.map(t=>{const a=t.de==="mestre",i=t.tipo==="alerta",n=t.tipo==="voz_divina",l=a?"flex-end":"flex-start";let o=a?"rgba(102,252,241,0.1)":"rgba(255,255,255,0.1)";i&&(o="rgba(239, 68, 68, 0.2)"),n&&(o="rgba(255, 215, 0, 0.15)");let c=a?"border-right: 3px solid var(--primary)":"border-left: 3px solid var(--secondary)";n&&(c="border-right: 3px solid gold");let d=a?"Mestre":"Jogador";return n&&(d="Voz Divina"),`
                <div style="align-self: ${l}; background: ${o}; ${c}; padding: 10px 15px; border-radius: 8px; max-width: 80%; animation: fadeIn 0.3s ease;">
                    <div style="font-size:0.75rem; opacity:0.7; margin-bottom:5px;">
                        ${a?d:'<i class="fa-solid fa-user"></i> '+(t.nome||t.de)}
                    </div>
                    <div style="${i?"color:#ef4444; font-weight:bold;":""} ${n?"color:gold; font-style:italic;":""}">${t.conteudo}</div>
                </div>
            `}).join("")}async onMount(){var e;if(!window.QRious){const s=document.createElement("script");s.src="./ui/utils/vendor/qr-encoder.js",document.head.appendChild(s)}try{const t=await(await fetch(`/api/sessao/${this.activeTable}/tokens`)).json();t.status==="active"&&t.tokens&&t.tokens.length>0&&(this.sessionActive=!0,this.characterTokens=t.tokens,this.selectedCharId=(e=this.characterTokens[0])==null?void 0:e.characterId,this.render())}catch(s){console.error("Failed to fetch active tokens:",s)}this.connectCRDT()}connectCRDT(){r.connect(this.activeTable,"Mestre"),r.chatHistory.observe(e=>{if(this.messages={},r.chatHistory.toArray().forEach(t=>{const a=t.de==="mestre"?t.para:t.de;a&&(this.messages[a]||(this.messages[a]=[]),this.messages[a].push(t))}),this.selectedCharId){const t=this.element.querySelector(`#chat-history-${this.selectedCharId}`);t&&(t.innerHTML=this.renderMessages(this.selectedCharId),this.scrollToBottom(this.selectedCharId))}}),r.provider&&r.provider.awareness&&r.provider.awareness.on("change",()=>{this.syncPresence()}),window.TOME&&window.TOME.socket&&window.TOME.socket.on("player_presence",e=>{if(!e||!e.charId)return;const s=this.characterTokens.find(t=>t.characterId===e.charId);s&&(s.lastSocketPing=Date.now(),this.syncPresence())}),this.presenceInterval=setInterval(()=>{this.syncPresence()},5e3)}syncPresence(){if(!this.sessionActive)return;let e=[];const s=Date.now();r.provider&&r.provider.awareness&&(e=Array.from(r.provider.awareness.getStates().values()).map(a=>{var i;return(i=a.user)==null?void 0:i.charId}).filter(Boolean)),this.characterTokens.forEach(t=>{t.lastSocketPing&&s-t.lastSocketPing<15e3&&(e.includes(t.characterId)||e.push(t.characterId))}),this.updateOnlineStatus(e.map(t=>({id:t})))}updateOnlineStatus(e){if(!this.sessionActive)return;let s=!1;const t=e.map(a=>a.id);if(this.characterTokens.forEach(a=>{const i=t.includes(a.characterId);a.connected!==i&&(a.connected=i,s=!0)}),s){const a=this.element.querySelector("#character-list");a&&(a.innerHTML=this.sessionActive?this.renderCharacterList():'<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Sessão inativa. Inicie a sessão para gerar QR Codes.</div>')}}async iniciarSessao(){var s;const e=this.store.state.players||[];if(e.length===0){alert("Nenhum personagem registrado na mesa.");return}try{const a=await(await fetch("/api/sessao/iniciar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tableId:this.activeTable,personagens:e})})).json();a.status==="success"&&(this.characterTokens=a.tokens.map(i=>({characterId:i.characterId,sessionToken:i.sessionToken,nome:i.nome,connected:!1})),this.sessionActive=!0,this.selectedCharId=(s=this.characterTokens[0])==null?void 0:s.characterId,this.render())}catch(t){console.error("Erro ao iniciar sessão",t)}}async encerrarSessao(){if(confirm("Tem certeza que deseja encerrar a sessão? Os links dos jogadores serão desativados."))try{await fetch("/api/sessao/encerrar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tableId:this.activeTable})}),this.sessionActive=!1,this.characterTokens=[],this.selectedCharId=null,this.render()}catch(e){console.error("Erro ao encerrar sessão",e)}}selectCharacter(e){this.selectedCharId=e;const s=this.element.querySelector(".tome-sinal-pane > div > div:nth-child(2)");s&&(s.innerHTML=this.renderChatArea());const t=this.element.querySelector("#character-list");t&&(t.innerHTML=this.renderCharacterList()),setTimeout(()=>this.scrollToBottom(e),50)}scrollToBottom(e){const s=this.element.querySelector(`#chat-history-${e}`);s&&(s.scrollTop=s.scrollHeight)}async showQRModal(e){const s=this.characterTokens.find(o=>o.characterId===e);if(!s)return;let t=window.location.hostname,a=window.location.port||"4000";try{const c=await(await fetch("/api/system/network")).json();c&&c.ip&&(t=c.ip,a=c.port||a)}catch(o){console.warn("Fallback para hostname atual",o)}const i=`http://${t}:${a}/jogador/${s.sessionToken}`,n=document.getElementById("qr-modal");n&&n.remove();const l=document.createElement("div");l.id="qr-modal",l.style.cssText=`
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
        `,l.innerHTML=`
            <div class="card glass-accent" style="padding: 30px; text-align: center; border-radius: 12px; background: rgba(10,12,16,0.95); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <h3 style="font-family:'Cinzel'; color: var(--accent); margin-bottom: 5px;">Acesso de Jogador</h3>
                <p style="color: #fff; font-size: 1.2rem; margin-bottom: 20px;"><strong>${s.nome}</strong></p>
                <div style="background: #fff; padding: 15px; border-radius: 8px; display: inline-block;">
                    <canvas id="qr-canvas"></canvas>
                </div>
                <p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 20px; max-width: 300px; word-break: break-all;">${i}</p>
                <button class="btn btn-ghost" style="margin-top: 20px; width: 100%;" onclick="this.closest('#qr-modal').remove()">Fechar</button>
            </div>
        `,document.body.appendChild(l),setTimeout(()=>{window.QRious?new window.QRious({element:document.getElementById("qr-canvas"),value:i,size:250,background:"white",foreground:"black"}):console.error("QRious não carregou a tempo.")},100)}async sendMessage(e){const s=this.element.querySelector(`#msg-input-${e}`),t=this.element.querySelector(`#msg-type-${e}`),a=s.value.trim();if(!a)return;const i=t.value,n={id:Date.now()+Math.random().toString(36).substr(2,5),tipo:i,de:"mestre",para:e,conteudo:a,timestamp:Date.now()};r.chatHistory.push([n]),s.value=""}unmount(){this.presenceInterval&&clearInterval(this.presenceInterval),r.disconnect(),super.unmount()}}export{k as TomeSinalPanel};
