import{C as u}from"./Boot-B2dG6x9f.js";import{T as p}from"./BattleManager-2t4w_Qpj.js";import{C as m}from"./CardRenderer-CTgGsrRT.js";import{Toast as g}from"./Toast-m0Ci56ke.js";import{e as b}from"./imageExport-Ck9NIU6v.js";import{P as y}from"./jsxRuntime.module-BN06QUIv.js";import"./main-Dh89y2UZ.js";import"./FXEngine-BD9eU4lT.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class P extends u{constructor(i){super(i),this._selectedHeroId=null,this._redrawTimer=null}template(){var r,t,a,o,s,n,d;const{players:i}=this.store.state,e=i==null?void 0:i.find(l=>l.id===this._selectedHeroId);return`
            <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out;">
                <div class="section-header" style="margin-bottom: 25px;">
                    <h2 class="section-title"><i class="fa-solid fa-address-card" style="color:var(--accent); margin-right:12px;"></i> Gerador de Cartas de Heróis</h2>
                    <p class="section-subtitle">Gere os cards físicos de frente e verso baseados nos status em tempo real</p>
                </div>

                <div style="display:flex; gap:20px; margin-bottom:30px; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="flex:1;">
                        <label style="font-size:0.85rem; font-weight:800; color:var(--accent); letter-spacing:1px; text-transform:uppercase;">Selecione a Lenda:</label>
                        <select class="legacy-input" style="width:100%; font-size:1.1rem; margin-top:8px; padding:10px; background:rgba(0,0,0,0.4) !important;" data-action="selectHero">
                            <option value="">-- Escolha um Herói --</option>
                            ${i?i.map(l=>`<option value="${l.id}" ${this._selectedHeroId===l.id?"selected":""}>${l.name} (Nv. ${l.level||1})</option>`).join(""):""}
                        </select>
                    </div>
                </div>

                ${e?`
                    <div style="display:grid; grid-template-columns: 1fr 380px; gap:40px; align-items:start; width:100%;">
                        
                        <!-- LEFT PANEL: CANVAS PREVIEWS -->
                        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; padding:30px; background:rgba(255,255,255,0.02); border-radius:15px; border:1px solid rgba(255,255,255,0.05); backdrop-filter:blur(10px);">
                            <p style="color:var(--text-dim); font-size:0.85rem; text-align:center; margin:0;">
                                <i class="fa-solid fa-circle-info" style="color:var(--accent); margin-right:5px;"></i> Clique em qualquer uma das cartas abaixo para fazer o download em alta resolução (PNG de 300 DPI).
                            </p>
                            
                            <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap; margin-top:20px; width:100%;">
                                <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-weight:800; letter-spacing:1px; font-size:0.9rem;">FRENTE (COMBATE)</h4>
                                    <canvas id="tool-card-front" data-action="downloadCard" data-side="front" style="border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(197, 160, 89, 0.1); max-width:100%; height:auto; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition:transform 0.2s;"></canvas>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-weight:800; letter-spacing:1px; font-size:0.9rem;">VERSO (HISTÓRIA)</h4>
                                    <canvas id="tool-card-back" data-action="downloadCard" data-side="back" style="border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(197, 160, 89, 0.1); max-width:100%; height:auto; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition:transform 0.2s;"></canvas>
                                </div>
                            </div>
                            
                            <div style="margin-top:15px; width:100%; display:flex; justify-content:center;">
                                <button class="btn btn-primary" data-action="downloadPrintablePair" style="padding:12px 30px; font-size:0.85rem; font-family:'Cinzel'; letter-spacing:1.5px; box-shadow:0 0 12px var(--accent); font-weight:800;">
                                    <i class="fa-solid fa-file-image" style="margin-right:8px;"></i> BAIXAR PAR IMPRIMÍVEL LADO A LADO (5:7)
                                </button>
                            </div>
                        </div>

                        <!-- RIGHT PANEL: PREMIUM CARD CUSTOMIZER -->
                        <div class="card glass-accent" style="padding:25px; display:flex; flex-direction:column; gap:20px; border:2px solid var(--accent); border-radius:15px; position:sticky; top:20px; background:rgba(18,18,22,0.9); backdrop-filter:blur(15px); box-shadow:0 15px 40px rgba(0,0,0,0.6);">
                            <h3 style="margin:0; font-family:'Cinzel'; color:var(--accent); display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; font-weight:900; letter-spacing:1px; font-size:1.1rem;">
                                <i class="fa-solid fa-sliders"></i> AJUSTES DO CARD
                            </h3>
                            
                            <!-- Portrait Image Section -->
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-image"></i> Imagem de Retrato
                                </label>
                                <button class="btn btn-ghost btn-sm btn-block" data-action="triggerPortrait" style="border:1px dashed var(--accent); padding:10px; font-size:0.75rem; font-weight:800;">
                                    <i class="fa-solid fa-upload"></i> MUDAR ARQUIVO DE FOTO
                                </button>
                                <input type="file" id="tool-portrait-input" style="display:none;" accept="image/*">
                            </div>

                            <!-- Sliders Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:15px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <label style="font-size:0.8rem; font-weight:800; color:var(--accent); text-transform:uppercase; letter-spacing:0.5px;">
                                        <i class="fa-solid fa-up-down-left-right"></i> Enquadramento
                                    </label>
                                    <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:2px 8px; border:1px solid rgba(255,255,255,0.2); font-weight:800;" data-action="resetPortrait">
                                        CENTRALIZAR
                                    </button>
                                </div>
                                
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">ZOOM (ESCALA)</span>
                                        <span id="label-scale" style="color:var(--accent);">${(((r=e.portraitSettings)==null?void 0:r.scale)||1).toFixed(2)}x</span>
                                    </div>
                                    <input type="range" class="btn-block" min="0.5" max="3" step="0.05" value="${((t=e.portraitSettings)==null?void 0:t.scale)||1}" data-action="updatePortrait" data-key="scale" style="accent-color:var(--accent);">
                                </div>

                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">DESLOCAMENTO X</span>
                                        <span id="label-x" style="color:var(--accent);">${((a=e.portraitSettings)==null?void 0:a.x)||0}px</span>
                                    </div>
                                    <input type="range" class="btn-block" min="-250" max="250" step="1" value="${((o=e.portraitSettings)==null?void 0:o.x)||0}" data-action="updatePortrait" data-key="x" style="accent-color:var(--accent);">
                                </div>

                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">DESLOCAMENTO Y</span>
                                        <span id="label-y" style="color:var(--accent);">${((s=e.portraitSettings)==null?void 0:s.y)||0}px</span>
                                    </div>
                                    <input type="range" class="btn-block" min="-250" max="250" step="1" value="${((n=e.portraitSettings)==null?void 0:n.y)||0}" data-action="updatePortrait" data-key="y" style="accent-color:var(--accent);">
                                </div>
                            </div>

                            <!-- Verso Text Customizer Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:8px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-scroll"></i> História & Bio (Verso)
                                </label>
                                <textarea id="tool-bio-input" class="legacy-textarea" style="height:120px; font-size:0.75rem; line-height:1.4; padding:10px; background:rgba(0,0,0,0.3);" placeholder="Escreva a biografia ou os traços do herói aqui..." data-action="updateBio">${e.bio||((d=e.roleplay)==null?void 0:d.traits)||""}</textarea>
                            </div>

                            <!-- Card Back Icon (Logo) Customizer Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:12px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-dice"></i> Ícone do Verso (Logo)
                                </label>
                                
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; background:rgba(0,0,0,0.3); padding:3px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                                    <button type="button" class="btn btn-sm ${e.cardIconType!=="image"?"btn-primary":"btn-ghost"}" style="font-size:0.65rem; padding:4px;" data-action="toggleIconType" data-type="emoji">EMOJI / SÍMBOLO</button>
                                    <button type="button" class="btn btn-sm ${e.cardIconType==="image"?"btn-primary":"btn-ghost"}" style="font-size:0.65rem; padding:4px;" data-action="toggleIconType" data-type="image">IMAGEM UPLOAD</button>
                                </div>

                                ${e.cardIconType==="image"?`
                                    <button class="btn btn-ghost btn-sm btn-block" data-action="triggerCardIconUpload" style="border:1px dashed var(--accent); padding:8px; font-size:0.7rem; font-weight:800;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> ${e.cardIconImage?"ALTERAR ÍCONE":"SUBIR ÍCONE PNG/SVG"}
                                    </button>
                                    <input type="file" id="tool-cardicon-input" style="display:none;" accept="image/*">
                                    ${e.cardIconImage?`
                                        <div style="display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px;">
                                            <img src="${e.cardIconImage}" style="width:40px; height:40px; object-fit:contain;">
                                        </div>
                                    `:""}
                                `:`
                                    <div style="display:flex; gap:10px;">
                                        <input type="text" id="tool-emoji-input" class="legacy-input" style="width:50px; text-align:center; font-size:1.2rem; padding:5px; background:rgba(0,0,0,0.3) !important;" value="${e.cardIconEmoji||"🎲"}" data-action="changeEmojiInput">
                                        <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:5px; flex:1;">
                                            ${["🎲","⚔️","🛡️","🔮","💀","🐉","🏹","🌿","🪙","🧪"].map(l=>`
                                                <button type="button" class="btn btn-ghost" style="padding:4px; font-size:1rem; border:1px solid rgba(255,255,255,0.05); background:${(e.cardIconEmoji||"🎲")===l?"rgba(197, 160, 89, 0.2)":"transparent"};" data-action="selectQuickEmoji" data-emoji="${l}">${l}</button>
                                            `).join("")}
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `:`
                    <div class="card empty-state" style="height:40vh; border:2px dashed rgba(255,255,255,0.1); border-radius:15px;">
                        <i class="fa-solid fa-wand-magic-sparkles fa-3x" style="opacity:0.3; margin-bottom:20px; color:var(--accent);"></i>
                        <p style="font-family:'Cinzel'; font-size:1.2rem; color:var(--text-dim);">Selecione um herói acima para invocar as suas cartas.</p>
                    </div>
                `}
            </div>
        `}onMount(){if(this._selectedHeroId){this._drawCards();const i=this.$("#tool-portrait-input");i&&(i.onchange=r=>{const t=r.target.files[0];if(t){const a=new FileReader;a.onload=async o=>{const s=o.target.result,n=await this._compressImage(s),d=`portrait_${Date.now()}_${t.name}`,l=await y.uploadImage(d,n);p.store.update(c=>{const x=c.players.findIndex(f=>f.id===this._selectedHeroId);x!==-1&&(c.players[x].portraitData=l)}),this.render()},a.readAsDataURL(t)}});const e=this.$("#tool-cardicon-input");e&&(e.onchange=r=>{const t=r.target.files[0];if(t){const a=new FileReader;a.onload=async o=>{const s=o.target.result,n=await this._compressImage(s),d=`icon_${Date.now()}_${t.name}`,l=await y.uploadImage(d,n);p.store.update(c=>{const x=c.players.findIndex(f=>f.id===this._selectedHeroId);x!==-1&&(c.players[x].cardIconImage=l,c.players[x].cardIconType="image")}),this.render()},a.readAsDataURL(t)}})}}selectHero(i,e){this._selectedHeroId=e.value,this.render()}triggerPortrait(){const i=this.$("#tool-portrait-input");i&&i.click()}updatePortrait(i,e){const r=e.dataset.key,t=parseFloat(e.value),a=this.$(`#label-${r}`);a&&(a.textContent=r==="scale"?`${t.toFixed(2)}x`:`${t}px`),p.store.update(o=>{const s=o.players.findIndex(n=>n.id===this._selectedHeroId);s!==-1&&(o.players[s].portraitSettings||(o.players[s].portraitSettings={x:0,y:0,scale:1}),o.players[s].portraitSettings[r]=t)}),clearTimeout(this._redrawTimer),this._redrawTimer=setTimeout(()=>{this._drawCards()},50)}resetPortrait(){p.store.update(i=>{const e=i.players.findIndex(r=>r.id===this._selectedHeroId);e!==-1&&(i.players[e].portraitSettings={x:0,y:0,scale:1})}),this.render()}updateBio(i,e){const r=e.value;p.store.update(t=>{const a=t.players.findIndex(o=>o.id===this._selectedHeroId);a!==-1&&(t.players[a].bio=r,t.players[a].roleplay||(t.players[a].roleplay={}),t.players[a].roleplay.traits=r)}),clearTimeout(this._redrawTimer),this._redrawTimer=setTimeout(()=>{this._drawCards()},150)}toggleIconType(i,e){const r=e.dataset.type;p.store.update(t=>{const a=t.players.findIndex(o=>o.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconType=r)}),this.render()}triggerCardIconUpload(){const i=this.$("#tool-cardicon-input");i&&i.click()}changeEmojiInput(i,e){const r=e.value||"🎲";p.store.update(t=>{const a=t.players.findIndex(o=>o.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconEmoji=r)}),this._drawCards()}selectQuickEmoji(i,e){const r=e.dataset.emoji;p.store.update(t=>{const a=t.players.findIndex(o=>o.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconEmoji=r)}),this.render()}_drawCards(){var o;const{players:i}=this.store.state,e=i==null?void 0:i.find(s=>s.id===this._selectedHeroId);if(!e)return;const r={...e,bio:e.bio||((o=e.roleplay)==null?void 0:o.traits)||"Nenhuma história registrada para esta lenda."},t=this.$("#tool-card-front"),a=this.$("#tool-card-back");t&&m.renderFront(r,t),a&&m.renderBack(r,a)}async downloadCard(i,e){var o;const r=e.dataset.side,{players:t}=this.store.state,a=t==null?void 0:t.find(s=>s.id===this._selectedHeroId);if(!a){g.show("❌ Personagem não encontrado para exportação.","danger");return}g.show("🔮 Preparando imagem em alta resolução...");try{const s={...a,bio:a.bio||((o=a.roleplay)==null?void 0:o.traits)||"Nenhuma história registrada para esta lenda."},n=document.createElement("canvas");r==="front"?await m.renderFront(s,n,{scale:4}):await m.renderBack(s,n,{scale:4});const d=a.name.toLowerCase().replace(/\s+/g,"_");m.download(n,`${d}_card_${r}.png`),g.show(`📥 Carta (${r}) baixada com sucesso!`)}catch(s){console.error("Erro ao baixar carta:",s),g.show("❌ Erro ao exportar carta.","danger")}}async downloadPrintablePair(){var r;const{players:i}=this.store.state,e=i==null?void 0:i.find(t=>t.id===this._selectedHeroId);if(!e){g.show("❌ Personagem não encontrado para exportação.","danger");return}g.show("🔮 Preparando par imprimível em alta resolução...");try{const t={...e,bio:e.bio||((r=e.roleplay)==null?void 0:r.traits)||"Nenhuma história registrada para esta lenda."},a=document.createElement("canvas"),o=document.createElement("canvas");await m.renderFront(t,a,{scale:4}),await m.renderBack(t,o,{scale:4});const s=a.toDataURL("image/png"),n=o.toDataURL("image/png"),d=e.name.toLowerCase().replace(/\s+/g,"_");await b(s,n,{filename:`${d}_card_print_pair.png`,printWidthCm:7,printHeightCm:9.8}),g.show("✅ Par imprimível (5:7) baixado com sucesso!")}catch(t){console.error("Erro ao exportar par imprimível:",t),g.show("❌ Erro ao exportar par imprimível.","danger")}}_compressImage(i,e=400,r=400,t=.75){return new Promise(a=>{const o=new Image;o.onload=()=>{const s=document.createElement("canvas");let n=o.width,d=o.height;n>d?n>e&&(d=Math.round(d*e/n),n=e):d>r&&(n=Math.round(n*r/d),d=r),s.width=n,s.height=d,s.getContext("2d").drawImage(o,0,0,n,d);const c=s.toDataURL("image/webp",t);a(c)},o.onerror=()=>a(i),o.src=i})}onUnmount(){this._redrawTimer&&(clearTimeout(this._redrawTimer),this._redrawTimer=null)}}export{P as CardGenerator};
