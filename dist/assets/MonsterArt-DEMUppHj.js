const s={goblin:"Goblin",kobold:"Kobold",esqueleto:"Skeleton",ogre:"Ogre",grifo:"Griffon","cão infernal":"Hell Hound","cao infernal":"Hell Hound",manticora:"Manticore",minotauro:"Minotaur",basilisco:"Basilisk",cavaleiro:"Knight",múmia:"Mummy",mumia:"Mummy","urso-coruja":"Owlbear",troll:"Troll","elemental da terra":"Earth Elemental","vampire spawn":"Vampire Spawn",gladiador:"Gladiator",medusa:"Medusa",ciclope:"Cyclops","gigante de pedra":"Stone Giant","dragão negro jovem":"Young Black Dragon","dragao negro jovem":"Young Black Dragon",oni:"Oni",hydra:"Hydra",assasino:"Assassin",assassino:"Assassin","gigante de gelo":"Frost Giant",quimera:"Chimera",aboleth:"Aboleth",treant:"Treant","dragão vermelho jovem":"Young Red Dragon","dragao vermelho jovem":"Young Red Dragon","golem de pedra":"Stone Golem","guardian naga":"Guardian Naga",roc:"Roc",behir:"Behir","gigante de fogo":"Fire Giant",arcimago:"Archmage","erinyes (diaba)":"Erinyes",erinyes:"Erinyes","dragão azul jovem":"Young Blue Dragon","dragao azul jovem":"Young Blue Dragon","dragão verde adulto":"Adult Green Dragon","dragao verde adulto":"Adult Green Dragon","golem de ferro":"Iron Golem",nalfeshnee:"Nalfeshnee","múmia lorde":"Mummy Lord","mumia lorde":"Mummy Lord","vampiro (guerreiro)":"Vampire",vampiro:"Vampire","death knight":"Death Knight","dragão vermelho adulto":"Adult Red Dragon","dragao vermelho adulto":"Adult Red Dragon",marilith:"Marilith",planetar:"Planetar","dragão azul adulto":"Adult Blue Dragon","dragao azul adulto":"Adult Blue Dragon",goristro:"Goristro","pit fiend":"Pit Fiend","dragão negro adulto":"Adult Black Dragon","dragao negro adulto":"Adult Black Dragon",androesfinge:"Androsphinx",solar:"Solar",demilich:"Demilich","dragão branco antigo":"Ancient White Dragon","dragao branco antigo":"Ancient White Dragon",balor:"Balor","dragão verde antigo":"Ancient Green Dragon","dragao verde antigo":"Ancient Green Dragon","dragão azul antigo":"Ancient Blue Dragon","dragao azul antigo":"Ancient Blue Dragon",empyrean:"Empyrean","dragão vermelho antigo":"Ancient Red Dragon","dragao vermelho antigo":"Ancient Red Dragon","dragão dourado antigo":"Ancient Gold Dragon","dragao dourado antigo":"Ancient Gold Dragon",kraken:"Kraken","tiamat (avatar)":"Tiamat",tiamat:"Tiamat",tarrasque:"Tarrasque","lich supremo":"Lich",lich:"Lich","kraken abissal":"Kraken","beholder tirano":"Beholder",beholder:"Beholder","dragão sombrio antigo":"Shadow Dragon","dragao sombrio antigo":"Shadow Dragon",demogorgon:"Demogorgon","senhor vampírico":"Vampire","senhor vampirico":"Vampire"},d={1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5e3,10:5900,11:7200,12:8400,13:1e4,14:11500,15:13e3,16:15e3,17:18e3,18:2e4,19:22e3,20:25e3,25:75e3,30:155e3};function c(n=""){return String(n).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\([^)]*\)/g,"").trim()}function g(n=""){if(n==="BOSS")return 25;const e=parseInt(String(n).replace(/\D/g,""),10);return Number.isFinite(e)?e:1}class f{static getImage(e,a=!1){if(!e)return null;if(e.customImg)return e.customImg;if(e.img&&!e.img.includes("wikimedia.org"))return e.img;const o=e.name||"",r=c(o);let i=s[r];if(!i){for(const[t,l]of Object.entries(s))if(r.includes(t)||t.includes(r)){i=l;break}}if(i||(r.includes("drag")?i="Young Red Dragon":r.includes("vamp")?i="Vampire":r.includes("lich")?i="Lich":r.includes("kraken")?i="Kraken":r.includes("beholder")?i="Beholder":r.includes("tarrasque")?i="Tarrasque":r.includes("demonio")||r.includes("diabo")||r.includes("fiend")?i="Pit Fiend":r.includes("gigante")?i="Stone Giant":r.includes("elemental")&&(i="Earth Elemental")),i){const t=i.toLowerCase().replace(/[^a-z0-9]/g,"_");return a?`/assets/sprites/monsters/token_${t}.webp`:`/assets/sprites/monsters/portrait_${t}.webp`}return null}static getCdnFallback(e,a=!1){const o=(e==null?void 0:e.name)||"",r=c(o),i=s[r];return i?`https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/bestiary/${a?"tokens/MM":"MM"}/${encodeURIComponent(i)}.webp`:null}static getHeraldry(e){const a=c((e==null?void 0:e.type)||"monstro");return a.includes("drag")?{icon:"fa-solid fa-dragon",color:"#f87171",bg:"rgba(220, 38, 38, 0.25)",label:"Dragão"}:a.includes("morto")||a.includes("undead")?{icon:"fa-solid fa-skull-crossbones",color:"#c084fc",bg:"rgba(147, 51, 234, 0.25)",label:"Morto-Vivo"}:a.includes("monstruo")||a.includes("aberra")?{icon:"fa-solid fa-paw",color:"#fbbf24",bg:"rgba(217, 119, 6, 0.25)",label:"Monstruosidade"}:a.includes("humano")||a.includes("humanoide")?{icon:"fa-solid fa-shield-halved",color:"#60a5fa",bg:"rgba(37, 99, 235, 0.25)",label:"Humanoide"}:a.includes("gigan")?{icon:"fa-solid fa-mountain",color:"#facc15",bg:"rgba(202, 138, 4, 0.25)",label:"Gigante"}:a.includes("infer")||a.includes("demon")||a.includes("diabo")?{icon:"fa-solid fa-fire-flame-curved",color:"#ef4444",bg:"rgba(185, 28, 28, 0.25)",label:"Ínfero"}:a.includes("celest")?{icon:"fa-solid fa-sun",color:"#fde047",bg:"rgba(234, 179, 8, 0.25)",label:"Celestial"}:a.includes("element")?{icon:"fa-solid fa-gem",color:"#22d3ee",bg:"rgba(8, 145, 178, 0.25)",label:"Elemental"}:a.includes("constru")?{icon:"fa-solid fa-gear",color:"#cbd5e1",bg:"rgba(100, 116, 139, 0.25)",label:"Constructo"}:a.includes("planta")?{icon:"fa-solid fa-tree",color:"#4ade80",bg:"rgba(22, 163, 74, 0.25)",label:"Planta"}:a.includes("divin")?{icon:"fa-solid fa-crown",color:"#fbbf24",bg:"rgba(245, 158, 11, 0.3)",label:"Divindade"}:{icon:"fa-solid fa-shield-halved",color:"#94a3b8",bg:"rgba(51, 65, 85, 0.25)",label:(e==null?void 0:e.type)||"Monstro"}}static getSubtitle(e,a){if(e!=null&&e.subtitle)return e.subtitle;const o=g(a);return a==="BOSS"?"Ameaça Apocalíptica • Boss de Campanha":`Criatura de Desafio • Nível ${o}`}static getClassification(e){const a=(e==null?void 0:e.type)||"Monstro",o=(e==null?void 0:e.alignment)||"Neutro";return`${(e==null?void 0:e.size)||"Médio"} ${a}, ${o}`}static getCrDisplay(e){const a=g(e),o=d[a]||d[Math.min(30,a)]||200;return e==="BOSS"?`CR: ${a}+ (Lendário)`:`CR: ${a} (${o.toLocaleString("pt-BR")} XP)`}static getSpeed(e){return(e==null?void 0:e.speed)||"30 ft."}static getMultiattackSummary(e=[]){if(!e.length)return"—";const a=e.slice(0,3).map(o=>o.name.split("(")[0].trim().toUpperCase());return a.length>=2?`×2 ${a[0]}, ×1 ${a[1]}`:`×1 ${a[0]}`}static isMeleeAction(e){const a=((e==null?void 0:e.name)||"").toLowerCase();return!a.includes("sopro")&&!a.includes("arco")&&!a.includes("flecha")&&!a.includes("relampago")&&!a.includes("cone")&&!a.includes("magia")}static renderPortrait(e,a="sb-portrait-wrap"){const o=this.getImage(e,!1),r=this.getImage(e,!0),i=((e==null?void 0:e.name)||"Criatura").replace(/"/g,"&quot;"),t=this.getHeraldry(e),l=this.getCdnFallback(e,!1)||"",u=`
            if (this.dataset.step === 'portrait' && '${r}') {
                this.dataset.step = 'token';
                this.src = '${r}';
            } else if (this.dataset.step !== 'cdn' && '${l}') {
                this.dataset.step = 'cdn';
                this.src = '${l}';
            } else {
                this.style.display = 'none';
                var f = this.parentElement.querySelector('.sb-portrait-fallback');
                if (f) f.style.display = 'flex';
            }
        `.replace(/\s+/g," ");return`
            <div class="${a} relative group">
                <img 
                    src="${o||r||l}" 
                    alt="${i}" 
                    loading="lazy" 
                    data-step="portrait"
                    class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onerror="${u}"
                />
                
                <div class="sb-portrait-fallback w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center" style="display:${o||r?"none":"flex"}; background:${t.bg};">
                    <i class="${t.icon} text-6xl mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" style="color:${t.color};"></i>
                    <span class="font-cinzel text-sm font-black uppercase tracking-wider text-slate-200">${t.label}</span>
                    <span class="text-[0.65rem] text-slate-400 mt-1">D&D 5e SRD</span>
                </div>

                <div class="sb-portrait-vignette pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            </div>
        `}static renderToken(e,a="bc-token-wrap"){const o=this.getImage(e,!0),r=((e==null?void 0:e.name)||"Criatura").replace(/"/g,"&quot;"),i=this.getHeraldry(e),t=this.getCdnFallback(e,!0)||"",l=`
            if (this.dataset.triedCdn !== '1' && '${t}') {
                this.dataset.triedCdn = '1';
                this.src = '${t}';
            } else {
                this.style.display = 'none';
                var f = this.parentElement.querySelector('.bc-token-fallback');
                if (f) f.style.display = 'flex';
            }
        `.replace(/\s+/g," ");return`
            <div class="${a} relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2 border-tomeGold/60 shadow-[0_4px_15px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.6)] bg-slate-950">
                <img 
                    src="${o||t}" 
                    alt="${r}" 
                    loading="lazy" 
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onerror="${l}"
                />
                <div class="bc-token-fallback w-full h-full flex items-center justify-center" style="display:${o?"none":"flex"}; background:${i.bg};">
                    <i class="${i.icon} text-2xl drop-shadow" style="color:${i.color};"></i>
                </div>
            </div>
        `}}export{f as M};
