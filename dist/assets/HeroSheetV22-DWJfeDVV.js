import{m as x,u as I}from"./Boot-NkMUf4fQ.js";import{d as E,D as P}from"./FXEngine-C9GwQj6_.js";import{Toast as D}from"./Toast-m0Ci56ke.js";import"./main-B1-MC9BY.js";import"./tailwind-CVCQhc7L.js";function M(e,r=1){const a=parseInt(r)||1,i=e||0;let o=300;a===1?o=300:a===2?o=900:a===3?o=2700:a===4?o=6500:a>=5&&(o=a*2e3);let c=Math.min(i/o*100,100);return{lvl:a,currentXP:i,nextXP:o,progress:c}}function O({hero:e}){if(!e)return null;const{lvl:r,currentXP:a,nextXP:i,progress:o}=M(e.xp,e.level);return x`
        <div class="flex items-center gap-8">
            <div class="token-avatar w-[120px] h-[120px] border-[3px] border-tomeGold-muted font-cinzel text-5xl shadow-[0_0_25px_rgba(197,160,89,0.3)] bg-black/60 flex items-center justify-center">
                ${e.name.substring(0,2)}
            </div>
            
            <div class="flex-1">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h1 class="m-0 font-cinzel text-4xl text-tomeGold-muted drop-shadow-[0_0_15px_rgba(197,160,89,0.4)] leading-tight">
                            ${e.name}
                        </h1>
                        <div class="text-sm text-gray-400 uppercase tracking-widest mt-1 font-semibold">
                            ${e.race||"Humano"} <span class="text-tomeGold-muted mx-1">•</span> ${e.class||"Aventureiro"}
                        </div>
                    </div>
                </div>

                <!-- XP Bar -->
                <div class="glass px-5 py-4 rounded-xl border border-tomeGold-muted/20">
                    <div class="flex justify-between text-xs font-extrabold uppercase tracking-wider mb-2">
                        <span class="text-tomeGold-muted">Nível ${r}</span>
                        <span class="text-gray-200">${a} / ${i} XP</span>
                    </div>
                    <div class="w-full h-2 bg-black/50 rounded-md overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                        <div class="h-full bg-gradient-to-r from-tomeGold-muted to-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.8)] transition-all duration-500 ease-out" style="width:${o}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `}const $=new Map;function j({hero:e}){var m,y;if(!e||!e.id)return null;const r=e.stats||{dex:10},a=w=>Math.floor(((parseInt(w)||10)-10)/2),i=e.ac||10+a(r.dex),o=a(r.dex),c=e.speed||30,g=((m=e.hp)==null?void 0:m.current)||0,v=((y=e.hp)==null?void 0:y.max)||10,f=`${e.id}_${g}_${v}_${i}_${o}_${c}`;if($.has(f))return $.get(f);const t=x`
        <div class="card glass" style="padding:25px; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-heart-pulse text-dndRedBright"></i> Vitalidade
                </h3>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:25px;">
                <!-- HP Card -->
                <div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-radius:12px; padding:15px; text-align:center; position:relative; overflow:hidden;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">Pontos de Vida</div>
                    <div style="font-size:2rem; font-family:'Cinzel'; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(239, 68, 68, 0.4); display:flex; align-items:baseline; justify-content:center; gap:4px;">
                        ${g} <span style="font-size:1rem; color:var(--text-dim);">/ ${v}</span>
                    </div>
                </div>

                <!-- Armor Class Card -->
                <div style="background:rgba(197,160,89, 0.05); border:1px solid rgba(197,160,89, 0.2); border-radius:12px; padding:15px; text-align:center; position:relative; overflow:hidden;">
                    <i class="fa-solid fa-shield-halved" style="position:absolute; font-size:4rem; color:var(--accent); opacity:0.1; top:-5px; right:-10px; transform:rotate(15deg);"></i>
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">Classe de Armadura</div>
                    <div style="font-size:2rem; font-family:'Cinzel'; font-weight:900; color:var(--accent); text-shadow:0 0 10px rgba(197, 160, 89, 0.4);">
                        ${i}
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <!-- Initiative -->
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; text-align:center;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:2px;">Iniciativa</div>
                    <div style="font-size:1.4rem; font-family:'Cinzel'; font-weight:900; color:#fff;">
                        ${o>=0?"+"+o:o}
                    </div>
                </div>
                
                <!-- Speed -->
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; text-align:center;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:2px;">Deslocamento</div>
                    <div style="font-size:1.4rem; font-family:'Cinzel'; font-weight:900; color:#fff;">
                        ${c} <span style="font-size:0.75rem;">ft</span>
                    </div>
                </div>
            </div>
        </div>
    `;return $.size>200&&$.clear(),$.set(f,t),t}function N({hero:e,onRoll:r}){if(!e)return null;const a=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},i=l=>Math.floor(((parseInt(l)||10)-10)/2),o=parseInt(e.level)||1,c=Math.floor((o-1)/4)+2,g=(l,n)=>{var u;const b=(u=e.skills)==null?void 0:u.some(h=>h.toLowerCase()===l.toLowerCase());return 10+i(a[n])+(b?c:0)},v=g("perception","wis"),f=g("investigation","int"),t=g("insight","wis"),m=(l,n)=>{r&&r(`Teste de ${l.toUpperCase()}`,i(n),l)},y=[{key:"str",name:"Força (FOR)",stat:"str"},{key:"dex",name:"Destreza (DES)",stat:"dex"},{key:"con",name:"Constituição (CON)",stat:"con"},{key:"int",name:"Inteligência (INT)",stat:"int"},{key:"wis",name:"Sabedoria (SAB)",stat:"wis"},{key:"cha",name:"Carisma (CAR)",stat:"cha"}],w=[{key:"athletics",name:"Atletismo (FOR)",stat:"str"},{key:"acrobatics",name:"Acrobacia (DES)",stat:"dex"},{key:"sleightOfHand",name:"Prestidigitação (DES)",stat:"dex"},{key:"stealth",name:"Furtividade (DES)",stat:"dex"},{key:"arcana",name:"Arcanismo (INT)",stat:"int"},{key:"history",name:"História (INT)",stat:"int"},{key:"investigation",name:"Investigação (INT)",stat:"int"},{key:"nature",name:"Natureza (INT)",stat:"int"},{key:"religion",name:"Religião (INT)",stat:"int"},{key:"animalHandling",name:"Adestrar Animais (SAB)",stat:"wis"},{key:"insight",name:"Intuição (SAB)",stat:"wis"},{key:"medicine",name:"Medicina (SAB)",stat:"wis"},{key:"perception",name:"Percepção (SAB)",stat:"wis"},{key:"survival",name:"Sobrevivência (SAB)",stat:"wis"},{key:"deception",name:"Enganação (CAR)",stat:"cha"},{key:"intimidation",name:"Intimidação (CAR)",stat:"cha"},{key:"performance",name:"Atuação (CAR)",stat:"cha"},{key:"persuasion",name:"Persuasão (CAR)",stat:"cha"}];return x`
        <div style="display:flex; flex-direction:column; gap:25px;">
            <!-- Attributes Grid -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                ${Object.entries(a).map(([l,n])=>x`
                    <div class="card glass-accent h-[105px] flex flex-col items-center justify-center relative pt-3 border border-transparent transition-all duration-300 cursor-pointer" 
                         style="background:rgba(0,0,0,0.25);"
                         onClick=${()=>m(l,n)}
                         onMouseOver=${b=>{b.currentTarget.style.transform="translateY(-3px)",b.currentTarget.style.boxShadow="0 0 20px rgba(197, 160, 89, 0.45)",b.currentTarget.style.borderColor="var(--accent)",b.currentTarget.style.background="rgba(197, 160, 89, 0.06)"}}
                         onMouseOut=${b=>{b.currentTarget.style.transform="none",b.currentTarget.style.boxShadow="none",b.currentTarget.style.borderColor="transparent",b.currentTarget.style.background="rgba(0,0,0,0.25)"}}
                         title="Clique para rolar teste de ${l.toUpperCase()}">
                        
                        <div style="font-size:0.65rem; font-weight:900; text-transform:uppercase; color:var(--accent); letter-spacing:1px;">${l}</div>
                        <div style="font-size:1.8rem; font-weight:900; margin-top:2px;">${n}</div>
                        
                        <div style="position:absolute; bottom:-12px; background:var(--bg-main); border:2px solid var(--accent); border-radius:50%; width:38px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; box-shadow:0 3px 6px rgba(0,0,0,0.5);">
                            ${i(n)>=0?"+":""}${i(n)}
                        </div>
                    </div>
                `)}
            </div>

            <!-- Passives Summary -->
            <div class="card glass-accent py-4 px-3" style="display:flex; flex-direction:column; gap:10px; background:rgba(0,0,0,0.3); border:1px dashed rgba(197,160,89,0.35);">
                <div style="font-size:0.6rem; font-weight:900; color:var(--accent); display:flex; align-items:center; justify-content:center; gap:4px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px; text-transform:uppercase;">
                    <span>Sensorial & Percepção</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">👁️ Percepção Passiva</span><strong style="color:var(--accent);">${v}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🔎 Investigação Pass.</span><strong style="color:var(--info);">${f}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🧠 Intuição Passiva</span><strong style="color:var(--success);">${t}</strong></div>
            </div>

            <!-- Proficiency Card -->
            <div class="card glass-accent p-4" style="display:flex; items-center; justify-content:space-between; background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.2);">
                <span style="font-weight:900; font-size:0.75rem; letter-spacing:1px; color:var(--accent); font-family:'Cinzel';">BÔNUS DE PROFICIÊNCIA</span>
                <div style="font-size:1.4rem; font-weight:900; background:rgba(0,0,0,0.3); border:1.5px solid var(--accent); width:45px; height:35px; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 5px rgba(0,0,0,0.5);">
                    +${c}
                </div>
            </div>

            <!-- Saving Throws -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:4px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-shield-halved"></i> SALVAGUARDAS
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.75rem;">
                    ${y.map(l=>{var h;const n=Array.isArray(e.savingThrows)?e.savingThrows.some(p=>p.toLowerCase()===l.key.toLowerCase()):!!((h=e.savingThrows)!=null&&h[l.key]),u=i(a[l.stat])+(n?c:0);return x`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.05); cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${p=>{p.currentTarget.style.background="rgba(197,160,89,0.08)",p.currentTarget.style.borderColor="var(--accent)",p.currentTarget.style.transform="scale(1.02)"}}
                                 onMouseOut=${p=>{p.currentTarget.style.background="rgba(255,255,255,0.05)",p.currentTarget.style.borderColor="rgba(255,255,255,0.05)",p.currentTarget.style.transform="none"}}
                                 onClick=${()=>{r&&r(`Salvaguarda de ${l.name}`,u)}}>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <i class="fa-${n?"solid":"regular"} fa-circle text-[0.65rem]" style="color:${n?"var(--accent)":"rgba(255,255,255,0.2)"};"></i>
                                    <span>${l.name}</span>
                                </div>
                                <strong style="color:${n?"var(--accent)":"#fff"};">${u>=0?"+":""}${u}</strong>
                            </div>
                        `})}
                </div>
            </div>

            <!-- Skills -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:4px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-list-check"></i> PERÍCIAS & TESTES
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:430px; overflow-y:auto; padding-right:4px; font-size:0.75rem;">
                    ${w.map(l=>{var h;const n=(h=e.skills)==null?void 0:h.some(p=>p.toLowerCase()===l.key.toLowerCase()),u=i(a[l.stat])+(n?c:0);return x`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:${n?"rgba(197,160,89,0.05)":"rgba(255,255,255,0.05)"}; border-color:${n?"rgba(197,160,89,0.2)":"rgba(255,255,255,0.05)"}; cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${p=>{p.currentTarget.style.background="rgba(197,160,89,0.08)",p.currentTarget.style.borderColor="var(--accent)",p.currentTarget.style.transform="scale(1.02)"}}
                                 onMouseOut=${p=>{p.currentTarget.style.background=n?"rgba(197,160,89,0.05)":"rgba(255,255,255,0.05)",p.currentTarget.style.borderColor=n?"rgba(197,160,89,0.2)":"rgba(255,255,255,0.05)",p.currentTarget.style.transform="none"}}
                                 onClick=${()=>{r&&r(`Perícia ${l.name}`,u)}}>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <i class="fa-${n?"solid":"regular"} fa-circle text-[0.6rem]" style="color:${n?"var(--accent)":"rgba(255,255,255,0.15)"};"></i>
                                    <span style="opacity:${n?"1":"0.8"};">${l.name}</span>
                                </div>
                                <strong style="font-weight:900; color:${n?"var(--accent)":"#fff"};">${u>=0?"+":""}${u}</strong>
                            </div>
                        `})}
                </div>
            </div>
        </div>
    `}function H({hero:e}){var h,p,z,T,S,A;if(!e)return null;const[r,a]=E("weapons"),i=(s,d,k)=>{s.dataTransfer.setData("application/json",JSON.stringify({type:d,data:k,sourceHeroId:e.id,sourceHeroName:e.name})),s.dataTransfer.effectAllowed="copy",s.currentTarget.style.opacity="0.5"},o=s=>{s.currentTarget.style.opacity="1"},c=((h=e.deathSaves)==null?void 0:h.success)||[!1,!1,!1],g=((p=e.deathSaves)==null?void 0:p.failure)||[!1,!1,!1],v=parseInt(e.level)||1,f=e.hitDiceCurrent!==void 0?e.hitDiceCurrent:v,t="d8",m=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},y=s=>Math.floor(((parseInt(s)||10)-10)/2),w=Math.floor((v-1)/4)+2,l=(z=e.class)!=null&&z.toLowerCase().includes("mago")?"int":(T=e.class)!=null&&T.toLowerCase().includes("druida")||(S=e.class)!=null&&S.toLowerCase().includes("clérigo")||(A=e.class)!=null&&A.toLowerCase().includes("patrulheiro")?"wis":"cha",n=8+w+y(m[l]),b=w+y(m[l]),u=[];return e.spells&&Object.entries(e.spells).forEach(([s,d])=>{if(!d)return;const k=parseInt(s.replace("lvl",""))||0;d.split("\\n").map(C=>C.trim()).filter(Boolean).forEach(C=>{u.push({name:C,level:k})})}),x`
        <div style="display:flex; flex-direction:column; gap:25px;">
            <!-- Vital Combat Controls -->
            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px;">
                <!-- Death Saves -->
                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--danger);">
                    <div style="font-size:0.65rem; color:var(--danger); font-weight:900; text-transform:uppercase; margin-bottom:10px;">💀 TESTES DE MORTE</div>
                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Sucessos</span>
                            <div style="display:flex; gap:6px;">
                                ${c.map(s=>x`<i class="fa-${s?"solid":"regular"} fa-heart" style="color:${s?"var(--success)":"rgba(255,255,255,0.2)"}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Falhas</span>
                            <div style="display:flex; gap:6px;">
                                ${g.map(s=>x`<i class="fa-${s?"solid":"regular"} fa-circle-xmark" style="color:${s?"var(--danger)":"rgba(255,255,255,0.2)"}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hit Dice -->
                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--info); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.65rem; color:var(--info); font-weight:900; text-transform:uppercase; margin-bottom:5px;">🎲 DADO DE VIDA</div>
                    <div style="font-size:1.6rem; font-weight:900; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                        ${f} / ${v} <span style="font-size:0.8rem; color:var(--accent);">${t}</span>
                    </div>
                </div>
            </div>

            <!-- Attacks & Spells Section -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25); border:1px solid rgba(197,160,89,0.2);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:8px;"></i> ATAQUES & MAGIAS</span>
                    <div style="display:flex; gap:10px; font-size:0.7rem; font-family:sans-serif; opacity:0.8;">
                        <span>CD: <strong>${n}</strong></span>
                        <span>•</span>
                        <span>Ataque Mágico: <strong>+${b}</strong></span>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${r==="weapons"?"rgba(197,160,89,0.3)":"transparent"}; 
                                   background:${r==="weapons"?"rgba(197,160,89,0.1)":"transparent"};
                                   color:${r==="weapons"?"var(--accent)":"var(--text-dim)"};" 
                            onClick=${()=>a("weapons")}>
                        ⚔️ Armas
                    </button>
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${r==="spells"?"rgba(197,160,89,0.3)":"transparent"}; 
                                   background:${r==="spells"?"rgba(197,160,89,0.1)":"transparent"};
                                   color:${r==="spells"?"var(--accent)":"var(--text-dim)"};" 
                            onClick=${()=>a("spells")}>
                        🔮 Magias (${u.length})
                    </button>
                </div>

                <!-- Content -->
                <div style="display:${r==="weapons"?"flex":"none"}; flex-direction:column; gap:10px;">
                    ${e.attacks&&e.attacks.length>0?e.attacks.map(s=>x`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true" 
                             onDragStart=${d=>i(d,"attack",s)} 
                             onDragEnd=${o}
                             onMouseOver=${d=>{d.currentTarget.style.background="rgba(197,160,89,0.08)",d.currentTarget.style.borderColor="var(--accent)",d.currentTarget.style.transform="scale(1.02)"}}
                             onMouseOut=${d=>{d.currentTarget.style.background="rgba(0,0,0,0.2)",d.currentTarget.style.borderColor="rgba(255,255,255,0.05)",d.currentTarget.style.transform="none"}}>
                            <div>
                                <div style="font-weight:900; font-size:0.85rem; color:#fff;">${s.name}</div>
                                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">Alcance: ${s.range||"5 ft"}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:900; color:var(--accent); font-size:0.9rem;">${s.bonus>=0?"+":""}${s.bonus}</div>
                                <div style="font-size:0.65rem; font-weight:800; color:var(--danger);"><i class="fa-solid fa-droplet text-[0.55rem]"></i> ${s.damage||"1d6"}</div>
                            </div>
                        </div>
                    `):x`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhum ataque configurado.</div>`}
                </div>

                <div style="display:${r==="spells"?"flex":"none"}; flex-direction:column; gap:10px;">
                    ${u.length>0?u.map(s=>x`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true"
                             onDragStart=${d=>i(d,"spell",s)}
                             onDragEnd=${o}
                             onMouseOver=${d=>{d.currentTarget.style.background="rgba(156,39,176,0.1)",d.currentTarget.style.borderColor="#9c27b0",d.currentTarget.style.transform="scale(1.02)"}}
                             onMouseOut=${d=>{d.currentTarget.style.background="rgba(0,0,0,0.2)",d.currentTarget.style.borderColor="rgba(255,255,255,0.05)",d.currentTarget.style.transform="none"}}>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:24px; height:24px; border-radius:50%; background:rgba(156,39,176,0.2); border:1px solid #9c27b0; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#e1bee7; font-weight:900;">
                                    ${s.level===0?"T":s.level}
                                </div>
                                <div style="font-weight:900; font-size:0.8rem; color:#fff;">${s.name}</div>
                            </div>
                        </div>
                    `):x`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhuma magia preparada.</div>`}
                </div>
            </div>
        </div>
    `}function _({hero:e,onUpdateCoin:r}){var o,c,g,v,f;if(!e)return null;const a=e.coins||{cp:0,sp:0,ep:0,gp:10,pp:0},i=(t,m)=>{const y=parseInt(t.target.value)||0;r&&r(m,y)};return x`
        <div style="display:flex; flex-direction:column; gap:25px;">
            
            <!-- EQUIPMENT & MONEY POUCH -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-bag-shopping"></i> INVENTÁRIO & BOLSA DE MOEDAS
                </div>

                <!-- Currency pouch -->
                <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-bottom:20px; background:rgba(0,0,0,0.3); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#b87333; font-weight:900; text-transform:uppercase; margin-bottom:4px;">CP (Cobre)</div>
                        <input type="number" 
                               value=${a.cp} 
                               onChange=${t=>i(t,"cp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#b87333; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#aaa9ad; font-weight:900; text-transform:uppercase; margin-bottom:4px;">SP (Prata)</div>
                        <input type="number" 
                               value=${a.sp} 
                               onChange=${t=>i(t,"sp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#aaa9ad; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#d4af37; font-weight:900; text-transform:uppercase; margin-bottom:4px;">EP (Electro)</div>
                        <input type="number" 
                               value=${a.ep} 
                               onChange=${t=>i(t,"ep")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#d4af37; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:var(--accent); font-weight:900; text-transform:uppercase; margin-bottom:4px;">GP (Ouro)</div>
                        <input type="number" 
                               value=${a.gp} 
                               onChange=${t=>i(t,"gp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#e5e4e2; font-weight:900; text-transform:uppercase; margin-bottom:4px;">PP (Platina)</div>
                        <input type="number" 
                               value=${a.pp} 
                               onChange=${t=>i(t,"pp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#e5e4e2; font-weight:900; padding:4px;" />
                    </div>
                </div>

                <div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    ${(c=(o=e.equipment)==null?void 0:o.items)!=null&&c.map?e.equipment.items.map(t=>x`<div>• ${t.qty}x <strong>${t.name}</strong> (${t.weight}kg)</div>`):((g=e.equipment)==null?void 0:g.items)||"Inventário vazio."}
                </div>
                ${(v=e.equipment)!=null&&v.notes?x`<div style="font-size:0.7rem; margin-top:8px; opacity:0.6; font-style:italic;">* ${e.equipment.notes}</div>`:""}
            </div>
            
            <!-- FEATURES & CLASSES TRAITS -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-book-open-reader"></i> TRAÇOS & ANOTAÇÕES DE HISTÓRIA
                </div>
                <div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    ${((f=e.roleplay)==null?void 0:f.traits)||"Nenhuma história ou traço de personalidade registrado."}
                </div>
            </div>

        </div>
    `}function F(e){const r=I(),a=(g,v)=>{var y;const f=P.roll("1d20").total,t=f+v;let m="info";f===20&&(m="success"),f===1&&(m="error"),D.show(`${g} Rolado! Dado: ${f} + ${v} = ${t}`,m),(y=window.TOME)!=null&&y.events&&window.TOME.events.emit("DICE_ROLLED",{label:g,roll:f,bonus:v,total:t})},{players:i,viewingHeroId:o}=r,c=i==null?void 0:i.find(g=>g.id===o);return c?x`
        <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out; padding-bottom:50px;">
            <div class="card glass-accent" style="padding:40px; border-radius:24px; border: 1px solid rgba(212,175,55,0.2); box-shadow:0 25px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02); position:relative; overflow:hidden; background: rgba(15,20,28,0.7); backdrop-filter: blur(25px);">
                
                <div style="position:absolute; top:0; right:0; width:600px; height:600px; background:radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(30%, -30%);"></div>
                <div style="position:absolute; bottom:0; left:0; width:500px; height:500px; background:radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(-30%, 30%);"></div>
                
                <div style="position:relative; z-index:10; display:flex; flex-direction:column; gap:40px;">
                    
                    <${O} hero=${c} />
                    
                    <div style="display:grid; grid-template-columns: 360px 1fr; gap:35px; align-items:start;">
                        <div style="display:flex; flex-direction:column; gap:30px;">
                            <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                <${j} hero=${c} />
                            </div>
                            <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                <${N} hero=${c} onRoll=${a} />
                            </div>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:30px;">
                            <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                <${H} hero=${c} />
                            </div>
                            <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                <${_} hero=${c} onUpdateCoin=${(g,v)=>{window.TOME.store.update(f=>{const t=f.players.find(m=>m.id===c.id);t&&(t.coins||(t.coins={cp:0,sp:0,ep:0,gp:10,pp:0}),t.coins[g]=v)})}} />
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    `:x`
            <div class="page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 100%; padding:100px;">
                <i class="fa-solid fa-user-slash fa-4x" style="color:rgba(212,175,55,0.4); margin-bottom:20px;"></i>
                <h2 style="font-family:'Cinzel'; color:var(--accent); font-size: 2rem;">Nenhum Herói Selecionado</h2>
                <p style="color:var(--text-dim); margin-top:10px; font-size:1.1rem;">Selecione um personagem no painel lateral esquerdo.</p>
            </div>
        `}export{F as HeroSheetV22};
