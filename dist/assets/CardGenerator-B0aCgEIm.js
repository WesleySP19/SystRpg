import{C as g}from"./Boot-DMC3Yg8D.js";import{T as p}from"./BattleManager-CjydHzBy.js";import{C as b}from"./CardRenderer-CTgGsrRT.js";import{Toast as m}from"./Toast-m0Ci56ke.js";import{e as h}from"./imageExport-Ck9NIU6v.js";import{P as u}from"./jsxRuntime.module-OTOYocg5.js";import"./main-BrOk6ySq.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class P extends g{constructor(r){super(r),this._selectedHeroId=null,this._redrawTimer=null}template(){var o,t,a,s,i,n,c;const{players:r}=this.store.state,e=r==null?void 0:r.find(d=>d.id===this._selectedHeroId);return`
            <div class="page p-6 w-full max-w-[1400px] mx-auto animate-fadeIn relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div class="section-header border-b border-white/10 pb-6 mb-8 relative z-10">
                    <h2 class="font-cinzel text-3xl font-bold m-0 text-white flex items-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]"><i class="fa-solid fa-address-card text-accent"></i> Gerador de Cartas de Heróis</h2>
                    <p class="font-outfit text-sm text-slate-400 mt-2 uppercase tracking-widest">Gere os cards físicos de frente e verso baseados nos status em tempo real</p>
                </div>

                <div class="flex gap-5 mb-8 bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl relative z-10">
                    <div class="flex-1">
                        <label class="text-[0.8rem] font-bold text-accent tracking-widest uppercase mb-2 block">Selecione a Lenda:</label>
                        <select class="legacy-input w-full text-lg mt-2 p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:border-accent outline-none transition-colors" data-action="selectHero">
                            <option value="" class="bg-black text-white">-- Escolha um Herói --</option>
                            ${r?r.map(d=>`<option value="${d.id}" class="bg-black text-white" ${this._selectedHeroId===d.id?"selected":""}>${d.name} (Nv. ${d.level||1})</option>`).join(""):""}
                        </select>
                    </div>
                </div>

                ${e?`
                    <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start w-full relative z-10">
                        
                        <!-- LEFT PANEL: CANVAS PREVIEWS -->
                        <div class="flex flex-col items-center gap-5 p-8 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                            <p class="text-slate-400 text-sm text-center m-0 flex items-center justify-center gap-2">
                                <i class="fa-solid fa-circle-info text-accent"></i> Clique em qualquer uma das cartas abaixo para fazer o download em alta resolução (PNG de 300 DPI).
                            </p>
                            
                            <div class="flex gap-8 justify-center flex-wrap mt-5 w-full">
                                <div class="flex flex-col items-center gap-3">
                                    <h4 class="m-0 font-cinzel text-accent font-bold tracking-widest text-sm">FRENTE (COMBATE)</h4>
                                    <canvas id="tool-card-front" data-action="downloadCard" data-side="front" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(197,160,89,0.1)] max-w-full h-auto cursor-pointer border border-accent/30 hover:scale-105 transition-transform duration-300"></canvas>
                                </div>
                                <div class="flex flex-col items-center gap-3">
                                    <h4 class="m-0 font-cinzel text-accent font-bold tracking-widest text-sm">VERSO (HISTÓRIA)</h4>
                                    <canvas id="tool-card-back" data-action="downloadCard" data-side="back" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(197,160,89,0.1)] max-w-full h-auto cursor-pointer border border-accent/30 hover:scale-105 transition-transform duration-300"></canvas>
                                </div>
                            </div>
                            
                            <div class="mt-4 w-full flex justify-center">
                                <button class="btn btn-primary py-3 px-8 text-sm font-cinzel tracking-widest shadow-[0_0_12px_rgba(197,160,89,0.5)] font-bold rounded-xl flex items-center justify-center gap-2" data-action="downloadPrintablePair">
                                    <i class="fa-solid fa-file-image"></i> BAIXAR PAR IMPRIMÍVEL LADO A LADO (5:7)
                                </button>
                            </div>
                        </div>

                        <!-- RIGHT PANEL: PREMIUM CARD CUSTOMIZER -->
                        <div class="card glass-accent p-6 flex flex-col gap-5 border border-accent/30 rounded-2xl sticky top-5 bg-black/60 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                            <h3 class="m-0 font-cinzel text-accent flex items-center gap-3 border-b border-white/10 pb-3 font-black tracking-widest text-lg">
                                <i class="fa-solid fa-sliders"></i> AJUSTES DO CARD
                            </h3>
                            
                            <!-- Portrait Image Section -->
                            <!-- Portrait Image Section -->
                            <div class="flex flex-col gap-2.5">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-image"></i> Imagem de Retrato
                                </label>
                                <button class="btn btn-ghost btn-sm w-full border border-dashed border-accent/50 p-2.5 text-xs font-bold hover:bg-accent/10" data-action="triggerPortrait">
                                    <i class="fa-solid fa-upload mr-1.5"></i> MUDAR ARQUIVO DE FOTO
                                </button>
                                <input type="file" id="tool-portrait-input" class="hidden" accept="image/*">
                            </div>

                            <!-- Sliders Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-4">
                                <div class="flex justify-between items-center">
                                    <label class="text-[0.75rem] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                                        <i class="fa-solid fa-up-down-left-right"></i> Enquadramento
                                    </label>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 border border-white/20 font-bold rounded hover:bg-white/10" data-action="resetPortrait">
                                        CENTRALIZAR
                                    </button>
                                </div>
                                
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">ZOOM (ESCALA)</span>
                                        <span id="label-scale" class="text-accent">${(((o=e.portraitSettings)==null?void 0:o.scale)||1).toFixed(2)}x</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="0.5" max="3" step="0.05" value="${((t=e.portraitSettings)==null?void 0:t.scale)||1}" data-action="updatePortrait" data-key="scale">
                                </div>

                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">DESLOCAMENTO X</span>
                                        <span id="label-x" class="text-accent">${((a=e.portraitSettings)==null?void 0:a.x)||0}px</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="-250" max="250" step="1" value="${((s=e.portraitSettings)==null?void 0:s.x)||0}" data-action="updatePortrait" data-key="x">
                                </div>

                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">DESLOCAMENTO Y</span>
                                        <span id="label-y" class="text-accent">${((i=e.portraitSettings)==null?void 0:i.y)||0}px</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="-250" max="250" step="1" value="${((n=e.portraitSettings)==null?void 0:n.y)||0}" data-action="updatePortrait" data-key="y">
                                </div>
                            </div>

                            <!-- Verso Text Customizer Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-2">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-scroll"></i> História & Bio (Verso)
                                </label>
                                <textarea id="tool-bio-input" class="legacy-textarea h-[120px] text-xs leading-relaxed p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-accent resize-none text-slate-300" placeholder="Escreva a biografia ou os traços do herói aqui..." data-action="updateBio">${e.bio||((c=e.roleplay)==null?void 0:c.traits)||""}</textarea>
                            </div>

                            <!-- Card Back Icon (Logo) Customizer Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-3">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-dice"></i> Ícone do Verso (Logo)
                                </label>
                                
                                <div class="grid grid-cols-2 gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                                    <button type="button" class="btn btn-sm ${e.cardIconType!=="image"?"bg-accent/20 text-accent font-bold":"btn-ghost text-slate-400"} text-[0.65rem] py-1 rounded" data-action="toggleIconType" data-type="emoji">EMOJI / SÍMBOLO</button>
                                    <button type="button" class="btn btn-sm ${e.cardIconType==="image"?"bg-accent/20 text-accent font-bold":"btn-ghost text-slate-400"} text-[0.65rem] py-1 rounded" data-action="toggleIconType" data-type="image">IMAGEM UPLOAD</button>
                                </div>

                                ${e.cardIconType==="image"?`
                                    <button class="btn btn-ghost btn-sm w-full border border-dashed border-accent/50 p-2 text-xs font-bold hover:bg-accent/10" data-action="triggerCardIconUpload">
                                        <i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> ${e.cardIconImage?"ALTERAR ÍCONE":"SUBIR ÍCONE PNG/SVG"}
                                    </button>
                                    <input type="file" id="tool-cardicon-input" class="hidden" accept="image/*">
                                    ${e.cardIconImage?`
                                        <div class="flex justify-center items-center bg-black/20 p-2.5 rounded-lg border border-white/5 mt-1">
                                            <img src="${e.cardIconImage}" class="w-10 h-10 object-contain">
                                        </div>
                                    `:""}
                                `:`
                                    <div class="flex gap-2.5 mt-1">
                                        <input type="text" id="tool-emoji-input" class="legacy-input w-12 text-center text-xl p-1 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-accent" value="${e.cardIconEmoji||"🎲"}" data-action="changeEmojiInput">
                                        <div class="grid grid-cols-5 gap-1.5 flex-1">
                                            ${["🎲","⚔️","🛡️","🔮","💀","🐉","🏹","🌿","🪙","🧪"].map(d=>`
                                                <button type="button" class="btn btn-ghost p-1 text-lg border border-white/5 rounded-lg hover:border-accent/50 hover:bg-white/5 transition-colors" style="background:${(e.cardIconEmoji||"🎲")===d?"rgba(197, 160, 89, 0.2)":"transparent"};" data-action="selectQuickEmoji" data-emoji="${d}">${d}</button>
                                            `).join("")}
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `:`
                    <div class="card empty-state h-[40vh] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-black/20 relative z-10">
                        <i class="fa-solid fa-wand-magic-sparkles text-5xl opacity-30 mb-5 text-accent"></i>
                        <p class="font-cinzel text-xl text-slate-400">Selecione um herói acima para invocar as suas cartas.</p>
                    </div>
                `}
            </div>
        `}onMount(){if(this._selectedHeroId){this._drawCards();const r=this.$("#tool-portrait-input");r&&(r.onchange=o=>{const t=o.target.files[0];if(t){const a=new FileReader;a.onload=async s=>{const i=s.target.result,n=await this._compressImage(i),c=`portrait_${Date.now()}_${t.name}`,d=await u.uploadImage(c,n);p.store.update(l=>{const f=l.players.findIndex(x=>x.id===this._selectedHeroId);f!==-1&&(l.players[f].portraitData=d)}),this.render()},a.readAsDataURL(t)}});const e=this.$("#tool-cardicon-input");e&&(e.onchange=o=>{const t=o.target.files[0];if(t){const a=new FileReader;a.onload=async s=>{const i=s.target.result,n=await this._compressImage(i),c=`icon_${Date.now()}_${t.name}`,d=await u.uploadImage(c,n);p.store.update(l=>{const f=l.players.findIndex(x=>x.id===this._selectedHeroId);f!==-1&&(l.players[f].cardIconImage=d,l.players[f].cardIconType="image")}),this.render()},a.readAsDataURL(t)}})}}selectHero(r,e){this._selectedHeroId=e.value,this.render()}triggerPortrait(){const r=this.$("#tool-portrait-input");r&&r.click()}updatePortrait(r,e){const o=e.dataset.key,t=parseFloat(e.value),a=this.$(`#label-${o}`);a&&(a.textContent=o==="scale"?`${t.toFixed(2)}x`:`${t}px`),p.store.update(s=>{const i=s.players.findIndex(n=>n.id===this._selectedHeroId);i!==-1&&(s.players[i].portraitSettings||(s.players[i].portraitSettings={x:0,y:0,scale:1}),s.players[i].portraitSettings[o]=t)}),clearTimeout(this._redrawTimer),this._redrawTimer=setTimeout(()=>{this._drawCards()},50)}resetPortrait(){p.store.update(r=>{const e=r.players.findIndex(o=>o.id===this._selectedHeroId);e!==-1&&(r.players[e].portraitSettings={x:0,y:0,scale:1})}),this.render()}updateBio(r,e){const o=e.value;p.store.update(t=>{const a=t.players.findIndex(s=>s.id===this._selectedHeroId);a!==-1&&(t.players[a].bio=o,t.players[a].roleplay||(t.players[a].roleplay={}),t.players[a].roleplay.traits=o)}),clearTimeout(this._redrawTimer),this._redrawTimer=setTimeout(()=>{this._drawCards()},150)}toggleIconType(r,e){const o=e.dataset.type;p.store.update(t=>{const a=t.players.findIndex(s=>s.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconType=o)}),this.render()}triggerCardIconUpload(){const r=this.$("#tool-cardicon-input");r&&r.click()}changeEmojiInput(r,e){const o=e.value||"🎲";p.store.update(t=>{const a=t.players.findIndex(s=>s.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconEmoji=o)}),this._drawCards()}selectQuickEmoji(r,e){const o=e.dataset.emoji;p.store.update(t=>{const a=t.players.findIndex(s=>s.id===this._selectedHeroId);a!==-1&&(t.players[a].cardIconEmoji=o)}),this.render()}_drawCards(){var s;const{players:r}=this.store.state,e=r==null?void 0:r.find(i=>i.id===this._selectedHeroId);if(!e)return;const o={...e,bio:e.bio||((s=e.roleplay)==null?void 0:s.traits)||"Nenhuma história registrada para esta lenda."},t=this.$("#tool-card-front"),a=this.$("#tool-card-back");t&&b.renderFront(o,t),a&&b.renderBack(o,a)}async downloadCard(r,e){var s;const o=e.dataset.side,{players:t}=this.store.state,a=t==null?void 0:t.find(i=>i.id===this._selectedHeroId);if(!a){m.show("❌ Personagem não encontrado para exportação.","danger");return}m.show("🔮 Preparando imagem em alta resolução...");try{const i={...a,bio:a.bio||((s=a.roleplay)==null?void 0:s.traits)||"Nenhuma história registrada para esta lenda."},n=document.createElement("canvas");o==="front"?await b.renderFront(i,n,{scale:4}):await b.renderBack(i,n,{scale:4});const c=a.name.toLowerCase().replace(/\s+/g,"_");b.download(n,`${c}_card_${o}.png`),m.show(`📥 Carta (${o}) baixada com sucesso!`)}catch(i){console.error("Erro ao baixar carta:",i),m.show("❌ Erro ao exportar carta.","danger")}}async downloadPrintablePair(){var o;const{players:r}=this.store.state,e=r==null?void 0:r.find(t=>t.id===this._selectedHeroId);if(!e){m.show("❌ Personagem não encontrado para exportação.","danger");return}m.show("🔮 Preparando par imprimível em alta resolução...");try{const t={...e,bio:e.bio||((o=e.roleplay)==null?void 0:o.traits)||"Nenhuma história registrada para esta lenda."},a=document.createElement("canvas"),s=document.createElement("canvas");await b.renderFront(t,a,{scale:4}),await b.renderBack(t,s,{scale:4});const i=a.toDataURL("image/png"),n=s.toDataURL("image/png"),c=e.name.toLowerCase().replace(/\s+/g,"_");await h(i,n,{filename:`${c}_card_print_pair.png`,printWidthCm:7,printHeightCm:9.8}),m.show("✅ Par imprimível (5:7) baixado com sucesso!")}catch(t){console.error("Erro ao exportar par imprimível:",t),m.show("❌ Erro ao exportar par imprimível.","danger")}}_compressImage(r,e=400,o=400,t=.75){return new Promise(a=>{const s=new Image;s.onload=()=>{const i=document.createElement("canvas");let n=s.width,c=s.height;n>c?n>e&&(c=Math.round(c*e/n),n=e):c>o&&(n=Math.round(n*o/c),c=o),i.width=n,i.height=c,i.getContext("2d").drawImage(s,0,0,n,c);const l=i.toDataURL("image/webp",t);a(l)},s.onerror=()=>a(r),s.src=r})}onUnmount(){this._redrawTimer&&(clearTimeout(this._redrawTimer),this._redrawTimer=null)}}export{P as CardGenerator};
