import{R as d}from"./ReactiveComponent-et3s7fk-.js";import{m as i}from"./main-BrOk6ySq.js";import{T as c}from"./BattleManager-CjydHzBy.js";import{M as o}from"./Bestiary-mdtWCma-.js";import{Toast as f}from"./Toast-m0Ci56ke.js";import"./Boot-DMC3Yg8D.js";import"./jsxRuntime.module-OTOYocg5.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./MonsterArt-3kughPIq.js";class M extends d{constructor(t){super(t),this._difficulty="medium",this._generatedMonsters=[],this._partyLevel=this._calculatePartyLevel()}_calculatePartyLevel(){const t=this.store.state.players||[];if(t.length===0)return 1;const e=t.reduce((s,a)=>s+(parseInt(a.level)||1),0);return Math.max(1,Math.round(e/t.length))}_generateEncounter(){let t=this._partyLevel;this._difficulty==="easy"&&(t=Math.max(1,this._partyLevel-1)),this._difficulty==="hard"&&(t=this._partyLevel+1),this._difficulty==="deadly"&&(t=this._partyLevel+3),t=Math.min(20,t);const e=`Nível ${t}`,s=o[e]||o["Nível 1"];if(!s||s.length===0){f.show("Nenhum monstro encontrado para esta dificuldade.","error");return}const a=Math.max(1,(this.store.state.players||[]).length),n=this._difficulty==="deadly"?1:Math.max(1,Math.floor(Math.random()*a)+1);this._generatedMonsters=[];for(let r=0;r<n;r++){const l=s[Math.floor(Math.random()*s.length)];this._generatedMonsters.push(structuredClone(l))}this.render()}setDifficulty(t,e){this._difficulty=e.dataset.diff,this._generateEncounter()}dispatchEncounter(){if(this._generatedMonsters.length===0)return;let t=0;this._generatedMonsters.forEach(e=>{const s={id:"gen-"+Date.now()+"-"+Math.random(),name:e.name,hp_max:e.hp,hp:e.hp,ac:e.ac||10,emoji:e.emoji||"👹",size:e.size||"medium",speed:e.speed||"30 ft.",type:e.type||"monster",img:e.img||""};setTimeout(()=>{c.events.emit("MONSTER_INVOKED",s)},t*150),t++}),setTimeout(()=>this.close(),t*150+200)}close(){this.unmount(),this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element)}template(){return i`
            <div class="fixed inset-0 bg-black/85 z-[99999] flex items-center justify-center backdrop-blur-md animate-fadeIn p-4">
                <div class="card glass-accent w-full max-w-lg p-8 border border-accent/30 rounded-2xl max-h-[90vh] overflow-y-auto bg-black/95 shadow-[0_0_40px_rgba(197,160,89,0.15)] relative">
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <div class="flex justify-between items-start border-b border-accent/20 pb-4 mb-6 relative z-10">
                        <div>
                            <h2 class="m-0 font-cinzel text-accent text-2xl flex items-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Gerador de Encontros
                            </h2>
                            <span class="text-xs text-slate-400 uppercase tracking-widest font-bold mt-2 block">Nível Médio do Grupo: ${this._partyLevel}</span>
                        </div>
                        <button class="btn btn-ghost w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white" onClick=${()=>this.close()}>
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <div class="flex gap-3 mb-8 relative z-10">
                        <button class="btn ${this._difficulty==="easy"?"btn-primary":"btn-ghost"} flex-1 text-sm py-2 rounded-lg font-bold transition-all" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="easy">Fácil</button>
                        <button class="btn ${this._difficulty==="medium"?"btn-primary":"btn-ghost"} flex-1 text-sm py-2 rounded-lg font-bold transition-all" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="medium">Médio</button>
                        <button class="btn ${this._difficulty==="hard"?"btn-primary":"btn-ghost"} flex-1 text-sm py-2 rounded-lg font-bold transition-all" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="hard">Difícil</button>
                        <button class="btn ${this._difficulty==="deadly"?"bg-red-900/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/50":"btn-ghost"} flex-1 text-sm py-2 rounded-lg font-bold transition-all" onClick=${t=>this.setDifficulty(t,t.currentTarget)} data-diff="deadly">Mortal</button>
                    </div>

                    ${this._generatedMonsters.length>0?i`
                        <div class="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 min-h-[150px] relative z-10 shadow-inner">
                            <h4 class="m-0 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Inimigos Sorteados:</h4>
                            <div class="flex flex-col gap-3">
                                ${this._generatedMonsters.map(t=>i`
                                    <div class="flex justify-between items-center bg-black/60 p-3 rounded-lg border-l-4 border-l-accent border-y border-r border-white/5 shadow-md hover:bg-black/80 transition-colors">
                                        <div class="flex items-center gap-4">
                                            <span class="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">${t.emoji}</span>
                                            <strong class="text-white text-lg font-cinzel">${t.name}</strong>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-xs text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded mb-1">HP ${t.hp} | CA ${t.ac}</div>
                                            <div class="text-xs text-red-400 font-extrabold flex items-center justify-end gap-1"><i class="fa-solid fa-droplet"></i> ${t.damage} dmg</div>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                        <button class="btn btn-primary w-full p-4 text-lg font-cinzel tracking-[2px] shadow-[0_0_20px_rgba(197,160,89,0.3)] relative z-10" onClick=${()=>this.dispatchEncounter()}>
                            <i class="fa-solid fa-swords mr-2"></i> INICIAR COMBATE
                        </button>
                    `:i`
                        <div class="text-center py-12 px-6 text-slate-400 relative z-10">
                            <i class="fa-solid fa-dice-d20 text-5xl opacity-20 mb-4"></i>
                            <p class="m-0 text-sm font-outfit">Selecione uma dificuldade acima para sortear os inimigos e preparar o campo de batalha.</p>
                        </div>
                    `}
                </div>
            </div>
        `}}export{M as EncounterGenerator};
