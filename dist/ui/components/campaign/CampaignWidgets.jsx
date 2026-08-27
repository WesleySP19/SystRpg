import { h } from 'preact';
import { renderQuickQuests } from '../QuestLog.js';
import { renderQuickJournal } from '../CampaignNotes.js';
import { renderQuickMonsters } from '../NPCList.js';
export function CampaignWidgets({ storeComponentRef, monsterCount }) {
return (
<div className="flex flex-col gap-6">
{}
<div className="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
<h3 className="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
<span><i className="fa-solid fa-scroll mr-2"></i> Missões & Objetivos</span>
<button className="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" onClick={() => storeComponentRef.quickAddQuest?.()}>
<i className="fa-solid fa-plus"></i> Adicionar
</button>
</h3>
<div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-4 bg-black/40 scrollbar-thin scrollbar-thumb-tomeGold/30">
{renderQuickQuests ? renderQuickQuests(storeComponentRef) : <div className="text-xs text-slate-500">Módulo QuestLog não encontrado.</div>}
</div>
</div>
{}
<div className="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
<h3 className="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
<span><i className="fa-solid fa-book-journal-whills mr-2"></i> Diário Narrativo</span>
<button className="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" onClick={() => storeComponentRef.quickOracleInspire?.()}>
<i className="fa-solid fa-wand-magic-sparkles"></i> Oráculo
</button>
</h3>
<div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto p-4 bg-black/40 scrollbar-thin scrollbar-thumb-tomeGold/30">
{renderQuickJournal ? renderQuickJournal(storeComponentRef) : <div className="text-xs text-slate-500">Módulo CampaignNotes não encontrado.</div>}
</div>
</div>
{}
<div className="card glass p-0 rounded-2xl col-span-2 border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
<h3 className="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
<span><i className="fa-solid fa-dragon mr-2"></i> Bestiário & Combates Ativos</span>
<span className="text-[0.6rem] text-slate-300 font-mono tracking-wider bg-black/50 px-2 py-1 rounded-md border border-tomeGold/20">
{monsterCount} criatura(s)
</span>
</h3>
<div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto p-4 bg-black/40 scrollbar-thin scrollbar-thumb-tomeGold/30">
{renderQuickMonsters ? renderQuickMonsters(storeComponentRef) : <div className="text-xs text-slate-500">Módulo NPCList não encontrado.</div>}
</div>
</div>
</div>
);
}