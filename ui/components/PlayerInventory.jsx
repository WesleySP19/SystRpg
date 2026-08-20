
export function renderBioInventoryTab(p, context) {
    return (
        <div className="tab-content {context._currentTab === 'bio' ? 'active' : ''}">
             <div class="grid grid-cols-1 md:grid-cols-[350px_1fr_1fr] gap-8">
                <div class="flex flex-col gap-4">
                    <div className="skills-list"><label className="sheet-section-title">TRAÇOS</label><textarea className="legacy-textarea" name="traits" rows="4">{p.roleplay?.traits || ''}</textarea></div>
                    <div className="skills-list"><label className="sheet-section-title">IDEAIS</label><textarea className="legacy-textarea" name="ideals" rows="2">{p.roleplay?.ideals || ''}</textarea></div>
                    <div className="skills-list"><label className="sheet-section-title">VÍNCULOS</label><textarea className="legacy-textarea" name="bonds" rows="2">{p.roleplay?.bonds || ''}</textarea></div>
                    <div className="skills-list"><label className="sheet-section-title">FRAQUEZAS</label><textarea className="legacy-textarea" name="flaws" rows="2">{p.roleplay?.flaws || ''}</textarea></div>
                    
                    <div className="skills-list p-4 grid grid-cols-[40px_1fr] gap-2.5 items-center">
                        <span class="font-extrabold text-accent">PL</span> <input name="coin_pp" type="number" className="legacy-input text-right" value="{p.currency?.pp !== undefined ? p.currency.pp : ''}" />
                        <span class="font-extrabold text-[#daa520]">PO</span> <input name="coin_gp" type="number" className="legacy-input text-right" value="{p.currency?.gp !== undefined ? p.currency.gp : ''}" />
                        <span class="font-extrabold text-[#c0c0c0]">PE</span> <input name="coin_ep" type="number" className="legacy-input text-right" value="{p.currency?.ep !== undefined ? p.currency.ep : ''}" />
                        <span class="font-extrabold text-[#a52a2a]">PP</span> <input name="coin_sp" type="number" className="legacy-input text-right" value="{p.currency?.sp !== undefined ? p.currency.sp : ''}" />
                        <span class="font-extrabold text-[#b57d4c]">PC</span> <input name="coin_cp" type="number" className="legacy-input text-right" value="{p.currency?.cp !== undefined ? p.currency.cp : ''}" />
                    </div>
                </div>
                
                <div className="skills-list flex flex-col gap-2.5">
                    <label className="sheet-section-title">EQUIPAMENTO & POSSES</label>
                    <div id="inventory-container" class="flex flex-col gap-1.5">
                        {context._renderInventoryRows()}
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm btn-block" data-action="addInventoryRow">+ ADICIONAR ITEM</button>
                    <textarea className="legacy-textarea h-[150px] text-[0.7rem] mt-2.5" name="items_notes" placeholder="Outras posses e notas de carga...">{p.equipment?.notes || ''}</textarea>
                </div>
                <div class="flex flex-col gap-4">
                    <div className="skills-list"><label className="sheet-section-title">HISTÓRIA DO PERSONAGEM</label><textarea className="legacy-textarea" name="bio" rows="15">{p.bio || ''}</textarea></div>
                    <div className="skills-list"><label className="sheet-section-title">ALIADOS & ORGANIZAÇÕES</label><textarea className="legacy-textarea" name="allies" rows="8">{p.allies || ''}</textarea></div>
                </div>
             </div>
        </div>
    );
}
