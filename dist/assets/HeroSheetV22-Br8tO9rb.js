var E=Object.defineProperty;var D=(e,r,t)=>r in e?E(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t;var I=(e,r,t)=>D(e,typeof r!="symbol"?r+"":r,t);import{R as P}from"./ReactiveComponent-BnoCbmXI.js";import{d as O,D as M}from"./BattleManager-0aKgsbKs.js";import{m as g}from"./main-9sWSJyi_.js";import{Toast as j}from"./Toast-m0Ci56ke.js";import"./Boot-zbOxlXxn.js";import"./jsxRuntime.module-B31ux8iJ.js";import"./FXEngine-CLpy8O3f.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";function N(e,r=1){const t=parseInt(r)||1,i=e||0;let a=300;t===1?a=300:t===2?a=900:t===3?a=2700:t===4?a=6500:t>=5&&(a=t*2e3);let p=Math.min(i/a*100,100);return{lvl:t,currentXP:i,nextXP:a,progress:p}}function R({hero:e}){if(!e)return null;const{lvl:r,currentXP:t,nextXP:i,progress:a}=N(e.xp,e.level);return g`
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
                        <span class="text-gray-200">${t} / ${i} XP</span>
                    </div>
                    <div class="w-full h-2 bg-black/50 rounded-md overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                        <div class="h-full bg-gradient-to-r from-tomeGold-muted to-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.8)] transition-all duration-500 ease-out" style="width:${a}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `}const $=new Map;function H({hero:e}){var y,h;if(!e||!e.id)return null;const r=e.stats||{dex:10},t=w=>Math.floor(((parseInt(w)||10)-10)/2),i=e.ac||10+t(r.dex),a=t(r.dex),p=e.speed||30,f=((y=e.hp)==null?void 0:y.current)||0,m=((h=e.hp)==null?void 0:h.max)||10,x=`${e.id}_${f}_${m}_${i}_${a}_${p}`;if($.has(x))return $.get(x);const o=g`
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
                        ${f} <span style="font-size:1rem; color:var(--text-dim);">/ ${m}</span>
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
                        ${a>=0?"+"+a:a}
                    </div>
                </div>
                
                <!-- Speed -->
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; text-align:center;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:2px;">Deslocamento</div>
                    <div style="font-size:1.4rem; font-family:'Cinzel'; font-weight:900; color:#fff;">
                        ${p} <span style="font-size:0.75rem;">ft</span>
                    </div>
                </div>
            </div>
        </div>
    `;return $.size>200&&$.clear(),$.set(x,o),o}function L({hero:e,onRoll:r}){if(!e)return null;const t=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},i=l=>Math.floor(((parseInt(l)||10)-10)/2),a=parseInt(e.level)||1,p=Math.floor((a-1)/4)+2,f=(l,n)=>{var b;const v=(b=e.skills)==null?void 0:b.some(u=>u.toLowerCase()===l.toLowerCase());return 10+i(t[n])+(v?p:0)},m=f("perception","wis"),x=f("investigation","int"),o=f("insight","wis"),y=(l,n)=>{r&&r(`Teste de ${l.toUpperCase()}`,i(n),l)},h=[{key:"str",name:"Força (FOR)",stat:"str"},{key:"dex",name:"Destreza (DES)",stat:"dex"},{key:"con",name:"Constituição (CON)",stat:"con"},{key:"int",name:"Inteligência (INT)",stat:"int"},{key:"wis",name:"Sabedoria (SAB)",stat:"wis"},{key:"cha",name:"Carisma (CAR)",stat:"cha"}],w=[{key:"athletics",name:"Atletismo (FOR)",stat:"str"},{key:"acrobatics",name:"Acrobacia (DES)",stat:"dex"},{key:"sleightOfHand",name:"Prestidigitação (DES)",stat:"dex"},{key:"stealth",name:"Furtividade (DES)",stat:"dex"},{key:"arcana",name:"Arcanismo (INT)",stat:"int"},{key:"history",name:"História (INT)",stat:"int"},{key:"investigation",name:"Investigação (INT)",stat:"int"},{key:"nature",name:"Natureza (INT)",stat:"int"},{key:"religion",name:"Religião (INT)",stat:"int"},{key:"animalHandling",name:"Adestrar Animais (SAB)",stat:"wis"},{key:"insight",name:"Intuição (SAB)",stat:"wis"},{key:"medicine",name:"Medicina (SAB)",stat:"wis"},{key:"perception",name:"Percepção (SAB)",stat:"wis"},{key:"survival",name:"Sobrevivência (SAB)",stat:"wis"},{key:"deception",name:"Enganação (CAR)",stat:"cha"},{key:"intimidation",name:"Intimidação (CAR)",stat:"cha"},{key:"performance",name:"Atuação (CAR)",stat:"cha"},{key:"persuasion",name:"Persuasão (CAR)",stat:"cha"}];return g`
        <div style="display:flex; flex-direction:column; gap:25px;">
            <!-- Attributes Grid -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                ${Object.entries(t).map(([l,n])=>g`
                    <div class="card glass-accent h-[105px] flex flex-col items-center justify-center relative pt-3 border border-transparent transition-all duration-300 cursor-pointer" 
                         style="background:rgba(0,0,0,0.25);"
                         onClick=${()=>y(l,n)}
                         onMouseOver=${v=>{v.currentTarget.style.transform="translateY(-3px)",v.currentTarget.style.boxShadow="0 0 20px rgba(197, 160, 89, 0.45)",v.currentTarget.style.borderColor="var(--accent)",v.currentTarget.style.background="rgba(197, 160, 89, 0.06)"}}
                         onMouseOut=${v=>{v.currentTarget.style.transform="none",v.currentTarget.style.boxShadow="none",v.currentTarget.style.borderColor="transparent",v.currentTarget.style.background="rgba(0,0,0,0.25)"}}
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
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">👁️ Percepção Passiva</span><strong style="color:var(--accent);">${m}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🔎 Investigação Pass.</span><strong style="color:var(--info);">${x}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🧠 Intuição Passiva</span><strong style="color:var(--success);">${o}</strong></div>
            </div>

            <!-- Proficiency Card -->
            <div class="card glass-accent p-4" style="display:flex; items-center; justify-content:space-between; background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.2);">
                <span style="font-weight:900; font-size:0.75rem; letter-spacing:1px; color:var(--accent); font-family:'Cinzel';">BÔNUS DE PROFICIÊNCIA</span>
                <div style="font-size:1.4rem; font-weight:900; background:rgba(0,0,0,0.3); border:1.5px solid var(--accent); width:45px; height:35px; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 5px rgba(0,0,0,0.5);">
                    +${p}
                </div>
            </div>

            <!-- Saving Throws -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:4px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-shield-halved"></i> SALVAGUARDAS
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.75rem;">
                    ${h.map(l=>{var u;const n=Array.isArray(e.savingThrows)?e.savingThrows.some(c=>c.toLowerCase()===l.key.toLowerCase()):!!((u=e.savingThrows)!=null&&u[l.key]),b=i(t[l.stat])+(n?p:0);return g`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.05); cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${c=>{c.currentTarget.style.background="rgba(197,160,89,0.08)",c.currentTarget.style.borderColor="var(--accent)",c.currentTarget.style.transform="scale(1.02)"}}
                                 onMouseOut=${c=>{c.currentTarget.style.background="rgba(255,255,255,0.05)",c.currentTarget.style.borderColor="rgba(255,255,255,0.05)",c.currentTarget.style.transform="none"}}
                                 onClick=${()=>{r&&r(`Salvaguarda de ${l.name}`,b)}}>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <i class="fa-${n?"solid":"regular"} fa-circle text-[0.65rem]" style="color:${n?"var(--accent)":"rgba(255,255,255,0.2)"};"></i>
                                    <span>${l.name}</span>
                                </div>
                                <strong style="color:${n?"var(--accent)":"#fff"};">${b>=0?"+":""}${b}</strong>
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
                    ${w.map(l=>{var u;const n=(u=e.skills)==null?void 0:u.some(c=>c.toLowerCase()===l.key.toLowerCase()),b=i(t[l.stat])+(n?p:0);return g`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:${n?"rgba(197,160,89,0.05)":"rgba(255,255,255,0.05)"}; border-color:${n?"rgba(197,160,89,0.2)":"rgba(255,255,255,0.05)"}; cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${c=>{c.currentTarget.style.background="rgba(197,160,89,0.08)",c.currentTarget.style.borderColor="var(--accent)",c.currentTarget.style.transform="scale(1.02)"}}
                                 onMouseOut=${c=>{c.currentTarget.style.background=n?"rgba(197,160,89,0.05)":"rgba(255,255,255,0.05)",c.currentTarget.style.borderColor=n?"rgba(197,160,89,0.2)":"rgba(255,255,255,0.05)",c.currentTarget.style.transform="none"}}
                                 onClick=${()=>{r&&r(`Perícia ${l.name}`,b)}}>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <i class="fa-${n?"solid":"regular"} fa-circle text-[0.6rem]" style="color:${n?"var(--accent)":"rgba(255,255,255,0.15)"};"></i>
                                    <span style="opacity:${n?"1":"0.8"};">${l.name}</span>
                                </div>
                                <strong style="font-weight:900; color:${n?"var(--accent)":"#fff"};">${b>=0?"+":""}${b}</strong>
                            </div>
                        `})}
                </div>
            </div>
        </div>
    `}function _({hero:e}){var u,c,z,T,S,A;if(!e)return null;const[r,t]=O("weapons"),i=(s,d,k)=>{s.dataTransfer.setData("application/json",JSON.stringify({type:d,data:k,sourceHeroId:e.id,sourceHeroName:e.name})),s.dataTransfer.effectAllowed="copy",s.currentTarget.style.opacity="0.5"},a=s=>{s.currentTarget.style.opacity="1"},p=((u=e.deathSaves)==null?void 0:u.success)||[!1,!1,!1],f=((c=e.deathSaves)==null?void 0:c.failure)||[!1,!1,!1],m=parseInt(e.level)||1,x=e.hitDiceCurrent!==void 0?e.hitDiceCurrent:m,o="d8",y=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},h=s=>Math.floor(((parseInt(s)||10)-10)/2),w=Math.floor((m-1)/4)+2,l=(z=e.class)!=null&&z.toLowerCase().includes("mago")?"int":(T=e.class)!=null&&T.toLowerCase().includes("druida")||(S=e.class)!=null&&S.toLowerCase().includes("clérigo")||(A=e.class)!=null&&A.toLowerCase().includes("patrulheiro")?"wis":"cha",n=8+w+h(y[l]),v=w+h(y[l]),b=[];return e.spells&&Object.entries(e.spells).forEach(([s,d])=>{if(!d)return;const k=parseInt(s.replace("lvl",""))||0;d.split("\\n").map(C=>C.trim()).filter(Boolean).forEach(C=>{b.push({name:C,level:k})})}),g`
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
                                ${p.map(s=>g`<i class="fa-${s?"solid":"regular"} fa-heart" style="color:${s?"var(--success)":"rgba(255,255,255,0.2)"}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Falhas</span>
                            <div style="display:flex; gap:6px;">
                                ${f.map(s=>g`<i class="fa-${s?"solid":"regular"} fa-circle-xmark" style="color:${s?"var(--danger)":"rgba(255,255,255,0.2)"}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hit Dice -->
                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--info); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.65rem; color:var(--info); font-weight:900; text-transform:uppercase; margin-bottom:5px;">🎲 DADO DE VIDA</div>
                    <div style="font-size:1.6rem; font-weight:900; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                        ${x} / ${m} <span style="font-size:0.8rem; color:var(--accent);">${o}</span>
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
                        <span>Ataque Mágico: <strong>+${v}</strong></span>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${r==="weapons"?"rgba(197,160,89,0.3)":"transparent"}; 
                                   background:${r==="weapons"?"rgba(197,160,89,0.1)":"transparent"};
                                   color:${r==="weapons"?"var(--accent)":"var(--text-dim)"};" 
                            onClick=${()=>t("weapons")}>
                        ⚔️ Armas
                    </button>
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${r==="spells"?"rgba(197,160,89,0.3)":"transparent"}; 
                                   background:${r==="spells"?"rgba(197,160,89,0.1)":"transparent"};
                                   color:${r==="spells"?"var(--accent)":"var(--text-dim)"};" 
                            onClick=${()=>t("spells")}>
                        🔮 Magias (${b.length})
                    </button>
                </div>

                <!-- Content -->
                <div style="display:${r==="weapons"?"flex":"none"}; flex-direction:column; gap:10px;">
                    ${e.attacks&&e.attacks.length>0?e.attacks.map(s=>g`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true" 
                             onDragStart=${d=>i(d,"attack",s)} 
                             onDragEnd=${a}
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
                    `):g`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhum ataque configurado.</div>`}
                </div>

                <div style="display:${r==="spells"?"flex":"none"}; flex-direction:column; gap:10px;">
                    ${b.length>0?b.map(s=>g`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true"
                             onDragStart=${d=>i(d,"spell",s)}
                             onDragEnd=${a}
                             onMouseOver=${d=>{d.currentTarget.style.background="rgba(156,39,176,0.1)",d.currentTarget.style.borderColor="#9c27b0",d.currentTarget.style.transform="scale(1.02)"}}
                             onMouseOut=${d=>{d.currentTarget.style.background="rgba(0,0,0,0.2)",d.currentTarget.style.borderColor="rgba(255,255,255,0.05)",d.currentTarget.style.transform="none"}}>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:24px; height:24px; border-radius:50%; background:rgba(156,39,176,0.2); border:1px solid #9c27b0; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#e1bee7; font-weight:900;">
                                    ${s.level===0?"T":s.level}
                                </div>
                                <div style="font-weight:900; font-size:0.8rem; color:#fff;">${s.name}</div>
                            </div>
                        </div>
                    `):g`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhuma magia preparada.</div>`}
                </div>
            </div>
        </div>
    `}function B({hero:e,onUpdateCoin:r}){var a,p,f,m,x;if(!e)return null;const t=e.coins||{cp:0,sp:0,ep:0,gp:10,pp:0},i=(o,y)=>{const h=parseInt(o.target.value)||0;r&&r(y,h)};return g`
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
                               value=${t.cp} 
                               onChange=${o=>i(o,"cp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#b87333; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#aaa9ad; font-weight:900; text-transform:uppercase; margin-bottom:4px;">SP (Prata)</div>
                        <input type="number" 
                               value=${t.sp} 
                               onChange=${o=>i(o,"sp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#aaa9ad; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#d4af37; font-weight:900; text-transform:uppercase; margin-bottom:4px;">EP (Electro)</div>
                        <input type="number" 
                               value=${t.ep} 
                               onChange=${o=>i(o,"ep")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#d4af37; font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:var(--accent); font-weight:900; text-transform:uppercase; margin-bottom:4px;">GP (Ouro)</div>
                        <input type="number" 
                               value=${t.gp} 
                               onChange=${o=>i(o,"gp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); font-weight:900; padding:4px;" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.6rem; color:#e5e4e2; font-weight:900; text-transform:uppercase; margin-bottom:4px;">PP (Platina)</div>
                        <input type="number" 
                               value=${t.pp} 
                               onChange=${o=>i(o,"pp")}
                               style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#e5e4e2; font-weight:900; padding:4px;" />
                    </div>
                </div>

                <div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    ${(p=(a=e.equipment)==null?void 0:a.items)!=null&&p.map?e.equipment.items.map(o=>g`<div>• ${o.qty}x <strong>${o.name}</strong> (${o.weight}kg)</div>`):((f=e.equipment)==null?void 0:f.items)||"Inventário vazio."}
                </div>
                ${(m=e.equipment)!=null&&m.notes?g`<div style="font-size:0.7rem; margin-top:8px; opacity:0.6; font-style:italic;">* ${e.equipment.notes}</div>`:""}
            </div>
            
            <!-- FEATURES & CLASSES TRAITS -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-book-open-reader"></i> TRAÇOS & ANOTAÇÕES DE HISTÓRIA
                </div>
                <div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    ${((x=e.roleplay)==null?void 0:x.traits)||"Nenhuma história ou traço de personalidade registrado."}
                </div>
            </div>

        </div>
    `}class W extends P{constructor(t){super(t);I(this,"handleRoll",(t,i)=>{var m;const a=M.roll("1d20").total,p=a+i;let f="info";a===20&&(f="success"),a===1&&(f="error"),j.show(`${t} Rolado! Dado: ${a} + ${i} = ${p}`,f),(m=window.TOME)!=null&&m.events&&window.TOME.events.emit("DICE_ROLLED",{label:t,roll:a,bonus:i,total:p})})}template(){const{players:t,viewingHeroId:i}=this.store.state,a=t==null?void 0:t.find(p=>p.id===i);return a?g`
            <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out; padding-bottom:50px;">
                <div class="card glass-accent" style="padding:40px; border-radius:24px; border: 1px solid rgba(212,175,55,0.2); box-shadow:0 25px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02); position:relative; overflow:hidden; background: rgba(15,20,28,0.7); backdrop-filter: blur(25px);">
                    
                    <!-- Decorative Background Element (V22 Gold Glow) -->
                    <div style="position:absolute; top:0; right:0; width:600px; height:600px; background:radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(30%, -30%);"></div>
                    <div style="position:absolute; bottom:0; left:0; width:500px; height:500px; background:radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(-30%, 30%);"></div>
                    
                    <div style="position:relative; z-index:10; display:flex; flex-direction:column; gap:40px;">
                        
                        <!-- HERO HEADER (Avatar, Level, Base Info) -->
                        <${R} hero=${a} />
                        
                        <div style="display:grid; grid-template-columns: 360px 1fr; gap:35px; align-items:start;">
                            <!-- LEFT COLUMN (Vitals, Saves, Skills) -->
                            <div style="display:flex; flex-direction:column; gap:30px;">
                                <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                    <${H} hero=${a} />
                                </div>
                                <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                    <${L} hero=${a} onRoll=${this.handleRoll} />
                                </div>
                            </div>
                            
                            <!-- RIGHT COLUMN (Combat, Actions, Spells, Inventory) -->
                            <div style="display:flex; flex-direction:column; gap:30px;">
                                <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                    <${_} hero=${a} />
                                </div>
                                <div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                                    <${B} hero=${a} onUpdateCoin=${(p,f)=>{this.store.update(m=>{const x=m.players.find(o=>o.id===a.id);x&&(x.coins||(x.coins={cp:0,sp:0,ep:0,gp:10,pp:0}),x.coins[p]=f)})}} />
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        `:g`
                <div class="page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 100%; padding:100px;">
                    <i class="fa-solid fa-user-slash fa-4x" style="color:rgba(212,175,55,0.4); margin-bottom:20px;"></i>
                    <h2 style="font-family:'Cinzel'; color:var(--accent); font-size: 2rem;">Nenhum Herói Selecionado</h2>
                    <p style="color:var(--text-dim); margin-top:10px; font-size:1.1rem;">Selecione um personagem no painel lateral esquerdo.</p>
                </div>
            `}}export{W as HeroSheetV22};
