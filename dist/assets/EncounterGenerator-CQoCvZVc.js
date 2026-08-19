import{R as l}from"./ReactiveComponent-I2rnF6vN.js";import{m as a}from"./main-Dh89y2UZ.js";import{T as c}from"./BattleManager-2t4w_Qpj.js";import{M as n}from"./Bestiary-BCrui9b3.js";import{Toast as p}from"./Toast-m0Ci56ke.js";import"./Boot-B2dG6x9f.js";import"./jsxRuntime.module-BN06QUIv.js";import"./FXEngine-BD9eU4lT.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./MonsterArt-3kughPIq.js";class z extends l{constructor(t){super(t),this._difficulty="medium",this._generatedMonsters=[],this._partyLevel=this._calculatePartyLevel()}_calculatePartyLevel(){const t=this.store.state.players||[];if(t.length===0)return 1;const e=t.reduce((i,s)=>i+(parseInt(s.level)||1),0);return Math.max(1,Math.round(e/t.length))}_generateEncounter(){let t=this._partyLevel;this._difficulty==="easy"&&(t=Math.max(1,this._partyLevel-1)),this._difficulty==="hard"&&(t=this._partyLevel+1),this._difficulty==="deadly"&&(t=this._partyLevel+3),t=Math.min(20,t);const e=`Nível ${t}`,i=n[e]||n["Nível 1"];if(!i||i.length===0){p.show("Nenhum monstro encontrado para esta dificuldade.","error");return}const s=Math.max(1,(this.store.state.players||[]).length),o=this._difficulty==="deadly"?1:Math.max(1,Math.floor(Math.random()*s)+1);this._generatedMonsters=[];for(let r=0;r<o;r++){const d=i[Math.floor(Math.random()*i.length)];this._generatedMonsters.push(structuredClone(d))}this.render()}setDifficulty(t,e){this._difficulty=e.dataset.diff,this._generateEncounter()}dispatchEncounter(){if(this._generatedMonsters.length===0)return;let t=0;this._generatedMonsters.forEach(e=>{const i={id:"gen-"+Date.now()+"-"+Math.random(),name:e.name,hp_max:e.hp,hp:e.hp,ac:e.ac||10,emoji:e.emoji||"👹",size:e.size||"medium",speed:e.speed||"30 ft.",type:e.type||"monster",img:e.img||""};setTimeout(()=>{c.events.emit("MONSTER_INVOKED",i)},t*150),t++}),setTimeout(()=>this.close(),t*150+200)}close(){this.unmount(),this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element)}template(){return a`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); max-height:90vh; overflow-y:auto; background:rgba(15,12,16,0.95);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:15px; margin-bottom:20px;">
                        <div>
                            <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.5rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> Gerador de Encontros</h2>
                            <span style="font-size:0.75rem; color:var(--text-dim);">Nível Médio do Grupo: ${this._partyLevel}</span>
                        </div>
                        <button class="btn btn-ghost" onClick=${()=>this.close()} style="border-radius:50%; width:36px; height:36px; padding:0;"><i class="fa-solid fa-times"></i></button>
                    </div>

                    <div style="display:flex; gap:10px; margin-bottom:25px;">
                        <button class="btn ${this._difficulty==="easy"?"btn-primary":"btn-ghost"}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="easy">Fácil</button>
                        <button class="btn ${this._difficulty==="medium"?"btn-primary":"btn-ghost"}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="medium">Médio</button>
                        <button class="btn ${this._difficulty==="hard"?"btn-primary":"btn-ghost"}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="hard">Difícil</button>
                        <button class="btn ${this._difficulty==="deadly"?"btn-primary":"btn-ghost"}" style="flex:1; font-size:0.8rem; padding:8px; background:${this._difficulty==="deadly"?"var(--danger)":""}" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="deadly">Mortal</button>
                    </div>

                    ${this._generatedMonsters.length>0?a`
                        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:15px; margin-bottom:20px; min-height:150px;">
                            <h4 style="margin:0 0 10px 0; color:var(--text-dim); font-size:0.8rem; text-transform:uppercase;">Inimigos Sorteados:</h4>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${this._generatedMonsters.map(t=>a`
                                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:10px 15px; border-radius:8px; border-left:3px solid var(--accent);">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <span style="font-size:1.5rem;">${t.emoji}</span>
                                            <strong style="color:#fff;">${t.name}</strong>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:0.75rem; color:var(--text-dim);">HP ${t.hp} | CA ${t.ac}</div>
                                            <div style="font-size:0.7rem; color:var(--danger);">${t.damage} dmg</div>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                        <button class="btn btn-premium btn-block" style="padding:15px; font-size:1.1rem; font-family:'Cinzel';" onClick=${()=>this.dispatchEncounter()}>
                            <i class="fa-solid fa-swords"></i> Despachar para o Combate
                        </button>
                    `:a`
                        <div style="text-align:center; padding:40px 20px; color:var(--text-dim);">
                            <i class="fa-solid fa-dice-d20" style="font-size:2.5rem; opacity:0.5; margin-bottom:15px;"></i>
                            <p style="margin:0; font-size:0.9rem;">Selecione uma dificuldade acima para sortear os inimigos.</p>
                        </div>
                    `}
                </div>
            </div>
        `}}export{z as EncounterGenerator};
