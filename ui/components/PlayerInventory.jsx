
export function renderBioInventoryTab(p, context) {
    return (
        <div class="tab-content {context._currentTab === 'bio' ? 'active' : ''}">
             <div style="display:grid; grid-template-columns: 350px 1fr 1fr; gap:30px;">
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div class="skills-list"><label class="sheet-section-title">TRAÇOS</label><textarea class="legacy-textarea" name="traits" rows="4">{p.roleplay?.traits || ''}</textarea></div>
                    <div class="skills-list"><label class="sheet-section-title">IDEAIS</label><textarea class="legacy-textarea" name="ideals" rows="2">{p.roleplay?.ideals || ''}</textarea></div>
                    <div class="skills-list"><label class="sheet-section-title">VÍNCULOS</label><textarea class="legacy-textarea" name="bonds" rows="2">{p.roleplay?.bonds || ''}</textarea></div>
                    <div class="skills-list"><label class="sheet-section-title">FRAQUEZAS</label><textarea class="legacy-textarea" name="flaws" rows="2">{p.roleplay?.flaws || ''}</textarea></div>
                    
                    <div class="skills-list" style="padding:15px; display:grid; grid-template-columns: 40px 1fr; gap:10px; align-items:center;">
                        <span style="font-weight:900; color:var(--accent);">PL</span> <input name="coin_pp" type="number" class="legacy-input" style="text-align:right;" value="{p.currency?.pp !== undefined ? p.currency.pp : ''}" />
                        <span style="font-weight:900; color:goldenrod;">PO</span> <input name="coin_gp" type="number" class="legacy-input" style="text-align:right;" value="{p.currency?.gp !== undefined ? p.currency.gp : ''}" />
                        <span style="font-weight:900; color:silver;">PE</span> <input name="coin_ep" type="number" class="legacy-input" style="text-align:right;" value="{p.currency?.ep !== undefined ? p.currency.ep : ''}" />
                        <span style="font-weight:900; color:brown;">PP</span> <input name="coin_sp" type="number" class="legacy-input" style="text-align:right;" value="{p.currency?.sp !== undefined ? p.currency.sp : ''}" />
                        <span style="font-weight:900; color:#b57d4c;">PC</span> <input name="coin_cp" type="number" class="legacy-input" style="text-align:right;" value="{p.currency?.cp !== undefined ? p.currency.cp : ''}" />
                    </div>
                </div>
                
                <div class="skills-list" style="display:flex; flex-direction:column; gap:10px;">
                    <label class="sheet-section-title">EQUIPAMENTO & POSSES</label>
                    <div id="inventory-container" style="display:flex; flex-direction:column; gap:5px;">
                        {context._renderInventoryRows()}
                    </div>
                    <button type="button" class="btn btn-ghost btn-sm btn-block" data-action="addInventoryRow">+ ADICIONAR ITEM</button>
                    <textarea class="legacy-textarea" name="items_notes" placeholder="Outras posses e notas de carga..." style="height:150px; font-size:0.7rem; margin-top:10px;">{p.equipment?.notes || ''}</textarea>
                </div>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div class="skills-list"><label class="sheet-section-title">HISTÓRIA DO PERSONAGEM</label><textarea class="legacy-textarea" name="bio" rows="15">{p.bio || ''}</textarea></div>
                    <div class="skills-list"><label class="sheet-section-title">ALIADOS & ORGANIZAÇÕES</label><textarea class="legacy-textarea" name="allies" rows="8">{p.allies || ''}</textarea></div>
                </div>
             </div>
        </div>
    );
}
