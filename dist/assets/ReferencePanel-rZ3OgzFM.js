import{d as w,A as D,h as J,T as $}from"./FXEngine-C9GwQj6_.js";import{u as U,m as f,P as j}from"./Boot-CjWiSu8L.js";import{Toast as A}from"./Toast-m0Ci56ke.js";import"./main-BTh5zv47.js";import"./tailwind-CVCQhc7L.js";function Q(){var E;const I=U(),[o,R]=w(I.referenceImages||[]),[c,y]=w(I.referenceActiveIdx??0),[k,_]=w(!1),[g,M]=w(null),p=D(null),m=((E=window.TOME)==null?void 0:E.store)||{state:I};J(()=>{try{M(new BroadcastChannel("tome_reference"))}catch{}},[]);const h=(e,t)=>{$.store.update(a=>{a.referenceImages=e,a.referenceActiveIdx=t}),R(e),y(t)},B=()=>{window.open("/transmissao.html","_blank","noopener,noreferrer,width=1280,height=720"),A.show("📺 Telão do Espectador acionado para TV / Segunda Tela!","info")},x=()=>{p.current&&p.current.click()},P=e=>{y(e),$.store.update(t=>{t.referenceActiveIdx=e}),m.state.referenceBroadcast&&u(o[e])},V=()=>{_(!k)},u=(e=o[c])=>{if(e){$.store.update(t=>{t.referenceBroadcast=!0,t.referenceCurrentImg=e.data,t.referenceCurrentName=e.name}),g&&g.postMessage({type:"REFERENCE_IMAGE",data:e.data,name:e.name});try{typeof window<"u"&&window.socket&&typeof window.socket.emit=="function"&&window.socket.emit("state_update",{mapImage:e.data})}catch{console.warn("Falha de envio socket ao telão TV")}A.show(`📡 "${e.name}" enviado para Telão e Celulares dos Jogadores!`,"success")}},F=()=>{const e=[...o];e.splice(c,1);const t=Math.max(0,c-1);h(e,t),m.state.referenceBroadcast&&(e.length>0?u(e[t]):C())},L=(e,t)=>{e.stopPropagation();const a=[...o];a.splice(t,1);const i=c>=a.length?Math.max(0,a.length-1):c;h(a,i),m.state.referenceBroadcast&&(a.length>0?u(a[i]):C())},N=()=>{o.length&&confirm("Remover todas as imagens de referência?")&&(h([],0),C())},C=()=>{$.store.update(e=>{e.referenceBroadcast=!1,e.referenceCurrentImg=null}),g&&g.postMessage({type:"REFERENCE_IMAGE",data:null,name:""})},S=(e,t=1e3,a=1e3,i=.8)=>new Promise(v=>{const r=new Image;r.onload=()=>{const l=document.createElement("canvas");let s=r.width,n=r.height;s>n?s>t&&(n=Math.round(n*t/s),s=t):n>a&&(s=Math.round(s*a/n),n=a),l.width=s,l.height=n,l.getContext("2d").drawImage(r,0,0,s,n);const d=l.toDataURL("image/webp",i);v(d)},r.onerror=()=>v(e),r.src=e}),O=e=>{const t=[...e.target.files];p.current&&(p.current.value=""),t.forEach(a=>{const i=new FileReader;i.onload=async v=>{const r=v.target.result,l=await S(r),s=a.name.replace(/[^a-zA-Z0-9.\-_]/g,"_"),n=`ref_${Date.now()}_${s}`,T=await j.uploadImage(n,l),d=[...o,{name:a.name.replace(/\.[^.]+$/,""),data:T}];h(d,d.length-1),m.state.referenceBroadcast&&u(d[d.length-1])},i.readAsDataURL(a)})},b=o[c];return f`
        <div class="ref-panel">
            <div class="ref-panel-header">
                <span class="ref-panel-title">
                    <i class="fa-solid fa-image"></i> Referência Visual
                </span>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-ghost btn-sm" onClick=${B} title="Abrir Telão Espectador (TV/Projetor)">
                        <i class="fa-solid fa-desktop"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onClick=${x} title="Carregar Imagem">
                        <i class="fa-solid fa-upload"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onClick=${N} title="Limpar Tudo">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <input ref=${p} type="file" id="ref-upload" accept="image/*" style="display:none;" multiple onChange=${O} />

            <div class="ref-display ${k?"ref-lightbox":""}">
                ${b?f`
                    <img src="${b.data}" alt="${b.name}"
                         class="ref-img" onClick=${V}
                         title="Clique para ampliar" />
                    <div class="ref-img-label">${b.name}</div>
                    <div class="ref-img-controls">
                        <button class="ref-ctrl-btn" onClick=${()=>u()} title="Enviar para Jogadores e Telão">
                            <i class="fa-solid fa-broadcast-tower"></i>
                        </button>
                        <button class="ref-ctrl-btn danger" onClick=${F} title="Remover">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `:f`
                    <div class="ref-empty">
                        <i class="fa-solid fa-image"></i>
                        <span>Sem imagem</span>
                        <button class="btn btn-ghost btn-sm" onClick=${x}>
                            Carregar
                        </button>
                    </div>
                `}
            </div>

            ${o.length>1?f`
                <div class="ref-thumb-strip">
                    ${o.map((e,t)=>f`
                        <div class="ref-thumb ${t===c?"active":""}"
                             onClick=${()=>P(t)}
                             title="${e.name}">
                            <img src="${e.data}" alt="${e.name}" />
                            <div class="ref-thumb-del" onClick=${a=>L(a,t)}>✕</div>
                        </div>
                    `)}
                </div>
            `:""}

            ${m.state.referenceBroadcast?f`
                <div style="font-size:0.6rem;color:var(--success);text-align:center;padding:4px;display:flex;align-items:center;gap:4px;justify-content:center;">
                    <span style="width:6px;height:6px;background:var(--success);border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
                    Transmitindo para Jogadores e Telão TV
                </div>
            `:""}
        </div>
    `}export{Q as ReferencePanel,Q as default};
