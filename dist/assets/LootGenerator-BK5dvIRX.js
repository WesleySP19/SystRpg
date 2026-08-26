var y=Object.defineProperty;var v=(g,p,e)=>p in g?y(g,p,{enumerable:!0,configurable:!0,writable:!0,value:e}):g[p]=e;var l=(g,p,e)=>v(g,typeof p!="symbol"?p+"":p,e);import{R as $}from"./ReactiveComponent-DxMwUypL.js";import{y as u,D as b,T as x}from"./BattleManager-CjydHzBy.js";import{Toast as h}from"./Toast-m0Ci56ke.js";import{m as d}from"./main-Bk3T2ZrR.js";import"./Boot-CGoZOUiq.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class T extends ${constructor(e){super(e);l(this,"close",()=>{this.element&&this.element.parentNode&&this.element.parentNode.parentNode&&this.element.parentNode.parentNode.removeChild(this.element.parentNode),this.unmount()});l(this,"setTier",e=>{this.selectedTier.value=e});l(this,"rollLoot",()=>{x.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3");const e=b.roll("1d100").total,i=this.selectedTier.value,r=this._tables[i].find(t=>e>=t.range[0]&&e<=t.range[1]);if(r){const t=r.dice.split("*");let o=b.roll(t[0]).total;t[1]&&(o*=parseInt(t[1]));const c=this._rollArmadinhas(i);this.result.value={roll:e,total:o,coin:r.coin,items:c}}});l(this,"copyLoot",()=>{if(!this.result.value)return;const e=`💰 Saque: ${this.result.value.total} ${this.result.value.coin}`;navigator.clipboard.writeText(e),h.show("Copiado para a área de transferência!")});l(this,"clearResult",()=>{this.result.value=null});l(this,"openDistribute",()=>{this.selectedPlayers.value=(this.store.state.players||[]).map(e=>e.id),this.splitMode.value="equal",this.customAmounts.value={},this.showDistribute.value=!0});l(this,"closeDistribute",()=>{this.showDistribute.value=!1});l(this,"togglePlayerSelection",e=>{this.selectedPlayers.value.includes(e)?this.selectedPlayers.value=this.selectedPlayers.value.filter(i=>i!==e):this.selectedPlayers.value=[...this.selectedPlayers.value,e],this.splitMode.value="equal"});l(this,"updateCustomAmount",(e,i)=>{this.splitMode.value="custom",this.customAmounts.value={...this.customAmounts.value,[e]:parseInt(i)||0}});l(this,"confirmDistribution",()=>{const e=this.result.value,i=this.selectedPlayers.value;if(!e||i.length===0)return;const s=e.coin.split(",")[0].trim().toLowerCase();let r=0;x.store.update(o=>{o.players.forEach(a=>{if(i.includes(a.id)){let n=0;this.splitMode.value==="equal"?n=Math.floor(e.total/i.length):n=this.customAmounts.value[a.id]||0,r+=n,a.currency||(a.currency={pp:0,gp:0,ep:0,sp:0,cp:0});const m=parseInt(a.currency[s])||0;a.currency[s]=m+n}});const c=o.players.filter(a=>i.includes(a.id)).map(a=>a.name).join(", ");o.journalEntries||(o.journalEntries=[]),o.journalEntries.push({id:Date.now(),timestamp:Date.now(),type:"loot",title:"Tesouro Distribuído",content:`O saque de ${e.total} ${s.toUpperCase()} foi dividido entre: ${c}. Foram distribuídos um total de ${r} ${s.toUpperCase()}.`})});const t=e.total-r;h.show(`💰 ${r} ${s.toUpperCase()} distribuídos para ${i.length} heróis!`),t>0?h.show(`Sobrou ${t} ${s.toUpperCase()} no baú.`,"info"):t<0&&h.show(`Aviso: Foram distribuídos ${Math.abs(t)} moedas a mais do que existia no baú.`,"warning"),this.showDistribute.value=!1,this.result.value=null});l(this,"distributeItems",()=>{const e=this.result.value,i=this.selectedPlayers.value;!e||!e.items||e.items.length===0||i.length===0||(x.store.update(s=>{s.players.forEach(t=>{if(i.includes(t.id)){t.inventory||(t.inventory=[]);const o=e.items.map(c=>({...c}));t.inventory.push(...o)}});const r=s.players.filter(t=>i.includes(t.id)).map(t=>t.name).join(", ");s.journalEntries||(s.journalEntries=[]),s.journalEntries.push({id:Date.now(),timestamp:Date.now(),type:"loot",title:"Armadinhas Distribuídas",content:`Armadinhas (${e.items.map(t=>t.name).join(", ")}) foram entregues a: ${r}.`})}),h.show(`⚔️ Armadinhas distribuídas para ${i.length} heróis!`))});this.selectedTier=u("0-4"),this.result=u(null),this.showDistribute=u(!1),this.selectedPlayers=u([]),this.splitMode=u("equal"),this.customAmounts=u({}),this._armadinhas={"0-4":[{name:"Dagger",damage:"1d4",type:"piercing"},{name:"Club",damage:"1d4",type:"bludgeoning"},{name:"Shortbow",damage:"1d6",type:"piercing"}],"5-10":[{name:"Short Sword",damage:"1d6",type:"piercing"},{name:"Handaxe",damage:"1d6",type:"slashing"},{name:"Light Crossbow",damage:"1d8",type:"piercing"}],"11-16":[{name:"Longsword",damage:"1d8",type:"slashing"},{name:"Warhammer",damage:"1d8",type:"bludgeoning"},{name:"Battleaxe",damage:"1d8",type:"slashing"}],"17+":[{name:"Greatsword",damage:"2d6",type:"slashing"},{name:"Maul",damage:"2d6",type:"bludgeoning"},{name:"Heavy Crossbow",damage:"1d10",type:"piercing"}]},this._tables={"0-4":[{range:[1,30],dice:"5d6",coin:"cp"},{range:[31,60],dice:"4d4",coin:"sp"},{range:[61,70],dice:"3d6",coin:"ep"},{range:[71,95],dice:"3d6",coin:"gp"},{range:[96,100],dice:"1d6",coin:"pp"}],"5-10":[{range:[1,30],dice:"4d6*10",coin:"cp"},{range:[31,60],dice:"3d6*10",coin:"sp"},{range:[61,70],dice:"3d6*10",coin:"ep"},{range:[71,95],dice:"4d10*10",coin:"gp"},{range:[96,100],dice:"2d6*10",coin:"gp"}],"11-16":[{range:[1,20],dice:"4d6*100",coin:"sp"},{range:[21,35],dice:"1d6*100",coin:"ep"},{range:[36,75],dice:"2d10*100",coin:"gp"},{range:[76,100],dice:"2d10*100",coin:"gp"}],"17+":[{range:[1,15],dice:"2d10*1000",coin:"ep"},{range:[16,55],dice:"1d6*1000",coin:"gp"},{range:[56,100],dice:"1d6*1000",coin:"gp"}]}}_getSuggestedTier(e){if(!(e!=null&&e.length))return"0-4";const i=Math.max(...e.map(s=>parseInt(s.cr)||0));return i<=4?"0-4":i<=10?"5-10":i<=16?"11-16":"17+"}_rollArmadinhas(e){const i=this._armadinhas[e]||[];if(!i.length)return[];const s=b.roll("1d2").total,r=[];for(let t=0;t<s;t++){const o=Math.floor(Math.random()*i.length);r.push(i[o])}return r}template(){const{monsters:e,players:i}=this.store.state,s=this._getSuggestedTier(e),r=this.selectedTier.value,t=this.result.value,o=this.showDistribute.value,c=this.selectedPlayers.value;return d`
      <div class="page p-6 w-full max-w-[1100px] mx-auto animate-fadeIn relative loot-generator">
        <div class="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="card glass-accent relative z-10" style="width:100%; padding:30px; border:1px solid rgba(197,160,89,0.2); background:rgba(15,12,16,0.6); backdrop-filter:blur(10px); border-radius:16px;">
            
            <div class="section-header" style="border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:15px; margin-bottom:25px;">
                <div>
                    <h2 class="section-title" style="margin:0; font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);">
                        <i class="fa-solid fa-coins" style="margin-right:12px;"></i> Gerador de Tesouros (Motor Preact)
                    </h2>
                    <p class="section-subtitle" style="margin:4px 0 0 0; font-size:0.8rem; color:var(--text-dim);">Tabelas do Guia do Mestre renderizadas via Virtual DOM.</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="card glass-accent" style="padding:30px; background:rgba(197,160,89,0.02); border:1px solid rgba(197,160,89,0.25); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
                        <div style="display:flex; align-items:center; gap:10px; background:rgba(197,160,89,0.06); padding:10px 15px; border-radius:30px; border:1px solid rgba(197,160,89,0.15); margin-bottom:20px; width:fit-content;">
                            <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent);"></i>
                            <span style="font-size:0.85rem; color:var(--text-main);">Sugestão da Arena: <strong style="color:var(--accent); font-family:'Cinzel';">ND ${s}</strong></span>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:25px;">
                            ${Object.keys(this._tables).map(a=>{const n=r===a;return d`
                                    <button class="btn ${n?"btn-primary":"btn-ghost"}" 
                                            style="height:auto; padding:15px; border-radius:12px; flex-direction:column; border:1px solid ${n?"transparent":"rgba(255,255,255,0.08)"}; transition:all 0.2s;"
                                            onClick=${()=>this.setTier(a)}>
                                        <span style="font-size:0.6rem; opacity:0.6; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Nível</span>
                                        <span style="font-size:1.3rem; font-weight:900; font-family:'Cinzel';">${a}</span>
                                    </button>
                                `})}
                        </div>

                        <button class="btn btn-primary btn-block" style="padding:18px; font-size:1.2rem; font-family:'Cinzel'; font-weight:700; letter-spacing:2px; border-radius:12px; box-shadow:0 0 15px rgba(197,160,89,0.3);" onClick=${this.rollLoot}>
                            <i class="fa-solid fa-dice-d20 fa-spin-hover" style="margin-right:12px;"></i> Canalizar Rolagem
                        </button>
                    </div>

                    ${t?d`
                        <div class="card glass-accent" style="padding:35px; border:2px solid var(--accent); border-radius:16px; text-align:center; animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 0 25px rgba(197,160,89,0.25);">
                            <div style="font-size:0.75rem; color:var(--accent); letter-spacing:2px; font-weight:800; text-transform:uppercase; margin-bottom:15px;">
                                <i class="fa-solid fa-gem"></i> Fortuna Desescoberta (d100: ${t.roll}) <i class="fa-solid fa-gem"></i>
                            </div>
                            <div style="display:flex; justify-content:center; gap:25px; align-items:center; margin-bottom:25px; background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                                <i class="fa-solid fa-coins" style="font-size:4rem; color:var(--accent); filter:drop-shadow(0 0 10px rgba(197,160,89,0.6));"></i>
                                <div style="text-align:left;">
                                    <div style="font-size:3.5rem; font-weight:900; color:#fff; line-height:1; font-family:'Cinzel'; text-shadow:0 2px 10px #000;">${t.total}</div>
                                    <div style="font-size:1.2rem; color:var(--accent); font-weight:900; letter-spacing:2px; margin-top:5px;">${t.coin.toUpperCase()}</div>
                                </div>
                            </div>
                            ${t.items&&t.items.length?d`
                            <div style="margin-top:10px; font-size:0.9rem; color:var(--text-main);">
                                <strong>Armadinhas Geradas:</strong>
                                <ul style="list-style:none; padding:0; margin-top:5px;">
                                    ${t.items.map(a=>d`<li>⚔️ ${a.name} (${a.damage} ${a.type})</li>`)}
                                </ul>
                            </div>`:""}
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top: 20px;">
                                <button class="btn btn-ghost" style="border-radius:10px; padding:12px;" onClick=${this.copyLoot}>
                                    <i class="fa-solid fa-copy" style="margin-right:6px;"></i> Copiar Notas
                                </button>
                                <button class="btn btn-primary" style="border-radius:10px; padding:12px; background:var(--success); border-color:var(--success); box-shadow:0 0 10px rgba(46,204,113,0.3);" onClick=${this.openDistribute}>
                                    <i class="fa-solid fa-hand-holding-dollar" style="margin-right:6px;"></i> Distribuir Saque
                                </button>
                                ${t.items&&t.items.length?d`<button class="btn btn-ghost" style="border-radius:10px; padding:12px;" onClick=${this.distributeItems}>Distribuir Itens</button>`:""}
                                <button class="btn btn-ghost" style="grid-column: span 2; border-color:rgba(255,255,255,0.1); border-radius:10px; padding:10px; font-size:0.85rem;" onClick=${this.clearResult}>
                                    <i class="fa-solid fa-trash-can" style="margin-right:6px;"></i> Limpar Câmara
                                </button>
                            </div>
                        </div>
                    `:d`
                        <div class="card glass-accent empty-state" style="height:220px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08); display:flex; flex-direction:column; justify-content:center; align-items:center; opacity:0.4;">
                            <i class="fa-solid fa-dungeon fa-3x" style="margin-bottom:15px; color:var(--accent);"></i>
                            <h4 style="font-family:'Cinzel'; margin:0;">Câmara de Tesouros Selada</h4>
                            <p style="font-size:0.8rem; margin-top:5px;">Aguardando uma rolagem d100...</p>
                        </div>
                    `}
                </div>

                <div class="card glass-accent" style="padding:0; overflow:hidden; border-radius:16px; border:1px solid rgba(197,160,89,0.15);">
                    <div class="card-header" style="background:rgba(197,160,89,0.05); padding:18px 20px; border-bottom:1px solid rgba(197,160,89,0.15); margin:0;">
                        <span class="card-title" style="font-size:0.85rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px;">📋 Sorteios (ND ${r})</span>
                    </div>
                    <div style="padding:20px;">
                        <table style="width:100%; font-size:0.8rem; border-collapse:collapse;">
                            <thead style="color:var(--accent); text-align:left; border-bottom:2px solid rgba(197,160,89,0.25);">
                                <tr>
                                    <th style="padding:10px 5px; font-family:'Cinzel';">Faixa</th>
                                    <th style="padding:10px 5px; font-family:'Cinzel'; text-align:right;">Saque</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this._tables[r].map(a=>d`
                                    <tr class="tome-hover-row" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                        <td style="padding:12px 5px; font-weight:800; color:var(--accent);">${a.range[0].toString().padStart(2,"0")}-${a.range[1].toString().padStart(2,"0")}</td>
                                        <td style="padding:12px 5px; text-align:right; font-weight:600; color:var(--text-main);">${a.dice.replace("*","x")} <span style="color:var(--accent); font-weight:800;">${a.coin.toUpperCase()}</span></td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            ${o?d`
                <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onClick=${this.closeDistribute}>
                    <div class="card glass-accent animate-scaleIn" style="max-width:480px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9);" onClick=${a=>a.stopPropagation()}>
                        <div style="text-align:center; margin-bottom:20px;">
                            <i class="fa-solid fa-hand-holding-dollar fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                            <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.8rem;">💰 Distribuir Moedas</h3>
                            <p style="font-size:0.85rem; color:var(--text-dim); margin-top:8px;">
                                Valor a dividir: <b style="color:#fff; font-size:1.1rem;">${t.total} ${t.coin.toUpperCase()}</b>
                            </p>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:260px; overflow-y:auto; padding-right:5px;">
                            ${(i||[]).map(a=>{const n=c.includes(a.id);let m=0;return this.splitMode.value==="equal"?m=c.length?Math.floor(t.total/c.length):0:m=this.customAmounts.value[a.id]||0,d`
                                    <label style="display:flex; align-items:center; gap:12px; padding:12px 15px; background:${n?"rgba(197,160,89,0.08)":"rgba(255,255,255,0.02)"}; border-radius:10px; border:1px solid ${n?"var(--accent)":"rgba(255,255,255,0.06)"}; transition:all 0.2s;">
                                        <input type="checkbox" style="width:20px; height:20px; accent-color:var(--accent); cursor:pointer;" 
                                            checked=${n}
                                            onChange=${()=>this.togglePlayerSelection(a.id)} />
                                        <div style="flex:1;">
                                            <div style="font-weight:800; font-size:0.95rem; color:#fff;">${a.name}</div>
                                            <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">${a.class||"Aventureiro"}</div>
                                        </div>
                                        ${n?d`
                                            <div style="display:flex; align-items:center; gap:5px;">
                                                <input type="number" 
                                                    class="legacy-input" 
                                                    style="width: 80px; text-align: center; font-size: 0.9rem; padding: 5px;" 
                                                    value=${m}
                                                    onInput=${f=>this.updateCustomAmount(a.id,f.target.value)}
                                                />
                                                <span style="color:var(--accent); font-weight:900; font-size:0.7rem;">${t.coin.toUpperCase()}</span>
                                            </div>
                                        `:""}
                                    </label>
                                `})}
                        </div>

                        <div style="display:flex; gap:12px;">
                            <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" onClick=${this.closeDistribute}>Cancelar</button>
                            <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" onClick=${this.confirmDistribution} disabled=${c.length===0}>
                                Confirmar Partilha
                            </button>
                        </div>
                    </div>
                </div>
            `:""}
        </div>
      </div>
    `}}export{T as LootGenerator};
