const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Boot-nUpoHU-k.js","assets/FXEngine-C1PzBub2.js"])))=>i.map(i=>d[i]);
import"./tailwind-CVCQhc7L.js";const f="modulepreload",p=function(t){return"/"+t},d={},y=function(a,i,E){let c=Promise.resolve();if(i&&i.length>0){document.getElementsByTagName("link");const e=document.querySelector("meta[property=csp-nonce]"),r=(e==null?void 0:e.nonce)||(e==null?void 0:e.getAttribute("nonce"));c=Promise.allSettled(i.map(o=>{if(o=p(o),o in d)return;d[o]=!0;const s=o.endsWith(".css"),m=s?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${o}"]${m}`))return;const n=document.createElement("link");if(n.rel=s?"stylesheet":f,s||(n.as="script"),n.crossOrigin="",n.href=o,r&&n.setAttribute("nonce",r),document.head.appendChild(n),s)return new Promise((u,h)=>{n.addEventListener("load",u),n.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${o}`)))})}))}function l(e){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=e,window.dispatchEvent(r),!r.defaultPrevented)throw e}return c.then(e=>{for(const r of e||[])r.status==="rejected"&&l(r.reason);return a().catch(l)})};(async()=>{if(window.location.search.includes("reset=1")){localStorage.removeItem("DM_JWT_TOKEN"),localStorage.removeItem("DM_ACTIVE_TABLE"),window.location.search="";return}try{const{startApp:t}=await y(async()=>{const{startApp:a}=await import("./Boot-nUpoHU-k.js").then(i=>i.B);return{startApp:a}},__vite__mapDeps([0,1]));await t()}catch(t){console.error("[Boot] Falhou:",t);const a=document.getElementById("app-root")||document.body;a.innerHTML=`
            <div style="padding:3rem; color:#f43f5e; text-align:center; font-family:system-ui; background:#050508; min-height:100vh;">
                <h2>Erro de Inicialização</h2>
                <p style="color:#7a7a8e;">${t&&t.message?t.message:t}</p>
                <p style="margin-top:20px;">
                    <a href="/index.html?reset=1" style="color:#fbbf24; text-decoration:underline;">
                        Limpar cache e tentar novamente
                    </a>
                </p>
            </div>
        `}})();export{y as _};
