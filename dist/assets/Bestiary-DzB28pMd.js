import{d as v,A as ca,h as pa,T as x,D as ga,b as ua}from"./FXEngine-BKbXWGrS.js";import{u as ba,m as va}from"./Boot-DN86Mwoy.js";import{Toast as w}from"./Toast-m0Ci56ke.js";import{M as f}from"./MonsterArt-3kughPIq.js";const S={"Nível 1":[{name:"Goblin",type:"Humanoide",ac:15,hp:7,damage:"1d6+2",emoji:"👺",actions:[{name:"Cimitarra",bonus:4,damage:"1d6+2"},{name:"Arco Curto",bonus:4,damage:"1d6+2"}]},{name:"Kobold",type:"Humanoide",ac:12,hp:5,damage:"1d4+2",emoji:"🦎",actions:[{name:"Adaga",bonus:4,damage:"1d4+2"},{name:"Funda",bonus:4,damage:"1d4+2"}]},{name:"Esqueleto",type:"Morto-Vivo",ac:13,hp:13,damage:"1d6+2",emoji:"💀",actions:[{name:"Espada Curta",bonus:4,damage:"1d6+2"},{name:"Arco Curto",bonus:4,damage:"1d6+2"}]}],"Nível 2":[{name:"Ogre",type:"Gigante",ac:11,hp:59,damage:"2d8+4",emoji:"👹",actions:[{name:"Clava",bonus:6,damage:"2d8+4"},{name:"Azagaia",bonus:6,damage:"2d6+4"}]},{name:"Grifo",type:"Monstruosidade",ac:12,hp:59,damage:"1d8+4",emoji:"🦅",actions:[{name:"Bico",bonus:6,damage:"1d8+4"},{name:"Garras",bonus:6,damage:"2d6+4"}]},{name:"Cão Infernal",type:"Ínfero",ac:15,hp:45,damage:"1d8+3",emoji:"🐕‍🦺",actions:[{name:"Mordida",bonus:5,damage:"1d8+3"},{name:"Sopro de Fogo",bonus:0,damage:"6d6"}]}],"Nível 3":[{name:"Manticora",type:"Monstruosidade",ac:14,hp:68,damage:"1d8+3",emoji:"🦂",actions:[{name:"Garras",bonus:5,damage:"1d8+3"},{name:"Espinhos",bonus:5,damage:"1d6+3"}]},{name:"Minotauro",type:"Monstruosidade",ac:14,hp:76,damage:"2d12+4",emoji:"🐂",actions:[{name:"Machado Grande",bonus:6,damage:"2d12+4"},{name:"Investida",bonus:6,damage:"2d8+4"}]},{name:"Basilisco",type:"Monstruosidade",ac:15,hp:52,damage:"2d6+3",emoji:"🐍",actions:[{name:"Mordida",bonus:5,damage:"2d6+3"},{name:"Olhar Petrificante",bonus:0,damage:"Petrificação"}]}],"Nível 4":[{name:"Cavaleiro",type:"Humanoide",ac:18,hp:52,damage:"2d6+3",emoji:"⚔️",actions:[{name:"Espada Grande",bonus:5,damage:"2d6+3"},{name:"Ataque Montado",bonus:5,damage:"2d6+5"}]},{name:"Múmia",type:"Morto-Vivo",ac:11,hp:58,damage:"2d6+3",emoji:"🧟",actions:[{name:"Toque Podre",bonus:5,damage:"2d6+3"},{name:"Maldição",bonus:0,damage:"Maldição"}]},{name:"Urso-Coruja",type:"Monstruosidade",ac:13,hp:59,damage:"1d10+5",emoji:"🦉",actions:[{name:"Bico",bonus:7,damage:"1d10+5"},{name:"Garras",bonus:7,damage:"2d8+5"}]}],"Nível 5":[{name:"Troll",type:"Gigante",ac:15,hp:84,damage:"1d6+4",emoji:"👺",actions:[{name:"Mordida",bonus:7,damage:"1d6+4"},{name:"Garras",bonus:7,damage:"2d6+4"}]},{name:"Elemental da Terra",type:"Elemental",ac:17,hp:126,damage:"2d8+5",emoji:"💎",actions:[{name:"Pancada",bonus:8,damage:"2d8+5"},{name:"Terremoto",bonus:0,damage:"3d8"}]},{name:"Vampire Spawn",type:"Morto-Vivo",ac:15,hp:82,damage:"1d8+3",emoji:"🧛",actions:[{name:"Garras",bonus:6,damage:"1d8+3"},{name:"Mordida",bonus:6,damage:"1d6+3"}]}],"Nível 6":[{name:"Gladiador",type:"Humanoide",ac:16,hp:112,damage:"2d6+5",emoji:"🛡️",actions:[{name:"Lança",bonus:9,damage:"2d6+5"},{name:"Escudo",bonus:9,damage:"2d4+5"}]},{name:"Medusa",type:"Monstruosidade",ac:15,hp:127,damage:"1d6+2",emoji:"🐍",actions:[{name:"Serpentes",bonus:5,damage:"1d6+2"},{name:"Olhar Petrificante",bonus:0,damage:"Petrificação CD14"}]},{name:"Ciclope",type:"Gigante",ac:14,hp:138,damage:"3d8+6",emoji:"👁️",actions:[{name:"Clava",bonus:9,damage:"3d8+6"},{name:"Arremesso de Rocha",bonus:9,damage:"3d10+6"}]}],"Nível 7":[{name:"Gigante de Pedra",type:"Gigante",ac:17,hp:126,damage:"3d8+6",emoji:"⛰️",actions:[{name:"Clava",bonus:9,damage:"3d8+6"},{name:"Arremesso de Rocha",bonus:9,damage:"4d10+6"}]},{name:"Dragão Negro Jovem",type:"Dragão",ac:18,hp:127,damage:"2d10+4",emoji:"🐲",actions:[{name:"Mordida",bonus:7,damage:"2d10+4"},{name:"Sopro Ácido",bonus:0,damage:"11d8"}]},{name:"Oni",type:"Gigante",ac:16,hp:110,damage:"2d10+4",emoji:"👹",actions:[{name:"Clava Luar",bonus:7,damage:"2d10+4"},{name:"Cone de Frio",bonus:0,damage:"8d8"}]}],"Nível 8":[{name:"Hydra",type:"Monstruosidade",ac:15,hp:172,damage:"1d10+5",emoji:"🐉",actions:[{name:"Mordida (x5)",bonus:8,damage:"1d10+5"},{name:"Regeneração",bonus:0,damage:"Cura 10/cabeça"}]},{name:"Assasino",type:"Humanoide",ac:15,hp:78,damage:"1d8+3",emoji:"🗡️",actions:[{name:"Espada Curta (x2)",bonus:6,damage:"1d6+3"},{name:"Ataque Furtivo",bonus:0,damage:"7d6"}]},{name:"Gigante de Gelo",type:"Gigante",ac:15,hp:138,damage:"3d12+6",emoji:"❄️",actions:[{name:"Machado Grande",bonus:9,damage:"3d12+6"},{name:"Arremesso de Rocha",bonus:9,damage:"4d10+6"}]}],"Nível 9":[{name:"Quimera",type:"Monstruosidade",ac:14,hp:114,damage:"2d6+4",emoji:"🦁",actions:[{name:"Mordida",bonus:7,damage:"2d6+4"},{name:"Sopro de Fogo",bonus:0,damage:"7d8"}]},{name:"Aboleth",type:"Aberração",ac:17,hp:135,damage:"2d6+5",emoji:"🦑",actions:[{name:"Tentáculo",bonus:9,damage:"2d6+5"},{name:"Escravizar Mente",bonus:0,damage:"Controle CD14"}]},{name:"Treant",type:"Planta",ac:16,hp:138,damage:"3d6+6",emoji:"🌲",actions:[{name:"Pancada",bonus:10,damage:"3d6+6"},{name:"Arremesso de Rocha",bonus:10,damage:"4d10+6"}]}],"Nível 10":[{name:"Dragão Vermelho Jovem",type:"Dragão",ac:18,hp:178,damage:"2d10+6",emoji:"🔥",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida",bonus:10,damage:"2d10+6"},{name:"Sopro de Fogo",bonus:0,damage:"16d6"}]},{name:"Golem de Pedra",type:"Constructo",ac:17,hp:178,damage:"3d10+6",emoji:"🗿",actions:[{name:"Pancada (x2)",bonus:10,damage:"3d10+6"},{name:"Lentidão",bonus:0,damage:"Efeito CD17"}]},{name:"Guardian Naga",type:"Monstruosidade",ac:18,hp:127,damage:"1d8+4",emoji:"🐍",actions:[{name:"Mordida",bonus:8,damage:"1d8+4"},{name:"Magias Divinas",bonus:0,damage:"Variável"}]}],"Nível 11":[{name:"Roc",type:"Monstruosidade",ac:15,hp:248,damage:"2d8+6",emoji:"🦅",actions:[{name:"Bico",bonus:13,damage:"4d8+6"},{name:"Garras",bonus:13,damage:"4d6+6"}]},{name:"Behir",type:"Monstruosidade",ac:17,hp:168,damage:"2d10+6",emoji:"⚡",actions:[{name:"Mordida",bonus:10,damage:"3d10+6"},{name:"Sopro Relâmpago",bonus:0,damage:"12d10"}]},{name:"Gigante de Fogo",type:"Gigante",ac:18,hp:162,damage:"6d6+7",emoji:"🔥",actions:[{name:"Espada Grande",bonus:11,damage:"6d6+7"},{name:"Arremesso de Rocha",bonus:11,damage:"4d10+7"}]}],"Nível 12":[{name:"Arcimago",type:"Humanoide",ac:12,hp:99,damage:"Variável",emoji:"🧙",actions:[{name:"Mísseis Mágicos",bonus:0,damage:"3d10+3"},{name:"Cone de Frio",bonus:0,damage:"8d8"}]},{name:"Erinyes (Diaba)",type:"Ínfero",ac:18,hp:153,damage:"3d8+6",emoji:"😈",actions:[{name:"Espada Longa",bonus:8,damage:"3d8+6"},{name:"Corda de Enredar",bonus:0,damage:"Restringir CD17"}]},{name:"Dragão Azul Jovem",type:"Dragão",ac:18,hp:152,damage:"2d10+5",emoji:"⚡",actions:[{name:"Mordida",bonus:9,damage:"2d10+5"},{name:"Sopro Relâmpago",bonus:0,damage:"12d10"}]}],"Nível 13":[{name:"Dragão Verde Adulto",type:"Dragão",ac:19,hp:207,damage:"2d10+6",emoji:"🐲",actions:[{name:"Mordida",bonus:11,damage:"2d10+6"},{name:"Sopro Venenoso",bonus:0,damage:"12d6"}]},{name:"Golem de Ferro",type:"Constructo",ac:20,hp:210,damage:"3d10+7",emoji:"⚙️",actions:[{name:"Espada",bonus:13,damage:"3d10+7"},{name:"Sopro Venenoso",bonus:0,damage:"10d8"}]},{name:"Nalfeshnee",type:"Demônio",ac:18,hp:184,damage:"Variável",emoji:"👿",actions:[{name:"Mordida",bonus:10,damage:"5d10+5"},{name:"Garras",bonus:10,damage:"3d6+5"}]}],"Nível 14":[{name:"Múmia Lorde",type:"Morto-Vivo",ac:17,hp:97,damage:"3d6+4",emoji:"☥",actions:[{name:"Toque Podre",bonus:9,damage:"3d6+4"},{name:"Maldição da Múmia",bonus:0,damage:"Maldição CD16"}]},{name:"Vampiro (Guerreiro)",type:"Morto-Vivo",ac:16,hp:144,damage:"1d8+4",emoji:"🧛",actions:[{name:"Espada Grande",bonus:9,damage:"2d6+4"},{name:"Mordida Vampírica",bonus:6,damage:"1d6+3"}]},{name:"Death Knight",type:"Morto-Vivo",ac:20,hp:180,damage:"2d6+5",emoji:"⚔️",actions:[{name:"Espada Longa",bonus:11,damage:"2d6+5"},{name:"Bola de Fogo Infernal",bonus:0,damage:"10d6"}]}],"Nível 15":[{name:"Dragão Vermelho Adulto",type:"Dragão",ac:19,hp:256,damage:"2d10+8",emoji:"🔥",actions:[{name:"Mordida",bonus:14,damage:"2d10+8"},{name:"Sopro de Fogo",bonus:0,damage:"18d6"}]},{name:"Marilith",type:"Demônio",ac:18,hp:189,damage:"2d8+4",emoji:"🐍",actions:[{name:"Espada Longa (x6)",bonus:9,damage:"2d8+4"},{name:"Cauda",bonus:9,damage:"2d10+4"}]},{name:"Planetar",type:"Celestial",ac:19,hp:200,damage:"4d6+7",emoji:"👼",actions:[{name:"Espada Grande",bonus:12,damage:"4d6+7"},{name:"Cura Divina",bonus:0,damage:"Cura 6d8+3"}]}],"Nível 16":[{name:"Dragão Azul Adulto",type:"Dragão",ac:19,hp:225,damage:"2d10+7",emoji:"⚡",actions:[{name:"Mordida",bonus:12,damage:"2d10+7"},{name:"Sopro Relâmpago",bonus:0,damage:"16d10"}]},{name:"Goristro",type:"Demônio",ac:19,hp:310,damage:"Variável",emoji:"🐃",actions:[{name:"Chifrada",bonus:13,damage:"7d10+7"},{name:"Pisar",bonus:13,damage:"3d12+7"}]},{name:"Pit Fiend",type:"Diabo",ac:19,hp:300,damage:"Variável",emoji:"😈",actions:[{name:"Mordida",bonus:14,damage:"4d6+8"},{name:"Maça Flamejante",bonus:14,damage:"2d6+8"}]}],"Nível 17":[{name:"Dragão Negro Adulto",type:"Dragão",ac:19,hp:195,damage:"2d10+6",emoji:"🖤",actions:[{name:"Mordida",bonus:11,damage:"2d10+6"},{name:"Sopro Ácido",bonus:0,damage:"14d8"}]},{name:"Androesfinge",type:"Monstruosidade",ac:17,hp:199,damage:"2d10+6",emoji:"🦁",actions:[{name:"Garras",bonus:12,damage:"2d10+6"},{name:"Rugido Aterrorizante",bonus:0,damage:"Medo CD18"}]},{name:"Solar",type:"Celestial",ac:21,hp:243,damage:"4d6+7",emoji:"☀️",actions:[{name:"Espada Grande",bonus:15,damage:"4d6+7"},{name:"Flecha Matadora",bonus:13,damage:"2d8+6"}]}],"Nível 18":[{name:"Demilich",type:"Morto-Vivo",ac:20,hp:80,damage:"Variável",emoji:"💀",actions:[{name:"Drenar Vida",bonus:0,damage:"6d6 necrótico"},{name:"Uivo",bonus:0,damage:"Medo + 40 HP CD15"}]},{name:"Dragão Branco Antigo",type:"Dragão",ac:20,hp:333,damage:"2d10+8",emoji:"❄️",actions:[{name:"Mordida",bonus:14,damage:"2d10+8"},{name:"Sopro Glacial",bonus:0,damage:"16d8"}]},{name:"Balor",type:"Demônio",ac:19,hp:262,damage:"3d8+8",emoji:"🔥",actions:[{name:"Espada Flamejante",bonus:14,damage:"3d8+8"},{name:"Chicote de Fogo",bonus:14,damage:"2d6+8"}]}],"Nível 19":[{name:"Dragão Verde Antigo",type:"Dragão",ac:21,hp:385,damage:"2d10+8",emoji:"🌿",actions:[{name:"Mordida",bonus:15,damage:"2d10+8"},{name:"Sopro Venenoso",bonus:0,damage:"22d6"}]},{name:"Dragão Azul Antigo",type:"Dragão",ac:22,hp:481,damage:"2d10+9",emoji:"⚡",actions:[{name:"Mordida",bonus:16,damage:"2d10+9"},{name:"Sopro Relâmpago",bonus:0,damage:"16d10"}]},{name:"Empyrean",type:"Celestial",ac:22,hp:313,damage:"3d8+10",emoji:"⭐",actions:[{name:"Maça Colossal",bonus:17,damage:"3d8+10"},{name:"Raio de Trovão",bonus:0,damage:"7d6 trovão"}]}],"Nível 20":[{name:"Dragão Vermelho Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"🐉",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida",bonus:17,damage:"2d10+10"},{name:"Sopro de Fogo",bonus:0,damage:"26d6"}]},{name:"Dragão Dourado Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"✨",actions:[{name:"Mordida",bonus:17,damage:"2d10+10"},{name:"Sopro de Fogo",bonus:0,damage:"13d10"}]},{name:"Kraken",type:"Monstruosidade",ac:18,hp:472,damage:"3d10+10",emoji:"🐙",img:"assets/sprites/boss_kraken.png",actions:[{name:"Tentáculo (x3)",bonus:17,damage:"3d10+10"},{name:"Tempestade Relâmpago",bonus:0,damage:"22d6"}]}],BOSS:[{name:"Tiamat (Avatar)",type:"Divindade",ac:25,hp:615,damage:"4d10+10",emoji:"🐉",img:"assets/sprites/boss_tiamat.png",actions:[{name:"5 Mordidas",bonus:19,damage:"4d10+10"},{name:"5 Sopros Elementais",bonus:0,damage:"Variável"}]},{name:"Tarrasque",type:"Monstruosidade",ac:25,hp:676,damage:"4d12+10",emoji:"🦖",img:"assets/sprites/boss_tarrasque.png",actions:[{name:"Mordida",bonus:19,damage:"4d12+10"},{name:"Engolir",bonus:19,damage:"16d6 ácido"}]},{name:"Lich Supremo",type:"Morto-Vivo",ac:17,hp:250,damage:"Variável",emoji:"👑",img:"assets/sprites/boss_lich_king.png",actions:[{name:"Palavra de Poder: Matar",bonus:12,damage:"100"},{name:"Desintegrar",bonus:0,damage:"10d6+40"}]},{name:"Kraken Abissal",type:"Aberração",ac:18,hp:472,damage:"3d10+10",emoji:"🌊",img:"assets/sprites/boss_kraken.png",actions:[{name:"Tentáculo (x3)",bonus:17,damage:"3d10+10"},{name:"Tempestade",bonus:0,damage:"22d6 relâmpago"}]},{name:"Beholder Tirano",type:"Aberração",ac:18,hp:250,damage:"Variável",emoji:"👁️",img:"assets/sprites/boss_beholder.png",actions:[{name:"Mordida",bonus:5,damage:"4d6"},{name:"Raios Oculares (x3)",bonus:0,damage:"Variável CD16"}]},{name:"Dragão Sombrio Antigo",type:"Dragão",ac:22,hp:546,damage:"2d10+10",emoji:"🖤",img:"assets/sprites/boss_ancient_dragon.png",actions:[{name:"Mordida Sombria",bonus:17,damage:"2d10+10"},{name:"Sopro Necrótico",bonus:0,damage:"26d6 necrótico"}]},{name:"Demogorgon",type:"Demônio",ac:22,hp:496,damage:"3d12+8",emoji:"👿",actions:[{name:"Tentáculos (x2)",bonus:17,damage:"3d12+8"},{name:"Olhar da Loucura",bonus:0,damage:"Insanidade CD23"}]},{name:"Senhor Vampírico",type:"Morto-Vivo",ac:20,hp:350,damage:"3d8+7",emoji:"🩸",actions:[{name:"Garras Sombrias",bonus:13,damage:"3d8+7"},{name:"Drenar Essência",bonus:0,damage:"10d6 necrótico CD19"}]}]};function fa(ya){var I;const G=ba(),[xa,ha]=v(null),[g,V]=v("Nível 1"),[D,F]=v(""),[Ma,Ca]=v("grid"),[h,$]=v(null),[z,R]=v(!1),[T,y]=v(null),[B,wa]=v("normal"),[,L]=v(0),b=()=>L(a=>a+1),C=ca(null),P=a=>{const e=a.target.closest("[data-action]");if(e){const t=e.dataset.action;t==="selectLevel"&&Y(a,e),t==="viewCreature"&&sa(a,e),t==="spawnCreature"&&ia(a,e),t==="spawnFromDetail"&&da(),t==="deleteCustomMonster"&&ra(a,e),t==="addCustomMonster"&&la(),t==="triggerImportJSON"&&ma(),t==="rollBestiaryAttack"&&W(a,e),t==="proceedToDamage"&&aa(),t==="applyVisualRollResult"&&ea(),t==="closeVisualRoll"&&ta(),t==="closeForgeModal"&&X(),t==="forgeCustomMonster"&&forgeCustomMonster(a,e),t==="backToGrid"&&na()}},k={hit:["A lâmina corta o ar com precisão!","Um golpe certeiro nas defesas do inimigo!","O impacto ressoa por toda a biblioteca!","Sangue e faíscas voam com o acerto!","O ataque encontra uma brecha na armadura!"],miss:["O golpe passa raspando!","A defesa se mantém impenetrável.","O monstro vacila por um momento...","O ataque atinge apenas o vácuo.","Um desvio ágil no último segundo!"],crit:["UM GOLPE LENDÁRIO! A criatura cambaleia!","PERFEIÇÃO TÁTICA! O dano é devastador!","A força do destino guia esta arma!"]},H=((I=window.TOME)==null?void 0:I.store)||{state:G},j=a=>C.current?C.current.querySelector(a):null;function A(){const a=S[g]||[];return[...(H.state.customMonsters||[]).filter(t=>t.level===g||t.cr===g||!t.level&&g==="Nível 1"),...a]}function E(a,e,t=0){const o=k[a][Math.floor(Math.random()*k[a].length)];return a==="hit"||a==="crit"?`${o} <br> ⚔️ <strong>${e}</strong> sofre <strong>${t}</strong> de dano!`:`${o} <br> 🛡️ <strong>${e}</strong> escapa ileso!`}function N(a){if(a.actions&&a.actions.length>0)return a.actions.map(i=>({name:i.name||"Ataque",bonus:i.bonus!==void 0?i.bonus:i.hit!==void 0?i.hit:4,damage:i.damage||i.dmg||"1d8+2",desc:i.desc||i.description||`Ataque especial causando ${i.damage||i.dmg||"1d8+2"} de dano.`}));const e=(a.name||"").toLowerCase();let t=2;const o=String(a.level||a.cr||"Nível 1");if(o.includes("BOSS"))t=6;else{const i=parseInt(o.replace(/\D/g,""))||1;i>=17?t=6:i>=13?t=5:i>=9?t=4:i>=5&&(t=3)}const n=primaryMod+t;let s="1d6",r=primaryMod>=0?`+${primaryMod}`:`${primaryMod}`;if(o.includes("BOSS"))s="4d10";else{const i=parseInt(o.replace(/\D/g,""))||1;i>=17?s="4d8":i>=13?s="3d8":i>=9?s="2d10":i>=5?s="2d6":i>=3?s="1d10":i>=2&&(s="1d8")}const c=`${s}${primaryMod!==0?r:""}`;let p="Ataque Corporal",u="Ataque de Garra";return e.includes("lobo")||e.includes("werewolf")||e.includes("cão")||e.includes("dragão")||e.includes("dragon")?(p="Mordida",u="Garras"):e.includes("esqueleto")||e.includes("goblin")||e.includes("orc")||e.includes("humano")?(p="Espada Curta",u="Arco Curto"):(e.includes("mago")||e.includes("bruxo")||e.includes("spell"))&&(p="Disparo Místico",u="Cajado"),[{name:p,bonus:n,damage:c,desc:`Ataque corporal com bônus de +${n} e dano de ${c}.`},{name:u,bonus:n,damage:s,desc:`Ataque rápido com bônus de +${n} e dano de ${s}.`}]}pa(()=>(_&&_(),()=>{onUnmount&&onUnmount()}),[]);function q(){const a=Object.keys(S),t=A().filter(s=>s.name.toLowerCase().includes(D.toLowerCase())),o=g==="BOSS";return`
            
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
                            <input type="text" class="legacy-input" placeholder="Buscar criatura..." value="${D}"
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
                    ${a.map(s=>{const r=g===s,c=s==="BOSS";return`
                            <button class="btn ${r?c?"btn-danger":"btn-primary":"btn-ghost"}"
                                    style="border-radius:20px; padding:6px 16px; white-space:nowrap; border:1px solid ${r?"transparent":"rgba(255,255,255,0.1)"}; ${c&&!r?"color:var(--danger); border-color:var(--danger);":""}"
                                    data-action="selectLevel" data-level="${s}">
                                ${c?'<i class="fa-solid fa-skull-crossbones" style="margin-right:6px;"></i>':""}
                                ${s}
                            </button>
                        `}).join("")}
                </div>

                <!-- MAIN CONTENT -->
                ${h?K(h,o):U(t,o)}
                
                <!-- FORGE MODAL -->
                ${z?Q():""}

                <!-- VISUAL DYNAMIC DICE ROLLER OVERLAY -->
                ${T?oa():""}
            </div>
        `}function U(a,e){return a.length===0?`
                <div class="card empty-state" style="height:40vh; border-color:var(--danger); background:rgba(255,0,0,0.02);">
                    <i class="fa-solid fa-dragon fa-3x" style="opacity:0.2; margin-bottom:20px; color:var(--danger);"></i>
                    <h3 style="font-family:'Cinzel';">Santuário Vazio</h3>
                    <p style="color:var(--text-dim);">Nenhuma criatura deste poder foi encontrada.</p>
                </div>
            `:`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                ${a.map((t,o)=>J(t,o,e)).join("")}
            </div>
        `}function J(a,e,t){const o=f.getImage(a),n=e*.04,s=a.id&&String(a.id).startsWith("custom_"),r=o?`<img src="${o}" alt="${a.name}" loading="lazy" onerror="style.display='none';nextElementSibling.style.display='flex';">`:"",p=String(a.level||a.cr||1).replace(/\D/g,"")||1;return`
            <div class="card bestiary-card-premium"
                 style="animation: fadeIn 0.4s ease-out ${n}s both;"
                 data-action="viewCreature" data-name="${a.name}">
                
                <div class="bc-inner">
                    <!-- Badges -->
                    <span class="bc-badge level">Nível ${p}</span>
                    ${t?'<span class="bc-badge boss">Boss</span>':""}
                    ${s?'<span class="bc-badge forged">Forjado</span>':""}

                    <!-- Top Banner -->
                    <div class="bc-top-banner">
                        <h4 class="bc-name">${a.name}</h4>
                    </div>
                    
                    <!-- Full Bleed Image (Inside Inner) -->
                    <div class="bc-portrait">
                        ${r}
                        <span class="bc-emoji" style="${o?"display:none;":""}">${a.emoji||"🐾"}</span>
                    </div>

                    <!-- Bottom Banner (Type & Actions) -->
                    <div class="bc-bottom-banner creature-action-btn">
                        <div class="bc-type">${a.type||"Monstro"}</div>
                        <div class="bc-actions-bar">
                            <button class="btn btn-sm" style="border: 2px solid #1a1a1a; font-weight: 900; color: #1a1a1a; background: #fff; box-shadow: 2px 2px 0 #1a1a1a; font-family: 'Outfit', sans-serif;" onclick="event.stopPropagation(); closest('.bestiary-card-premium').click();">
                                VER FICHA
                            </button>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-sm" style="background:#1a1a1a; color:#fff; border: 2px solid #1a1a1a; box-shadow: 2px 2px 0 #1a1a1a;" data-action="spawnCreature" data-name="${a.name}" title="Invocar no Mapa">
                                    <i class="fa-solid fa-swords"></i>
                                </button>
                                ${s?`<button class="btn btn-sm" style="background:#cc1111; color:#fff; border: 2px solid #1a1a1a; box-shadow: 2px 2px 0 #1a1a1a;" data-action="deleteCustomMonster" data-id="${a.id}"><i class="fa-solid fa-trash-can"></i></button>`:""}
                            </div>
                        </div>
                    </div>

                    <!-- Floating Stats Box (Bottom Right) -->
                    <div class="bc-stats-box">
                        <div class="stat-line ac"><i class="fa-solid fa-shield-halved"></i> ${a.ac}</div>
                        <div class="stat-divider"></div>
                        <div class="stat-line hp"><i class="fa-solid fa-heart"></i> ${a.hp}</div>
                    </div>
                </div>

            </div>
        `}function K(a,e){const t=a.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},o=N(a),n={str:"FOR",dex:"DES",con:"CON",int:"INT",wis:"SAB",cha:"CAR"},s=m=>Math.floor((m-10)/2),r=m=>{const l=(m.name||"").toLowerCase();return l.includes("sopro")||l.includes("fogo")||l.includes("gelo")||l.includes("relampago")||l.includes("relâmpago")?"Elemental":l.includes("mordida")||l.includes("garra")||l.includes("bico")?"Slashing":"Bludgeoning"},c=o.slice(0,4).map((m,l)=>`
                <div class="sb-action-card">
                    <h4><i class="fa-solid ${f.isMeleeAction(m)?"fa-swords":"fa-wand-sparkles"}"></i> ${m.name}</h4>
                    <div class="sb-action-stat">
                        <strong>+${m.bonus||0}</strong> para atingir ·
                        <strong>${(m.damage||"1d6").toUpperCase()}</strong> ${r(m)} DMG
                    </div>
                    <button type="button" class="sb-action-roll" data-action="rollBestiaryAttack" data-index="${l}">Rolar ataque</button>
                </div>`).join(""),p=Object.entries(t).map(([m,l])=>{const M=s(l);return`
                <div class="sb-ability">
                    <div class="sb-ability-mod">${M>=0?"+":""}${M}</div>
                    <div class="sb-ability-score">${l}</div>
                    <div class="sb-ability-name">${n[m]||m.toUpperCase()}</div>
                </div>`}).join(""),u=a.notes||a.traits||"",i=u?`<div class="sb-trait-title">${u.split(/[.!]/)[0]}</div><p>${u}</p>`:`<p><strong>Percepção Passiva</strong> ${10+s(t.wis)} · <strong>Idiomas</strong> Comum</p>`,d=a.description||a.lore?`
            <div style="padding: 15px 25px 0; font-family: 'Cinzel', serif; font-style: italic; font-size: 0.95rem; color: #444; text-align: center; line-height: 1.5; border-bottom: 2px dashed rgba(26,26,26,0.2); padding-bottom: 15px; margin-bottom: 10px;">
                "${a.description||a.lore}"
            </div>
        `:"";return`
            <div class="animate-fadeIn" style="max-width:960px; margin:0 auto; padding-bottom:40px;">
                <button class="btn" style="background:#fff; border:3px solid #1a1a1a; box-shadow:4px 4px 0 #1a1a1a; color:#1a1a1a; font-weight:900; font-family:'Outfit',sans-serif; text-transform:uppercase; margin-bottom:20px; transition:transform 0.1s, box-shadow 0.1s;" onmousedown="style.transform='translate(2px,2px)';style.boxShadow='0 0 0 #1a1a1a'" onmouseup="style.transform='';style.boxShadow='4px 4px 0 #1a1a1a'" data-action="backToGrid">
                    <i class="fa-solid fa-arrow-left"></i> Voltar ao Bestiário
                </button>

                <div class="bestiary-statblock ${e?"is-boss":""}">
                    <header class="sb-header">
                        <h1 class="sb-name">${a.name}</h1>
                        <p class="sb-subtitle">${f.getSubtitle(a,g)}</p>
                    </header>
                    ${d}

                    <div class="sb-class-bar">
                        <span>${f.getClassification(a)}</span>
                        <span class="sb-cr">${f.getCrDisplay(g)}</span>
                    </div>

                    <div class="sb-hero">
                        <div class="sb-side-left">
                            <div class="sb-vital-box ac"><i class="fa-solid fa-shield-halved"></i><div class="sb-vital-value">${a.ac}</div><div class="sb-vital-label">Armor Class</div></div>
                            <div class="sb-vital-box hp"><i class="fa-solid fa-heart"></i><div class="sb-vital-value">${a.hp}</div><div class="sb-vital-label">Health</div></div>
                            <div class="sb-vital-box spd"><i class="fa-solid fa-person-running"></i><div class="sb-vital-value">${f.getSpeed(a).replace(" ft.","")}</div><div class="sb-vital-label">Speed</div></div>
                        </div>

                        ${f.renderPortrait(a)}

                        <div class="sb-side-right">
                            <div class="sb-multi-box">Multi-Atk<br>${f.getMultiattackSummary(o)}</div>
                            ${c}
                        </div>
                    </div>

                    <div class="sb-abilities">${p}</div>

                    <div class="sb-traits">
                        <p><strong>ND</strong> ${g.replace("Nível ","")} · <strong>Tipo</strong> ${a.type||"Monstro"}</p>
                        ${i}
                    </div>

                    ${e?'<div class="sb-boss-banner">Criatura Lendária</div>':""}

                    <footer class="sb-footer">
                        <div class="sb-test-ac">
                            <span>CA de teste:</span>
                            <input type="number" id="bestiary-test-ac" value="13" min="1" max="30">
                        </div>
                        <button class="btn" style="background:${e?"#cc1111":"#eb5e28"}; color:#fff; border:3px solid #1a1a1a; box-shadow:4px 4px 0 #1a1a1a; font-weight:900; font-family:'Outfit',sans-serif; text-transform:uppercase; transition:transform 0.1s, box-shadow 0.1s;" onmousedown="style.transform='translate(2px,2px)';style.boxShadow='0 0 0 #1a1a1a'" onmouseup="style.transform='';style.boxShadow='4px 4px 0 #1a1a1a'" data-action="spawnFromDetail">
                            <i class="fa-solid fa-swords"></i> Invocação Direta
                        </button>
                    </footer>
                </div>
            </div>
        `}function Q(){return`
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
                                    ${Object.keys(S).map(e=>`<option value="${e}">${e}</option>`).join("")}
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
        `}function X(){R(!1),b()}function Y(a,e){V(e.dataset.level),$(null),F(""),b()}function W(a,e){const t=parseInt(e.dataset.index),o=h;if(!o)return;const s=N(o)[t];if(!s)return;const r=j("#bestiary-test-ac"),c=r&&parseInt(r.value)||13,p={name:o.name,emoji:o.emoji||"🐾"};Z(p,{name:"Alvo de Treino",ac:c},s)}function Z(a,e,t){const o={stage:"d20",rolling:!0,attacker:a,target:e,action:t,d20Roll:null,d20Total:null,isCrit:!1,isHit:!1,damageNotation:t.damage||"1d6",damageRolls:[],damageTotal:null,narrativeText:""};y(o),x.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3"),setTimeout(()=>{const n=ua.checkHit(t.bonus||0,e.ac||10,B);let s="";n.success?x.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3"):(x.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"),s=E("miss",e.name)),y(r=>r?{...r,rolling:!1,d20Roll:n.roll,d20Total:n.total,isCrit:n.isCrit,isHit:n.success,narrativeText:s}:null)},1100)}function aa(){y(a=>a?{...a,stage:"damage"}:null),x.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3"),setTimeout(()=>{y(a=>{var s,r;if(!a)return null;const e=((s=a.action)==null?void 0:s.damage)||"1d6",t=ga.roll(e);let o=a.isCrit?t.total*2:t.total;isNaN(o)&&(o=4);const n=E(a.isCrit?"crit":"hit",((r=a.target)==null?void 0:r.name)||"Alvo",o);return{...a,stage:"complete",damageRolls:t.rolls||[o],damageTotal:o,narrativeText:n}})},1100)}function ea(){y(null),b()}function ta(){y(null),b()}function oa(){const a=T,e=a.stage==="d20",t=a.stage==="damage",o=a.stage==="complete";return`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(10,12,16,0.9); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:4000; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div class="card glass-accent animate-scaleIn" style="max-width:550px; width:100%; border:2px solid ${o?a.isHit?"var(--success)":"var(--danger)":"var(--accent)"}; padding:35px; text-align:center; background:var(--bg-surface); box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
                    
                    <!-- Attacker Header info -->
                    <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span>${a.attacker.name}</span>
                        <i class="fa-solid fa-right-long" style="color:var(--accent);"></i>
                        <span>🎯 ${a.target.name} (CA ${a.target.ac})</span>
                    </div>

                    <h2 style="font-family:'Cinzel'; font-size:1.8rem; margin:10px 0 25px 0; color:var(--accent-bright); border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px;">
                        Usa: ${a.action.name}
                    </h2>

                    <!-- STAGE 1: D20 TO HIT ROLL -->
                    ${e?`
                        <div>
                            <div class="dice-preview-box ${a.rolling?"spinning":""}">
                                🎲
                            </div>
                            
                            ${a.rolling?`
                                <div style="font-size:1rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px; margin-top:15px;">
                                    Sacudindo d20...
                                </div>
                            `:`
                                <div class="animate-fadeIn" style="margin-top:15px;">
                                    <div style="font-size:3.2rem; font-weight:900; color:white; line-height:1;">
                                        ${a.d20Total}
                                    </div>
                                    <div style="font-size:0.75rem; color:var(--text-dim); margin-top:8px;">
                                        Rolagem: <strong>${a.d20Roll}</strong> | Bônus: +${a.action.bonus||0} vs CA ${a.target.ac}
                                    </div>
                                    
                                    <div style="margin-top:25px; padding:15px; border-radius:10px; background:${a.isHit?"rgba(34, 197, 94, 0.15)":"rgba(239, 68, 68, 0.15)"}; border:1px solid ${a.isHit?"rgba(34, 197, 94, 0.4)":"rgba(239, 68, 68, 0.4)"};">
                                        <div style="font-size:1.6rem; font-weight:800; font-family:'Cinzel'; color:${a.isHit?"var(--success)":"var(--danger)"};">
                                            ${a.isCrit?"🔥 ACERTO CRÍTICO!":a.isHit?"⚔️ ACERTOU!":"🛡️ ERROU..."}
                                        </div>
                                        <p style="font-size:0.8rem; color:var(--text-main); margin:6px 0 0 0;">
                                            ${a.isHit?"Prepare-se para desferir o dano!":"A criatura escapou ilesa desta investida."}
                                        </p>
                                    </div>

                                    <div style="display:flex; gap:10px; margin-top:30px;">
                                        ${a.isHit?`
                                            <button class="btn btn-primary btn-block" style="padding:12px; font-family:'Cinzel';" data-action="proceedToDamage">
                                                💥 ROLAR DANO (${a.action.damage||"1d6"})
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
                                Destruindo armaduras com ${a.action.damage}...
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
                                - ${a.damageTotal} HP
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                                Dado de Dano: <strong>${a.action.damage}</strong> | Resultado: <strong>${a.damageRolls.join(" + ")}</strong>
                            </div>

                            <div style="margin-top:25px; padding:15px; border-radius:10px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); font-style:italic; font-size:0.85rem; color:var(--text-main);">
                                "${a.narrativeText}"
                            </div>

                            <button class="btn btn-primary btn-block" style="padding:14px; margin-top:35px; font-family:'Cinzel'; background:var(--success); border-color:#1b9d4c;" data-action="applyVisualRollResult">
                                ✔️ CONCLUIR TESTE
                            </button>
                        </div>
                    `:""}

                </div>
            </div>
        `}function sa(a,e){if(e.closest(".creature-action-btn"))return;const t=e.dataset.name,n=A().find(s=>s.name===t);n&&($(n),b())}function na(){$(null),b()}function ia(a,e){a.stopPropagation();const t=e.dataset.name,n=A().find(s=>s.name===t);n&&O(n)}function da(){h&&O(h)}function ra(a,e){if(a.stopPropagation(),confirm("Tem certeza que deseja banir esta criatura da sua biblioteca para sempre?")){const t=e.dataset.id;x.store.update(o=>{o.customMonsters=(o.customMonsters||[]).filter(n=>n.id!==t)}),w.show("Criatura deletada da biblioteca."),b()}}function O(a){let e={id:"m-"+Date.now(),name:a.name,cr:g.replace("Nível ",""),hp_max:a.hp,hp:a.hp,ac:a.ac||10,emoji:a.emoji||"👹",img:a.img||f.getImage(a)||"",size:a.size||"medium",speed:a.speed||"30 ft.",type:a.type||"monster",originalData:{...a,cr:g}};window.TOME&&window.TOME.events&&window.TOME.events.emit("MONSTER_INVOKED",e)}function la(){R(!0),b()}function ma(){j("#bestiary-json-input").click()}function _(){var t;const a=(t=C.current)==null?void 0:t.querySelector(".bestiary");a&&(a.__component=this);const e=j("#bestiary-json-input");e&&(e.onchange=async o=>{const n=Array.from(o.target.files);if(n.length===0)return;w.show(`📥 Lendo ${n.length} arquivo(s)...`);let s=0;for(const r of n)try{const c=await new Promise((d,m)=>{const l=new FileReader;l.onload=M=>d(M.target.result),l.onerror=m,l.readAsText(r)}),p=JSON.parse(c),i=(Array.isArray(p)?p:[p]).filter(d=>d&&d.name).map((d,m)=>({id:d.id||`custom_${Date.now()}_${m}_${Math.random().toString(36).substr(2,5)}`,name:d.name||"Criatura Sem Nome",type:d.type||"Monstro",ac:parseInt(d.ac)||10,hp:parseInt(d.hp)||10,level:d.level||d.cr||"Nível 1",emoji:d.emoji||"🐾",img:d.img||"",stats:d.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},actions:Array.isArray(d.actions)?d.actions:[]}));i.length>0&&(x.store.update(d=>{d.customMonsters||(d.customMonsters=[]),d.customMonsters=[...d.customMonsters,...i]}),s+=i.length)}catch(c){console.error("Erro ao ler arquivo do bestiário:",c)}s>0?(w.show(`✅ Sucesso! ${s} monstros importados para o Bestiário!`,"success"),b()):w.show("❌ Nenhum monstro válido encontrado nos arquivos.","danger")})}return va`<div ref=${C} onClick=${P} dangerouslySetInnerHTML=${{__html:q()}}></div>`}const Ta=Object.freeze(Object.defineProperty({__proto__:null,Bestiary:fa},Symbol.toStringTag,{value:"Module"}));export{fa as B,S as M,Ta as a};
