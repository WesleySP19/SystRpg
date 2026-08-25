import{C as s}from"./Boot-CB2yJVwc.js";class i extends s{constructor(t={}){super(t),this._title=t.title||"Aviso",this._content=t.content||"",this._type=t.type||"info",this._onConfirm=t.onConfirm||null,this._onCancel=t.onCancel||null,this._resolve=null}static show(t){const e=document.createElement("div");e.id=`modal-${Date.now()}`,document.body.appendChild(e);const n=new i({...t,element:e});return n.mount(),n}static confirm(t,e,n="confirm"){return new Promise(o=>{i.show({title:t,content:e,type:n,onConfirm:()=>o(!0),onCancel:()=>o(!1)})})}static alert(t,e,n="info"){return new Promise(o=>{i.show({title:t,content:e,type:n,onConfirm:()=>o(!0)})})}template(){this._type;const t=this._type==="danger"?"fa-triangle-exclamation":this._type==="confirm"?"fa-circle-question":"fa-circle-info",e=this._type==="danger"?"border-red-500":"border-tomeGold",n=this._type==="danger"?"text-red-500":"text-tomeGold",o=this._type==="danger"?"bg-red-500 hover:bg-red-600":"bg-tomeGold hover:bg-tomeGold-bright";return`
            <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-5 animate-in fade-in duration-300">
                <div class="modal-card relative w-full max-w-[500px] border-t-4 ${e} bg-obsidian-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div class="modal-header px-6 py-5 border-b border-white/5 flex items-center gap-3">
                        <i class="fa-solid ${t} ${n} text-xl"></i>
                        <h2 class="m-0 font-cinzel text-lg font-bold tracking-wide text-slate-100">${this._title}</h2>
                    </div>
                    
                    <div class="modal-body px-7 py-6 text-sm text-slate-300 leading-relaxed font-sans">
                        ${this._content.replace(/\n/g,"<br>")}
                    </div>
                    
                    <div class="modal-footer px-7 py-4 bg-black/40 flex justify-end gap-3">
                        ${this._type==="confirm"||this._type==="danger"?`
                            <button class="px-4 py-2 rounded-lg font-sans text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-slate-200 transition-colors" data-action="cancel">CANCELAR</button>
                        `:""}
                        <button class="px-6 py-2 rounded-lg font-sans text-sm font-semibold text-white ${o} min-w-[100px] transition-colors shadow-lg" data-action="confirm">
                            ${this._type==="confirm"||this._type==="danger"?"CONFIRMAR":"OK"}
                        </button>
                    </div>
                </div>
            </div>
        `}confirm(){this._onConfirm&&this._onConfirm(),this.close()}cancel(){this._onCancel&&this._onCancel(),this.close()}close(){this.unmount(),this.element.remove()}}export{i as M};
