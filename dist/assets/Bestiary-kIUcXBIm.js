import{d as x,A as we,h as Me,T as y,D as Ce,b as Ae}from"./FXEngine-BKbXWGrS.js";import{u as $e,m as ke}from"./Boot-DdpAL2Fg.js";import{Toast as w}from"./Toast-m0Ci56ke.js";import{M as b}from"./MonsterArt-DEMUppHj.js";const S={"Nível 1":[{name:"Goblin",type:"Humanoide",ac:15,hp:7,damage:"1d6+2",emoji:"👺",actions:[{name:"Cimitarra",bonus:4,damage:"1d6+2"},{name:"Arco Curto",bonus:4,damage:"1d6+2"}]},{name:"Kobold",type:"Humanoide",ac:12,hp:5,damage:"1d4+2",emoji:"🦎",actions:[{name:"Adaga",bonus:4,damage:"1d4+2"},{name:"Funda",bonus:4,damage:"1d4+2"}]},{name:"Esqueleto",type:"Morto-Vivo",ac:13,hp:13,damage:"1d6+2",emoji:"💀",actions:[{name:"Espada Curta",bonus:4,damage:"1d6+2"},{name:"Arco Curto",bonus:4,damage:"1d6+2"}]}],"Nível 2":[{name:"Ogre",type:"Gigante",ac:11,hp:59,damage:"2d8+4",emoji:"👹",actions:[{name:"Clava",bonus:6,damage:"2d8+4"},{name:"Azagaia",bonus:6,damage:"2d6+4"}]},{name:"Grifo",type:"Monstruosidade",ac:12,hp:59,damage:"1d8+4",emoji:"🦅",actions:[{name:"Bico",bonus:6,damage:"1d8+4"},{name:"Garras",bonus:6,damage:"2d6+4"}]},{name:"Cão Infernal",type:"Ínfero",ac:15,hp:45,damage:"1d8+3",emoji:"🐕‍🦺",actions:[{name:"Mordida",bonus:5,damage:"1d8+3"},{name:"Sopro de Fogo",bonus:0,damage:"6d6"}]}],"Nível 3":[{name:"Manticora",type:"Monstruosidade",ac:14,hp:68,damage:"1d8+3",emoji:"🦂",actions:[{name:"Garras",bonus:5,damage:"1d8+3"},{name:"Espinhos",bonus:5,damage:"1d6+3"}]},{name:"Minotauro",type:"Monstruosidade",ac:14,hp:76,damage:"2d12+4",emoji:"🐂",actions:[{name:"Machado Grande",bonus:6,damage:"2d12+4"},{name:"Investida",bonus:6,damage:"2d8+4"}]},{name:"Basilisco",type:"Monstruosidade",ac:15,hp:52,damage:"2d6+3",emoji:"🐍",actions:[{name:"Mordida",bonus:5,damage:"2d6+3"},{name:"Olhar Petrificante",bonus:0,damage:"Petrificação"}]}],"Nível 4":[{name:"Cavaleiro",type:"Humanoide",ac:18,hp:52,damage:"2d6+3",emoji:"⚔️",actions:[{name:"Espada Grande",bonus:5,damage:"2d6+3"},{name:"Ataque Montado",bonus:5,damage:"2d6+5"}]},{name:"Múmia",type:"Morto-Vivo",ac:11,hp:58,damage:"2d6+3",emoji:"🧟",actions:[{name:"Toque Podre",bonus:5,damage:"2d6+3"},{name:"Maldição",bonus:0,damage:"Maldição"}]},{name:"Urso-Coruja",type:"Monstruosidade",ac:13,hp:59,damage:"1d10+5",emoji:"🦉",actions:[{name:"Bico",bonus:7,damage:"1d10+5"},{name:"Garras",bonus:7,damage:"2d8+5"}]}],"Nível 5":[{name:"Troll",type:"Gigante",ac:15,hp:84,damage:"1d6+4",emoji:"👺",actions:[{name:"Mordida",bonus:7,damage:"1d6+4"},{name:"Garras",bonus:7,damage:"2d6+4"}]},{name:"Elemental da Terra",type:"Elemental",ac:17,hp:126,damage:"2d8+5",emoji:"💎",actions:[{name:"Pancada",bonus:8,damage:"2d8+5"},{name:"Terremoto",bonus:0,damage:"3d8"}]},{name:"Vampire Spawn",type:"Morto-Vivo",ac:15,hp:82,damage:"1d8+3",emoji:"🧛",actions:[{name:"Garras",bonus:6,damage:"1d8+3"},{name:"Mordida",bonus:6,damage:"1d6+3"}]}],"Nível 6":[{name:"Gladiador",type:"Humanoide",ac:16,hp:112,damage:"2d6+5",emoji:"🛡️",actions:[{name:"Lança",bonus:9,damage:"2d6+5"},{name:"Escudo",bonus:9,damage:"2d4+5"}]},{name:"Medusa",type:"Monstruosidade",ac:15,hp:127,damage:"1d6+2",emoji:"🐍",actions:[{name:"Serpentes",bonus:5,damage:"1d6+2"},{name:"Olhar Petrificante",bonus:0,damage:"Petrificação CD14"}]},{name:"Ciclope",type:"Gigante",ac:14,hp:138,damage:"3d8+6",emoji:"👁️",actions:[{name:"Clava",bonus:9,damage:"3d8+6"},{name:"Arremesso de Rocha",bonus:9,damage:"3d10+6"}]}],"Nível 7":[{name:"Gigante de Pedra",type:"Gigante",ac:17,hp:126,damage:"3d8+6",emoji:"⛰️",actions:[{name:"Clava",bonus:9,damage:"3d8+6"},{name:"Arremesso de Rocha",bonus:9,damage:"4d10+6"}]},{name:"Dragão Negro Jovem",type:"Dragão",ac:18,hp:127,damage:"2d10+4",emoji:"🐲",actions:[{name:"Mordida",bonus:7,damage:"2d10+4"},{name:"Sopro Ácido",bonus:0,damage:"11d8"}]},{name:"Oni",type:"Gigante",ac:16,hp:110,damage:"2d10+4",emoji:"👹",actions:[{name:"Clava Luar",bonus:7,damage:"2d10+4"},{name:"Cone de Frio",bonus:0,damage:"8d8"}]}],"Nível 8":[{name:"Hydra",type:"Monstruosidade",ac:15,hp:172,damage:"1d10+5",emoji:"🐉",actions:[{name:"Mordida (x5)",bonus:8,damage:"1d10+5"},{name:"Regeneração",bonus:0,damage:"Cura 10/cabeça"}]},{name:"Assasino",type:"Humanoide",ac:15,hp:78,damage:"1d8+3",emoji:"🗡️",actions:[{name:"Espada Curta (x2)",bonus:6,damage:"1d6+3"},{name:"Ataque Furtivo",bonus:0,damage:"7d6"}]},{name:"Gigante de Gelo",type:"Gigante",ac:15,hp:138,damage:"3d12+6",emoji:"❄️",actions:[{name:"Machado Grande",bonus:9,damage:"3d12+6"},{name:"Arremesso de Rocha",bonus:9,damage:"4d10+6"}]}],"Nível 9":[{name:"Quimera",type:"Monstruosidade",ac:14,hp:114,damage:"2d6+4",emoji:"🦁",actions:[{name:"Mordida",bonus:7,damage:"2d6+4"},{name:"Sopro de Fogo",bonus:0,damage:"7d8"}]},{name:"Aboleth",type:"Aberração",ac:17,hp:135,damage:"2d6+5",emoji:"🦑",actions:[{name:"Tentáculo",bonus:9,damage:"2d6+5"},{name:"Escravizar Mente",bonus:0,damage:"Controle CD14"}]},{name:"Treant",type:"Planta",ac:16,hp:138,damage:"3d6+6",emoji:"🌲",actions:[{name:"Pancada",bonus:10,damage:"3d6+6"},{name:"Arremesso de Rocha",bonus:10,damage:"4d10+6"}]}],"Nível 10":[{name:"Dragão Vermelho Jovem",type:"Dragão",ac:18,hp:178,damage:"2d10+6",emoji:"🔥",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida",bonus:10,damage:"2d10+6"},{name:"Sopro de Fogo",bonus:0,damage:"16d6"}]},{name:"Golem de Pedra",type:"Constructo",ac:17,hp:178,damage:"3d10+6",emoji:"🗿",actions:[{name:"Pancada (x2)",bonus:10,damage:"3d10+6"},{name:"Lentidão",bonus:0,damage:"Efeito CD17"}]},{name:"Guardian Naga",type:"Monstruosidade",ac:18,hp:127,damage:"1d8+4",emoji:"🐍",actions:[{name:"Mordida",bonus:8,damage:"1d8+4"},{name:"Magias Divinas",bonus:0,damage:"Variável"}]}],"Nível 11":[{name:"Roc",type:"Monstruosidade",ac:15,hp:248,damage:"2d8+6",emoji:"🦅",actions:[{name:"Bico",bonus:13,damage:"4d8+6"},{name:"Garras",bonus:13,damage:"4d6+6"}]},{name:"Behir",type:"Monstruosidade",ac:17,hp:168,damage:"2d10+6",emoji:"⚡",actions:[{name:"Mordida",bonus:10,damage:"3d10+6"},{name:"Sopro Relâmpago",bonus:0,damage:"12d10"}]},{name:"Gigante de Fogo",type:"Gigante",ac:18,hp:162,damage:"6d6+7",emoji:"🔥",actions:[{name:"Espada Grande",bonus:11,damage:"6d6+7"},{name:"Arremesso de Rocha",bonus:11,damage:"4d10+7"}]}],"Nível 12":[{name:"Arcimago",type:"Humanoide",ac:12,hp:99,damage:"Variável",emoji:"🧙",actions:[{name:"Mísseis Mágicos",bonus:0,damage:"3d10+3"},{name:"Cone de Frio",bonus:0,damage:"8d8"}]},{name:"Erinyes (Diaba)",type:"Ínfero",ac:18,hp:153,damage:"3d8+6",emoji:"😈",actions:[{name:"Espada Longa",bonus:8,damage:"3d8+6"},{name:"Corda de Enredar",bonus:0,damage:"Restringir CD17"}]},{name:"Dragão Azul Jovem",type:"Dragão",ac:18,hp:152,damage:"2d10+5",emoji:"⚡",actions:[{name:"Mordida",bonus:9,damage:"2d10+5"},{name:"Sopro Relâmpago",bonus:0,damage:"12d10"}]}],"Nível 13":[{name:"Dragão Verde Adulto",type:"Dragão",ac:19,hp:207,damage:"2d10+6",emoji:"🐲",actions:[{name:"Mordida",bonus:11,damage:"2d10+6"},{name:"Sopro Venenoso",bonus:0,damage:"12d6"}]},{name:"Golem de Ferro",type:"Constructo",ac:20,hp:210,damage:"3d10+7",emoji:"⚙️",actions:[{name:"Espada",bonus:13,damage:"3d10+7"},{name:"Sopro Venenoso",bonus:0,damage:"10d8"}]},{name:"Nalfeshnee",type:"Demônio",ac:18,hp:184,damage:"Variável",emoji:"👿",actions:[{name:"Mordida",bonus:10,damage:"5d10+5"},{name:"Garras",bonus:10,damage:"3d6+5"}]}],"Nível 14":[{name:"Múmia Lorde",type:"Morto-Vivo",ac:17,hp:97,damage:"3d6+4",emoji:"☥",actions:[{name:"Toque Podre",bonus:9,damage:"3d6+4"},{name:"Maldição da Múmia",bonus:0,damage:"Maldição CD16"}]},{name:"Vampiro (Guerreiro)",type:"Morto-Vivo",ac:16,hp:144,damage:"1d8+4",emoji:"🧛",actions:[{name:"Espada Grande",bonus:9,damage:"2d6+4"},{name:"Mordida Vampírica",bonus:6,damage:"1d6+3"}]},{name:"Death Knight",type:"Morto-Vivo",ac:20,hp:180,damage:"2d6+5",emoji:"⚔️",actions:[{name:"Espada Longa",bonus:11,damage:"2d6+5"},{name:"Bola de Fogo Infernal",bonus:0,damage:"10d6"}]}],"Nível 15":[{name:"Dragão Vermelho Adulto",type:"Dragão",ac:19,hp:256,damage:"2d10+8",emoji:"🔥",actions:[{name:"Mordida",bonus:14,damage:"2d10+8"},{name:"Sopro de Fogo",bonus:0,damage:"18d6"}]},{name:"Marilith",type:"Demônio",ac:18,hp:189,damage:"2d8+4",emoji:"🐍",actions:[{name:"Espada Longa (x6)",bonus:9,damage:"2d8+4"},{name:"Cauda",bonus:9,damage:"2d10+4"}]},{name:"Planetar",type:"Celestial",ac:19,hp:200,damage:"4d6+7",emoji:"👼",actions:[{name:"Espada Grande",bonus:12,damage:"4d6+7"},{name:"Cura Divina",bonus:0,damage:"Cura 6d8+3"}]}],"Nível 16":[{name:"Dragão Azul Adulto",type:"Dragão",ac:19,hp:225,damage:"2d10+7",emoji:"⚡",actions:[{name:"Mordida",bonus:12,damage:"2d10+7"},{name:"Sopro Relâmpago",bonus:0,damage:"16d10"}]},{name:"Goristro",type:"Demônio",ac:19,hp:310,damage:"Variável",emoji:"🐃",actions:[{name:"Chifrada",bonus:13,damage:"7d10+7"},{name:"Pisar",bonus:13,damage:"3d12+7"}]},{name:"Pit Fiend",type:"Diabo",ac:19,hp:300,damage:"Variável",emoji:"😈",actions:[{name:"Mordida",bonus:14,damage:"4d6+8"},{name:"Maça Flamejante",bonus:14,damage:"2d6+8"}]}],"Nível 17":[{name:"Dragão Negro Adulto",type:"Dragão",ac:19,hp:195,damage:"2d10+6",emoji:"🖤",actions:[{name:"Mordida",bonus:11,damage:"2d10+6"},{name:"Sopro Ácido",bonus:0,damage:"14d8"}]},{name:"Androesfinge",type:"Monstruosidade",ac:17,hp:199,damage:"2d10+6",emoji:"🦁",actions:[{name:"Garras",bonus:12,damage:"2d10+6"},{name:"Rugido Aterrorizante",bonus:0,damage:"Medo CD18"}]},{name:"Solar",type:"Celestial",ac:21,hp:243,damage:"4d6+7",emoji:"☀️",actions:[{name:"Espada Grande",bonus:15,damage:"4d6+7"},{name:"Flecha Matadora",bonus:13,damage:"2d8+6"}]}],"Nível 18":[{name:"Demilich",type:"Morto-Vivo",ac:20,hp:80,damage:"Variável",emoji:"💀",actions:[{name:"Drenar Vida",bonus:0,damage:"6d6 necrótico"},{name:"Uivo",bonus:0,damage:"Medo + 40 HP CD15"}]},{name:"Dragão Branco Antigo",type:"Dragão",ac:20,hp:333,damage:"2d10+8",emoji:"❄️",actions:[{name:"Mordida",bonus:14,damage:"2d10+8"},{name:"Sopro Glacial",bonus:0,damage:"16d8"}]},{name:"Balor",type:"Demônio",ac:19,hp:262,damage:"3d8+8",emoji:"🔥",actions:[{name:"Espada Flamejante",bonus:14,damage:"3d8+8"},{name:"Chicote de Fogo",bonus:14,damage:"2d6+8"}]}],"Nível 19":[{name:"Dragão Verde Antigo",type:"Dragão",ac:21,hp:385,damage:"2d10+8",emoji:"🌿",actions:[{name:"Mordida",bonus:15,damage:"2d10+8"},{name:"Sopro Venenoso",bonus:0,damage:"22d6"}]},{name:"Dragão Azul Antigo",type:"Dragão",ac:22,hp:481,damage:"2d10+9",emoji:"⚡",actions:[{name:"Mordida",bonus:16,damage:"2d10+9"},{name:"Sopro Relâmpago",bonus:0,damage:"16d10"}]},{name:"Empyrean",type:"Celestial",ac:22,hp:313,damage:"3d8+10",emoji:"⭐",actions:[{name:"Maça Colossal",bonus:17,damage:"3d8+10"},{name:"Raio de Trovão",bonus:0,damage:"7d6 trovão"}]}],"Nível 20":[{name:"Dragão Vermelho Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"🐉",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida",bonus:17,damage:"2d10+10"},{name:"Sopro de Fogo",bonus:0,damage:"26d6"}]},{name:"Dragão Dourado Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"✨",actions:[{name:"Mordida",bonus:17,damage:"2d10+10"},{name:"Sopro de Fogo",bonus:0,damage:"13d10"}]},{name:"Kraken",type:"Monstruosidade",ac:18,hp:472,damage:"3d10+10",emoji:"🐙",img:"assets/sprites/boss_kraken.png",actions:[{name:"Tentáculo (x3)",bonus:17,damage:"3d10+10"},{name:"Tempestade Relâmpago",bonus:0,damage:"22d6"}]}],BOSS:[{name:"Tiamat (Avatar)",type:"Divindade",ac:25,hp:615,damage:"4d10+10",emoji:"🐉",img:"assets/sprites/boss_tiamat.png",actions:[{name:"5 Mordidas",bonus:19,damage:"4d10+10"},{name:"5 Sopros Elementais",bonus:0,damage:"Variável"}]},{name:"Tarrasque",type:"Monstruosidade",ac:25,hp:676,damage:"4d12+10",emoji:"🦖",img:"assets/sprites/boss_tarrasque.png",actions:[{name:"Mordida",bonus:19,damage:"4d12+10"},{name:"Engolir",bonus:19,damage:"16d6 ácido"}]},{name:"Lich Supremo",type:"Morto-Vivo",ac:17,hp:250,damage:"Variável",emoji:"👑",img:"assets/sprites/boss_lich_king.png",actions:[{name:"Palavra de Poder: Matar",bonus:12,damage:"100"},{name:"Desintegrar",bonus:0,damage:"10d6+40"}]},{name:"Kraken Abissal",type:"Aberração",ac:18,hp:472,damage:"3d10+10",emoji:"🌊",img:"assets/sprites/boss_kraken.png",actions:[{name:"Tentáculo (x3)",bonus:17,damage:"3d10+10"},{name:"Tempestade",bonus:0,damage:"22d6 relâmpago"}]},{name:"Beholder Tirano",type:"Aberração",ac:18,hp:250,damage:"Variável",emoji:"👁️",img:"assets/sprites/boss_beholder.png",actions:[{name:"Mordida",bonus:5,damage:"4d6"},{name:"Raios Oculares (x3)",bonus:0,damage:"Variável CD16"}]},{name:"Dragão Sombrio Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"🖤",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida Sombria",bonus:17,damage:"2d10+10"},{name:"Sopro Necrótico",bonus:0,damage:"26d6 necrótico"}]},{name:"Demogorgon",type:"Demônio",ac:22,hp:496,damage:"3d12+8",emoji:"👿",actions:[{name:"Tentáculos (x2)",bonus:17,damage:"3d12+8"},{name:"Olhar da Loucura",bonus:0,damage:"Insanidade CD23"}]},{name:"Senhor Vampírico",type:"Morto-Vivo",ac:20,hp:350,damage:"3d8+7",emoji:"🩸",actions:[{name:"Garras Sombrias",bonus:13,damage:"3d8+7"},{name:"Drenar Essência",bonus:0,damage:"10d6 necrótico CD19"}]}]};function je(C){var B;const F=$e(),[De,Se]=x(null),[p,L]=x("Nível 1"),[T,P]=x(""),[Te,Re]=x("grid"),[m,M]=x(null),[q,R]=x(!1),[H,A]=x(!1),[d,$]=x(null),[E,h]=x(null),[U,Ee]=x("normal"),[,J]=x(0),g=()=>J(e=>e+1),j=we(null),K=e=>{const a=e.target.closest("[data-action]");if(a){const t=a.dataset.action;t==="selectLevel"&&re(e,a),t==="viewCreature"&&ge(e,a),t==="spawnCreature"&&be(e,a),t==="spawnFromDetail"&&xe(),t==="deleteCustomMonster"&&fe(e,a),t==="addCustomMonster"&&ve(),t==="triggerImportJSON"&&ye(),t==="rollBestiaryAttack"&&ie(e,a),t==="proceedToDamage"&&le(),t==="applyVisualRollResult"&&me(),t==="closeVisualRoll"&&ce(),t==="closeForgeModal"&&ee(),t==="forgeCustomMonster"&&forgeCustomMonster(e,a),t==="backToGrid"&&ue(),t==="openArtModal"&&ae(e,a),t==="closeArtModal"&&te(),t==="saveArtModal"&&oe(),t==="resetArtToDefault"&&se()}},G={hit:["A lâmina corta o ar com precisão!","Um golpe certeiro nas defesas do inimigo!","O impacto ressoa por toda a biblioteca!","Sangue e faíscas voam com o acerto!","O ataque encontra uma brecha na armadura!"],miss:["O golpe passa raspando!","A defesa se mantém impenetrável.","O monstro vacila por um momento...","O ataque atinge apenas o vácuo.","Um desvio ágil no último segundo!"],crit:["UM GOLPE LENDÁRIO! A criatura cambaleia!","PERFEIÇÃO TÁTICA! O dano é devastador!","A força do destino guia esta arma!"]},O=((B=window.TOME)==null?void 0:B.store)||{state:F},_=e=>j.current?j.current.querySelector(e):null;function k(){const e=O.state.monsterOverrides||{},a=(S[p]||[]).map(o=>e[o.name]?{...o,...e[o.name]}:o);return[...(O.state.customMonsters||[]).filter(o=>o.level===p||o.cr===p||!o.level&&p==="Nível 1").map(o=>e[o.name]?{...o,...e[o.name]}:o),...a]}function I(e,a,t=0){const o=G[e][Math.floor(Math.random()*G[e].length)];return e==="hit"||e==="crit"?`${o} <br> ⚔️ <strong>${a}</strong> sofre <strong>${t}</strong> de dano!`:`${o} <br> 🛡️ <strong>${a}</strong> escapa ileso!`}function N(e){if(e.actions&&e.actions.length>0)return e.actions.map(r=>({name:r.name||"Ataque",bonus:r.bonus!==void 0?r.bonus:r.hit!==void 0?r.hit:4,damage:r.damage||r.dmg||"1d8+2",desc:r.desc||r.description||`Ataque especial causando ${r.damage||r.dmg||"1d8+2"} de dano.`}));const a=(e.name||"").toLowerCase();let t=2;const o=String(e.level||e.cr||"Nível 1");if(o.includes("BOSS"))t=6;else{const r=parseInt(o.replace(/\D/g,""))||1;r>=17?t=6:r>=13?t=5:r>=9?t=4:r>=5&&(t=3)}const n=primaryMod+t;let s="1d6",i=primaryMod>=0?`+${primaryMod}`:`${primaryMod}`;if(o.includes("BOSS"))s="4d10";else{const r=parseInt(o.replace(/\D/g,""))||1;r>=17?s="4d8":r>=13?s="3d8":r>=9?s="2d10":r>=5?s="2d6":r>=3?s="1d10":r>=2&&(s="1d8")}const l=`${s}${primaryMod!==0?i:""}`;let f="Ataque Corporal",v="Ataque de Garra";return a.includes("lobo")||a.includes("werewolf")||a.includes("cão")||a.includes("dragão")||a.includes("dragon")?(f="Mordida",v="Garras"):a.includes("esqueleto")||a.includes("goblin")||a.includes("orc")||a.includes("humano")?(f="Espada Curta",v="Arco Curto"):(a.includes("mago")||a.includes("bruxo")||a.includes("spell"))&&(f="Disparo Místico",v="Cajado"),[{name:f,bonus:n,damage:l,desc:`Ataque corporal com bônus de +${n} e dano de ${l}.`},{name:v,bonus:n,damage:s,desc:`Ataque rápido com bônus de +${n} e dano de ${s}.`}]}Me(()=>(C.onMount&&C.onMount(),()=>{C.onUnmount&&C.onUnmount()}),[]);function Q(){const e=Object.keys(S),t=k().filter(s=>s.name.toLowerCase().includes(T.toLowerCase())),o=p==="BOSS";return`
            
            <style>
                @keyframes diceSpin {
                    0% { transform: rotate(0deg) scale(0.6); opacity: 0; }
                    30% { transform: rotate(360deg) scale(1.2); opacity: 1; }
                    60% { transform: rotate(720deg) scale(0.9); }
                    100% { transform: rotate(1080deg) scale(1); }
                }

                @keyframes diceShake {
                    0% { transform: translate(2px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(0px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(2px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(2px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }

                .dice-preview-box {
                    font-size: 4rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 120px;
                    color: var(--accent);
                    text-shadow: 0 0 20px rgba(197, 160, 89, 0.5);
                }

                .dice-preview-box.spinning {
                    animation: diceSpin 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .dice-preview-box.shaking {
                    animation: diceShake 0.6s infinite linear;
                    color: var(--danger);
                }
            </style>
        
            <div class="page bestiary animate-fadeIn" style="max-width:1400px; padding:20px;">
                <!-- HEADER -->
                <div class="section-header" style="flex-wrap:wrap; gap:15px; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:20px; margin-bottom:20px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);"><i class="fa-solid fa-book-skull" style="margin-right:12px;"></i> Bestiário Arcano</h2>
                        <p class="section-subtitle" style="color:var(--text-dim);">Biblioteca de criaturas e ameaças lendárias.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <div style="position:relative; margin-right: 10px;">
                            <i class="fa-solid fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--accent); opacity:0.7;"></i>
                            <input type="text" class="legacy-input" placeholder="Buscar criatura..." value="${T}"
                                   style="min-width:250px; padding-left:35px !important; border-radius:20px !important; background:rgba(0,0,0,0.5) !important;"
                                   oninput="closest('.bestiary').__component._doSearch(value)">
                        </div>
                        
                        <button class="btn btn-ghost" data-action="triggerImportJSON" style="border-radius:20px; border:1px solid rgba(255,255,255,0.15); padding:8px 20px; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-file-import"></i> Importar JSON
                        </button>
                        <input type="file" id="bestiary-json-input" style="display:none;" accept=".json" multiple>
                        
                        <button class="btn btn-primary" data-action="addCustomMonster" style="border-radius:20px; padding:8px 20px; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-hammer"></i> Forjar Monstro
                        </button>
                    </div>
                </div>

                <!-- LEVEL FILTER BAR -->
                <div style="display:flex; overflow-x:auto; gap:10px; padding-bottom:15px; margin-bottom:20px; scrollbar-width:thin;">
                    ${e.map(s=>{const i=p===s,l=s==="BOSS";return`
                            <button class="btn ${i?l?"btn-danger":"btn-primary":"btn-ghost"}"
                                    style="border-radius:20px; padding:6px 16px; white-space:nowrap; border:1px solid ${i?"transparent":"rgba(255,255,255,0.1)"}; ${l&&!i?"color:var(--danger); border-color:var(--danger);":""}"
                                    data-action="selectLevel" data-level="${s}">
                                ${l?'<i class="fa-solid fa-skull-crossbones" style="margin-right:6px;"></i>':""}
                                ${s}
                            </button>
                        `}).join("")}
                </div>

                <!-- MAIN CONTENT -->
                ${m?W(m,o):X(t,o)}
                
                <!-- FORGE MODAL -->
                ${q?Z():""}

                <!-- VISUAL DYNAMIC DICE ROLLER OVERLAY -->
                ${E?pe():""}

                <!-- CUSTOM ART MODAL -->
                ${H?ne():""}
            </div>
        `}function X(e,a){return e.length===0?`
                <div class="card empty-state" style="height:40vh; border-color:var(--danger); background:rgba(255,0,0,0.02);">
                    <i class="fa-solid fa-dragon fa-3x" style="opacity:0.2; margin-bottom:20px; color:var(--danger);"></i>
                    <h3 style="font-family:'Cinzel';">Santuário Vazio</h3>
                    <p style="color:var(--text-dim);">Nenhuma criatura deste poder foi encontrada.</p>
                </div>
            `:`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                ${e.map((t,o)=>Y(t,o,a)).join("")}
            </div>
        `}function Y(e,a,t){const o=a*.04,n=e.id&&String(e.id).startsWith("custom_"),s=b.renderToken(e,"w-24 h-24"),l=String(e.level||e.cr||1).replace(/\D/g,"")||1;return`
            <div class="card bestiary-card-premium group hover:border-amber-400/80 transition-all duration-300 cursor-pointer"
                 style="animation: fadeIn 0.4s ease-out ${o}s both;"
                 data-action="viewCreature" data-name="${e.name}">
                
                <div class="bc-inner relative overflow-hidden rounded-xl bg-slate-900/95 border border-tomeGold/30 hover:shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(197,160,89,0.2)] transition-all">
                    <!-- Badges -->
                    <span class="bc-badge level">Nível ${l}</span>
                    ${t?'<span class="bc-badge boss">Boss</span>':""}
                    ${n?'<span class="bc-badge forged">Forjado</span>':""}

                    <!-- Top Banner -->
                    <div class="bc-top-banner text-center py-2 px-3 border-b border-tomeGold/20 bg-slate-950/60">
                        <h4 class="bc-name text-amber-300 font-cinzel font-bold text-sm truncate m-0 drop-shadow">${e.name}</h4>
                    </div>
                    
                    <!-- Token Image Container with Metallic Frame -->
                    <div class="bc-portrait flex items-center justify-center p-4 min-h-[140px] bg-gradient-to-b from-black/40 via-slate-950/60 to-black/40">
                        <div class="w-24 h-24 relative flex items-center justify-center">
                            ${s}
                        </div>
                    </div>

                    <!-- Bottom Banner (Type & Actions) -->
                    <div class="bc-bottom-banner creature-action-btn flex justify-between items-center px-3 py-2 bg-slate-950/80 border-t border-tomeGold/20">
                        <div class="bc-type text-slate-400 text-[0.7rem] font-bold uppercase truncate max-w-[110px]">${e.type||"Monstro"}</div>
                        <div class="bc-actions-bar flex items-center gap-1.5">
                            <button class="btn btn-sm text-[0.7rem] font-cinzel font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-tomeGold/40 rounded shadow cursor-pointer" onclick="event.stopPropagation(); closest('.bestiary-card-premium').click();">
                                FICHA
                            </button>
                            <button class="btn btn-sm px-2 py-1 bg-red-900/80 hover:bg-red-800 text-white rounded border border-red-500/40 cursor-pointer shadow" data-action="spawnCreature" data-name="${e.name}" title="Invocar no Mapa">
                                <i class="fa-solid fa-swords text-xs"></i>
                            </button>
                            ${n?`<button class="btn btn-sm px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-700/50 cursor-pointer" data-action="deleteCustomMonster" data-id="${e.id}" title="Excluir"><i class="fa-solid fa-trash-can text-xs"></i></button>`:""}
                        </div>
                    </div>

                    <!-- Floating Stats Box (Bottom Right) -->
                    <div class="bc-stats-box">
                        <div class="stat-line ac"><i class="fa-solid fa-shield-halved"></i> ${e.ac}</div>
                        <div class="stat-divider"></div>
                        <div class="stat-line hp"><i class="fa-solid fa-heart"></i> ${e.hp}</div>
                    </div>
                </div>

            </div>
        `}function W(e,a){const t=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},o=N(e),n={str:"FOR",dex:"DES",con:"CON",int:"INT",wis:"SAB",cha:"CAR"},s=u=>Math.floor((u-10)/2),i=u=>{const c=(u.name||"").toLowerCase();return c.includes("sopro")||c.includes("fogo")||c.includes("gelo")||c.includes("relampago")||c.includes("relâmpago")?"Elemental":c.includes("mordida")||c.includes("garra")||c.includes("bico")?"Slashing":"Bludgeoning"},l=o.slice(0,4).map((u,c)=>`
                <div class="sb-action-card p-3 rounded-xl bg-slate-900/90 border border-tomeGold/30 flex flex-col justify-between shadow-md">
                    <h4 class="m-0 text-sm font-cinzel font-bold text-amber-300 flex items-center gap-2 mb-1.5">
                        <i class="fa-solid ${b.isMeleeAction(u)?"fa-swords":"fa-wand-sparkles"} text-red-400"></i> ${u.name}
                    </h4>
                    <div class="sb-action-stat text-xs text-slate-300 mb-2 leading-relaxed">
                        <strong class="text-amber-400">+${u.bonus||0}</strong> para atingir ·
                        <strong class="text-red-400">${(u.damage||"1d6").toUpperCase()}</strong> ${i(u)} DMG
                    </div>
                    <button type="button" class="sb-action-roll w-full py-1.5 px-3 text-xs font-bold font-outfit uppercase tracking-wider bg-red-900/80 hover:bg-red-800 text-white rounded-lg border border-red-500/50 cursor-pointer transition-colors shadow" data-action="rollBestiaryAttack" data-index="${c}">
                        <i class="fa-solid fa-dice-d20 mr-1"></i> Rolar Ataque
                    </button>
                </div>`).join(""),f=Object.entries(t).map(([u,c])=>{const D=s(c);return`
                <div class="sb-ability p-3 rounded-xl bg-slate-900/90 border border-tomeGold/30 text-center shadow-md">
                    <div class="sb-ability-mod text-xl font-black text-amber-400 leading-none">${D>=0?"+":""}${D}</div>
                    <div class="sb-ability-score text-xs font-bold text-slate-400 mt-1 mb-1">${c}</div>
                    <div class="sb-ability-name text-[0.7rem] font-bold text-tomeGold uppercase tracking-wider">${n[u]||u.toUpperCase()}</div>
                </div>`}).join(""),v=e.notes||e.traits||"",r=v?`<div class="sb-trait-title font-cinzel font-bold text-amber-300 text-sm mb-1">${v.split(/[.!]/)[0]}</div><p class="text-xs text-slate-300 leading-relaxed">${v}</p>`:`<p class="text-xs text-slate-300 leading-relaxed"><strong>Percepção Passiva</strong> ${10+s(t.wis)} · <strong>Idiomas</strong> Comum</p>`,he=e.description||e.lore?`
            <div style="padding: 15px 25px; font-family: 'Cinzel', serif; font-style: italic; font-size: 0.95rem; color: #cbd5e1; text-align: center; line-height: 1.6; border-bottom: 1px dashed rgba(197,160,89,0.3); margin-bottom: 15px; background: rgba(0,0,0,0.2);">
                "${e.description||e.lore}"
            </div>
        `:"";return`
            <div class="animate-fadeIn max-w-[960px] mx-auto pb-10">
                <button class="btn inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-xl bg-slate-900 border border-tomeGold/40 hover:border-amber-400 text-slate-200 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10" data-action="backToGrid">
                    <i class="fa-solid fa-arrow-left"></i> Voltar ao Bestiário
                </button>

                <div class="bestiary-statblock ${a?"is-boss border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)]":"border-tomeGold/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(197,160,89,0.15)]"} bg-slate-950/95 border-2 rounded-2xl overflow-hidden backdrop-blur-md">
                    <header class="sb-header bg-gradient-to-b from-slate-900 to-slate-950 border-b border-tomeGold/30 p-6 text-center">
                        <h1 class="sb-name font-cinzel text-3xl md:text-4xl font-black text-amber-300 uppercase tracking-widest m-0 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">${e.name}</h1>
                        <p class="sb-subtitle font-outfit text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">${b.getSubtitle(e,p)}</p>
                    </header>
                    ${he}

                    <div class="sb-class-bar mx-5 my-4 px-4 py-2 rounded-lg bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-tomeGold/40 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200 shadow">
                        <span class="text-amber-200">${b.getClassification(e)}</span>
                        <span class="sb-cr px-3 py-1 rounded bg-black/60 border border-tomeGold/40 text-amber-400 font-extrabold">${b.getCrDisplay(p)}</span>
                    </div>

                    <div class="sb-hero grid grid-cols-1 md:grid-cols-[130px_1fr_260px] gap-5 p-5 min-h-[300px]">
                        <div class="sb-side-left flex flex-col gap-3">
                            <div class="sb-vital-box ac p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 text-center shadow-md">
                                <i class="fa-solid fa-shield-halved text-xl text-slate-400 mb-1 block"></i>
                                <div class="sb-vital-value text-3xl font-black text-white leading-none">${e.ac}</div>
                                <div class="sb-vital-label text-[0.65rem] font-bold text-slate-400 uppercase mt-1">Classe de Armadura</div>
                            </div>
                            <div class="sb-vital-box hp p-4 rounded-xl bg-slate-900/90 border border-red-900/60 text-center shadow-md">
                                <i class="fa-solid fa-heart text-xl text-red-500 mb-1 block"></i>
                                <div class="sb-vital-value text-3xl font-black text-red-400 leading-none">${e.hp}</div>
                                <div class="sb-vital-label text-[0.65rem] font-bold text-red-300 uppercase mt-1">Pontos de Vida</div>
                            </div>
                            <div class="sb-vital-box spd p-4 rounded-xl bg-slate-900/90 border border-emerald-900/60 text-center shadow-md">
                                <i class="fa-solid fa-person-running text-xl text-emerald-400 mb-1 block"></i>
                                <div class="sb-vital-value text-2xl font-black text-emerald-300 leading-none">${b.getSpeed(e).replace(" ft.","")} ft</div>
                                <div class="sb-vital-label text-[0.65rem] font-bold text-emerald-400 uppercase mt-1">Deslocamento</div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            ${b.renderPortrait(e,"sb-portrait-wrap border-2 border-tomeGold/40 rounded-xl overflow-hidden bg-black/40 min-h-[260px] flex items-center justify-center relative shadow-lg")}
                            <button type="button" class="btn btn-ghost btn-sm text-xs font-bold text-amber-300 hover:text-amber-200 border border-tomeGold/40 hover:border-amber-400 bg-slate-900/90 hover:bg-slate-800 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow" data-action="openArtModal" data-name="${e.name}">
                                <i class="fa-solid fa-palette text-amber-400"></i> Trocar Arte do Monstro
                            </button>
                        </div>

                        <div class="sb-side-right flex flex-col gap-3">
                            <div class="sb-multi-box p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase text-center shadow">
                                Multi-Atk<br><span class="text-[0.7rem] text-slate-300">${b.getMultiattackSummary(o)}</span>
                            </div>
                            ${l}
                        </div>
                    </div>

                    <div class="sb-abilities grid grid-cols-3 sm:grid-cols-6 gap-3 px-5 pb-5">${f}</div>

                    <div class="sb-traits mx-5 mb-5 p-4 rounded-xl bg-slate-900/80 border border-tomeGold/30">
                        <p class="text-xs text-slate-300 mb-2 font-medium">
                            <strong class="text-amber-400">ND:</strong> ${p.replace("Nível ","")} · 
                            <strong class="text-amber-400">Tipo:</strong> ${e.type||"Monstro"}
                        </p>
                        ${r}
                    </div>

                    ${a?'<div class="sb-boss-banner mx-5 mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-center font-cinzel font-bold text-sm uppercase tracking-widest shadow">👑 Criatura Lendária</div>':""}

                    <footer class="sb-footer border-t border-tomeGold/30 p-5 bg-slate-900/60 flex flex-wrap justify-between items-center gap-4">
                        <div class="sb-test-ac flex items-center gap-2 text-xs font-bold text-slate-300">
                            <span>CA de teste:</span>
                            <input type="number" id="bestiary-test-ac" value="13" min="1" max="30" class="w-14 text-center bg-black/50 border border-slate-700 rounded p-1 text-white font-bold">
                        </div>
                        <button class="btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white font-cinzel font-bold text-xs uppercase tracking-wider border border-amber-400/50 cursor-pointer shadow-lg hover:shadow-red-500/20 transition-all" data-action="spawnFromDetail">
                            <i class="fa-solid fa-swords text-amber-400"></i> Invocação Direta
                        </button>
                    </footer>
                </div>
            </div>
        `}function Z(){return`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:650px; width:100%; padding:30px; border:2px solid var(--accent); max-height: 90vh; overflow-y: auto;">
                    <h2 style="font-family:'Cinzel'; color:var(--accent); margin-top:0; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:10px;"><i class="fa-solid fa-hammer"></i> Forjar Nova Criatura</h2>
                    
                    <form id="forge-monster-form" onsubmit="event.preventDefault(); closest('.bestiary').__component.saveForgedMonster(this);">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Nome da Ameaça</small>
                                <input class="legacy-input" name="name" required placeholder="Ex: Dragão de Cinzas" style="width:100%;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Tipo de Criatura</small>
                                <input class="legacy-input" name="type" placeholder="Ex: Dragão, Humanoide" style="width:100%;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Categoria / Nível</small>
                                <select class="legacy-input" name="level" style="width:100%; background: #1a1a1f; color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 6px;">
                                    ${Object.keys(S).map(a=>`<option value="${a}">${a}</option>`).join("")}
                                </select>
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Classe de Armadura (CA)</small>
                                <input class="legacy-input" type="number" name="ac" value="10" min="1" max="40" style="width:100%;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Pontos de Vida (HP)</small>
                                <input class="legacy-input" type="number" name="hp" value="10" min="1" max="1000" style="width:100%;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Emoji Representativo</small>
                                <input class="legacy-input" name="emoji" value="👿" placeholder="👿" style="width:100%; text-align:center;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Imagem Sprite (URL)</small>
                                <input class="legacy-input" name="img" placeholder="https://..." style="width:100%;">
                            </div>
                        </div>

                        <h4 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:10px;">Atributos Básicos</h4>
                        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px; margin-bottom:20px; text-align:center;">
                            <div><small style="color:var(--text-dim);">FOR</small><input class="legacy-input" type="number" name="stat_str" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">DES</small><input class="legacy-input" type="number" name="stat_dex" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">CON</small><input class="legacy-input" type="number" name="stat_con" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">INT</small><input class="legacy-input" type="number" name="stat_int" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">SAB</small><input class="legacy-input" type="number" name="stat_wis" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">CAR</small><input class="legacy-input" type="number" name="stat_cha" value="10" style="width:100%; text-align:center;"></div>
                        </div>

                        <h4 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:10px;">Ação Principal de Combate</h4>
                        <div style="display:grid; grid-template-columns: 1.5fr 80px 1.2fr; gap:10px; margin-bottom:25px;">
                            <input class="legacy-input" name="action_name" placeholder="Nome: Garra, Sopro" style="width:100%;">
                            <input class="legacy-input" type="number" name="action_bonus" value="4" placeholder="+4" style="width:100%; text-align:center;">
                            <input class="legacy-input" name="action_damage" placeholder="Dano: 2d6+2" style="width:100%;">
                        </div>

                        <div style="display:flex; gap:15px; justify-content:flex-end; border-top:1px solid rgba(197,160,89,0.3); padding-top:20px;">
                            <button type="button" class="btn btn-ghost" onclick="closest('.bestiary').__component.closeForgeModal()">CANCELAR</button>
                            <button type="submit" class="btn btn-primary">FORJAR CRIATURA</button>
                        </div>
                    </form>
                </div>
            </div>
        `}function ee(){R(!1),g()}function ae(e,a){const t=a.dataset.name||(m==null?void 0:m.name),n=k().find(s=>s.name===t)||m;n&&($(n),A(!0),g())}function te(){A(!1),$(null),g()}async function oe(e,a){if(!d)return;const t=d.name,o=document.getElementById("art-modal-file-input");if(o&&o.files&&o.files[0]){const s=o.files[0],i=new FormData;i.append("imageFile",s),w.show("Enviando arte da criatura...","info");try{const l=localStorage.getItem("token")||"",f=l?{Authorization:`Bearer ${l}`}:{},r=await(await fetch("/api/upload",{method:"POST",headers:f,body:i})).json();if(r&&r.url){z(t,r.url);return}}catch(l){console.error("Falha no upload:",l),w.show("Erro ao enviar imagem. Verifique o arquivo.","danger");return}}const n=document.getElementById("art-modal-url-input");if(n&&n.value.trim()){z(t,n.value.trim());return}w.show("Escolha um arquivo ou insira uma URL de imagem.","warning")}function z(e,a){y.store.update(t=>{t.monsterOverrides||(t.monsterOverrides={}),t.monsterOverrides[e]={...t.monsterOverrides[e]||{},customImg:a,img:a}}),m&&m.name===e&&M({...m,customImg:a,img:a}),w.show(`🎨 Ilustração de <strong>${e}</strong> atualizada com sucesso!`,"success"),A(!1),$(null),g()}function se(){if(!d)return;const e=d.name;if(y.store.update(a=>{var t;(t=a.monsterOverrides)!=null&&t[e]&&(delete a.monsterOverrides[e].customImg,delete a.monsterOverrides[e].img)}),m&&m.name===e){const a={...m};delete a.customImg,delete a.img,M(a)}w.show(`✨ Arte de <strong>${e}</strong> restaurada para o padrão oficial 5e!`,"info"),A(!1),$(null),g()}function ne(){if(!d)return"";const e=b.getImage(d,!1),a=b.getImage(d,!0),t=b.getCdnFallback(d,!1),o=!!(d.customImg||d.img&&!d.img.includes("/assets/sprites/"));return`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:4500; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); padding:20px;">
                <div class="card glass-accent animate-scaleIn bg-slate-900 border-2 border-tomeGold/50 rounded-2xl p-6 max-w-[520px] w-full shadow-2xl text-left" style="background:#0f172a;">
                    <div class="flex justify-between items-center border-b border-tomeGold/30 pb-3 mb-4">
                        <h3 class="font-cinzel text-lg font-bold text-amber-300 m-0 flex items-center gap-2">
                            <i class="fa-solid fa-palette text-amber-400"></i> Trocar Arte: ${d.name}
                        </h3>
                        <button type="button" class="btn btn-ghost text-slate-400 hover:text-white p-1 text-lg leading-none cursor-pointer" data-action="closeArtModal">✕</button>
                    </div>

                    <!-- Visualização Atual -->
                    <div class="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-700/60 mb-5">
                        <div class="w-16 h-16 rounded-xl overflow-hidden border border-tomeGold/40 bg-black flex items-center justify-center shrink-0">
                            <img src="${e||a||t}" alt="${d.name}" class="w-full h-full object-cover object-top" id="art-preview-img" onerror="this.style.display='none';">
                        </div>
                        <div class="flex-1 text-xs">
                            <div class="text-amber-200 font-bold uppercase tracking-wider">${d.name}</div>
                            <div class="text-slate-400 mt-0.5">${d.type||"Monstro"} · ${p}</div>
                            <div class="mt-1 text-[0.7rem] ${o?"text-amber-400 font-bold":"text-emerald-400 font-bold"}">
                                <i class="fa-solid ${o?"fa-pen-to-square":"fa-certificate"} mr-1"></i>
                                ${o?"Arte personalizada ativa":"Arte oficial Monster Manual 5e"}
                            </div>
                        </div>
                    </div>

                    <!-- Opção 1: Enviar Arquivo do Computador -->
                    <div class="mb-4">
                        <label class="text-xs font-bold font-cinzel text-slate-300 block mb-1.5">
                            <i class="fa-solid fa-cloud-arrow-up mr-1 text-amber-400"></i> 1. Enviar Arquivo do Computador
                        </label>
                        <div class="border-2 border-dashed border-tomeGold/40 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors" onclick="document.getElementById('art-modal-file-input').click();">
                            <i class="fa-solid fa-file-image text-2xl text-slate-400 mb-1 block"></i>
                            <span class="text-xs text-slate-300 font-medium block">Clique para escolher imagem do computador</span>
                            <span class="text-[0.65rem] text-slate-500 block mt-0.5" id="art-modal-file-name">Suporta PNG, JPG, WebP (tokens ou retratos)</span>
                            <input type="file" id="art-modal-file-input" style="display:none;" accept="image/*" onchange="
                                if (this.files && this.files[0]) {
                                    document.getElementById('art-modal-file-name').innerText = 'Selecionado: ' + this.files[0].name;
                                    var preview = document.getElementById('art-preview-img');
                                    if (preview) { preview.src = URL.createObjectURL(this.files[0]); preview.style.display = 'block'; }
                                }
                            ">
                        </div>
                    </div>

                    <!-- Opção 2: URL Direta -->
                    <div class="mb-6">
                        <label class="text-xs font-bold font-cinzel text-slate-300 block mb-1.5">
                            <i class="fa-solid fa-link mr-1 text-amber-400"></i> 2. Ou cole um link de imagem (URL)
                        </label>
                        <input type="url" id="art-modal-url-input" class="legacy-input w-full bg-slate-950 border border-slate-700/60 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none" placeholder="https://exemplo.com/minha-arte.png" value="${o?d.customImg||d.img:""}" oninput="
                            var preview = document.getElementById('art-preview-img');
                            if (preview && this.value.trim()) { preview.src = this.value.trim(); preview.style.display = 'block'; }
                        ">
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex justify-between items-center gap-3 border-t border-tomeGold/20 pt-4">
                        <button type="button" class="btn btn-ghost text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 cursor-pointer" data-action="resetArtToDefault">
                            <i class="fa-solid fa-rotate-left mr-1"></i> Restaurar Oficial 5e
                        </button>
                        <div class="flex gap-2">
                            <button type="button" class="btn btn-ghost text-xs text-slate-400 hover:text-white rounded-lg px-4 py-2 cursor-pointer" data-action="closeArtModal">CANCELAR</button>
                            <button type="button" class="btn btn-primary text-xs font-bold px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg cursor-pointer" data-action="saveArtModal">SALVAR ARTE</button>
                        </div>
                    </div>
                </div>
            </div>
        `}function re(e,a){L(a.dataset.level),M(null),P(""),g()}function ie(e,a){const t=parseInt(a.dataset.index),o=m;if(!o)return;const s=N(o)[t];if(!s)return;const i=_("#bestiary-test-ac"),l=i&&parseInt(i.value)||13,f={name:o.name,emoji:o.emoji||"🐾"};de(f,{name:"Alvo de Treino",ac:l},s)}function de(e,a,t){const o={stage:"d20",rolling:!0,attacker:e,target:a,action:t,d20Roll:null,d20Total:null,isCrit:!1,isHit:!1,damageNotation:t.damage||"1d6",damageRolls:[],damageTotal:null,narrativeText:""};h(o),y.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3"),setTimeout(()=>{const n=Ae.checkHit(t.bonus||0,a.ac||10,U);let s="";n.success?y.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3"):(y.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"),s=I("miss",a.name)),h(i=>i?{...i,rolling:!1,d20Roll:n.roll,d20Total:n.total,isCrit:n.isCrit,isHit:n.success,narrativeText:s}:null)},1100)}function le(){h(e=>e?{...e,stage:"damage"}:null),y.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3"),setTimeout(()=>{h(e=>{var s,i;if(!e)return null;const a=((s=e.action)==null?void 0:s.damage)||"1d6",t=Ce.roll(a);let o=e.isCrit?t.total*2:t.total;isNaN(o)&&(o=4);const n=I(e.isCrit?"crit":"hit",((i=e.target)==null?void 0:i.name)||"Alvo",o);return{...e,stage:"complete",damageRolls:t.rolls||[o],damageTotal:o,narrativeText:n}})},1100)}function me(){h(null),g()}function ce(){h(null),g()}function pe(){const e=E,a=e.stage==="d20",t=e.stage==="damage",o=e.stage==="complete";return`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(10,12,16,0.9); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:4000; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div class="card glass-accent animate-scaleIn" style="max-width:550px; width:100%; border:2px solid ${o?e.isHit?"var(--success)":"var(--danger)":"var(--accent)"}; padding:35px; text-align:center; background:var(--bg-surface); box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
                    
                    <!-- Attacker Header info -->
                    <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span>${e.attacker.name}</span>
                        <i class="fa-solid fa-right-long" style="color:var(--accent);"></i>
                        <span>🎯 ${e.target.name} (CA ${e.target.ac})</span>
                    </div>

                    <h2 style="font-family:'Cinzel'; font-size:1.8rem; margin:10px 0 25px 0; color:var(--accent-bright); border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px;">
                        Usa: ${e.action.name}
                    </h2>

                    <!-- STAGE 1: D20 TO HIT ROLL -->
                    ${a?`
                        <div>
                            <div class="dice-preview-box ${e.rolling?"spinning":""}">
                                🎲
                            </div>
                            
                            ${e.rolling?`
                                <div style="font-size:1rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px; margin-top:15px;">
                                    Sacudindo d20...
                                </div>
                            `:`
                                <div class="animate-fadeIn" style="margin-top:15px;">
                                    <div style="font-size:3.2rem; font-weight:900; color:white; line-height:1;">
                                        ${e.d20Total}
                                    </div>
                                    <div style="font-size:0.75rem; color:var(--text-dim); margin-top:8px;">
                                        Rolagem: <strong>${e.d20Roll}</strong> | Bônus: +${e.action.bonus||0} vs CA ${e.target.ac}
                                    </div>
                                    
                                    <div style="margin-top:25px; padding:15px; border-radius:10px; background:${e.isHit?"rgba(34, 197, 94, 0.15)":"rgba(239, 68, 68, 0.15)"}; border:1px solid ${e.isHit?"rgba(34, 197, 94, 0.4)":"rgba(239, 68, 68, 0.4)"};">
                                        <div style="font-size:1.6rem; font-weight:800; font-family:'Cinzel'; color:${e.isHit?"var(--success)":"var(--danger)"};">
                                            ${e.isCrit?"🔥 ACERTO CRÍTICO!":e.isHit?"⚔️ ACERTOU!":"🛡️ ERROU..."}
                                        </div>
                                        <p style="font-size:0.8rem; color:var(--text-main); margin:6px 0 0 0;">
                                            ${e.isHit?"Prepare-se para desferir o dano!":"A criatura escapou ilesa desta investida."}
                                        </p>
                                    </div>

                                    <div style="display:flex; gap:10px; margin-top:30px;">
                                        ${e.isHit?`
                                            <button class="btn btn-primary btn-block" style="padding:12px; font-family:'Cinzel';" data-action="proceedToDamage">
                                                💥 ROLAR DANO (${e.action.damage||"1d6"})
                                            </button>
                                        `:`
                                            <button class="btn btn-danger btn-block" style="padding:12px; font-family:'Cinzel';" data-action="closeVisualRoll">
                                                CONCLUIR TESTE
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `}
                        </div>
                    `:""}

                    <!-- STAGE 2: DAMAGE ROLLING -->
                    ${t?`
                        <div>
                            <div class="dice-preview-box shaking">
                                💥
                            </div>
                            <div style="font-size:1.1rem; font-family:'Cinzel'; color:var(--danger); letter-spacing:1px; margin-top:15px;">
                                Destruindo armaduras com ${e.action.damage}...
                            </div>
                        </div>
                    `:""}

                    <!-- STAGE 3: COMPLETE -->
                    ${o?`
                        <div class="animate-fadeIn">
                            <div class="dice-preview-box" style="font-size:4.5rem; color:var(--success);">
                                🩸
                            </div>
                            
                            <div style="font-size:3.5rem; font-weight:900; color:var(--danger); line-height:1; text-shadow:0 0 20px rgba(239, 68, 68, 0.4);">
                                - ${e.damageTotal} HP
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                                Dado de Dano: <strong>${e.action.damage}</strong> | Resultado: <strong>${e.damageRolls.join(" + ")}</strong>
                            </div>

                            <div style="margin-top:25px; padding:15px; border-radius:10px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); font-style:italic; font-size:0.85rem; color:var(--text-main);">
                                "${e.narrativeText}"
                            </div>

                            <button class="btn btn-primary btn-block" style="padding:14px; margin-top:35px; font-family:'Cinzel'; background:var(--success); border-color:#1b9d4c;" data-action="applyVisualRollResult">
                                ✔️ CONCLUIR TESTE
                            </button>
                        </div>
                    `:""}

                </div>
            </div>
        `}function ge(e,a){if(a.closest(".creature-action-btn"))return;const t=a.dataset.name,n=k().find(s=>s.name===t);n&&(M(n),g())}function ue(){M(null),g()}function be(e,a){e.stopPropagation();const t=a.dataset.name,n=k().find(s=>s.name===t);n&&V(n)}function xe(){m&&V(m)}function fe(e,a){if(e.stopPropagation(),confirm("Tem certeza que deseja banir esta criatura da sua biblioteca para sempre?")){const t=a.dataset.id;y.store.update(o=>{o.customMonsters=(o.customMonsters||[]).filter(n=>n.id!==t)}),w.show("Criatura deletada da biblioteca."),g()}}function V(e){let a={id:"m-"+Date.now(),name:e.name,cr:p.replace("Nível ",""),hp_max:e.hp,hp:e.hp,ac:e.ac||10,emoji:e.emoji||"👹",img:e.img||b.getImage(e)||"",size:e.size||"medium",speed:e.speed||"30 ft.",type:e.type||"monster",originalData:{...e,cr:p}};window.TOME&&window.TOME.events&&window.TOME.events.emit("MONSTER_INVOKED",a)}function ve(){R(!0),g()}function ye(){_("#bestiary-json-input").click()}return ke`<div ref=${j} onClick=${K} dangerouslySetInnerHTML=${{__html:Q()}}></div>`}const Ve=Object.freeze(Object.defineProperty({__proto__:null,Bestiary:je},Symbol.toStringTag,{value:"Module"}));export{je as B,S as M,Ve as a};
