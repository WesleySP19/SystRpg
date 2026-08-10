import { html } from 'htm/preact';

export function renderQuickQuests(context) {
    const quests = context.store.state.quests || [];
    if (quests.length === 0) {
        return html`<div class="text-xs text-slate-500 italic text-center p-4">Nenhuma missão ativa no momento.</div>`;
    }
    return quests.map(q => {
        const isCompleted = q.completed || q.status === 'completed';
        const isFailed = q.failed || q.status === 'failed';
        return html`
            <div class="bg-white/5 border border-white/5 p-3 rounded-lg flex flex-col gap-2 text-xs">
                <div class="flex justify-between items-start">
                    <div class="flex-1 pr-2">
                        <strong class="${isCompleted ? 'text-green-500 line-through opacity-80' : isFailed ? 'text-red-500 line-through opacity-80' : 'text-slate-300'}">${q.title}</strong>
                        <span class="text-[0.65rem] text-slate-500 block mt-0.5">Recompensa: ${q.reward || 'Nenhuma'}</span>
                    </div>
                    <span class="text-[0.6rem] uppercase font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${isCompleted ? 'text-green-500 bg-green-500/10' : isFailed ? 'text-red-500 bg-red-500/10' : 'text-yellow-400 bg-yellow-400/10'}">
                        ${isCompleted ? 'Concluída' : isFailed ? 'Fracassada' : 'Pendente'}
                    </span>
                </div>
                
                <div class="flex justify-between items-center border-t border-white/5 pt-1.5 mt-0.5">
                    <!-- Delete action -->
                    <button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.65rem] text-red-500 border border-red-500/20 bg-red-500/5 rounded" data-action="quickDeleteQuest" data-id="${q.id}">
                        <i class="fa-solid fa-trash-can mr-1"></i> Apagar
                    </button>
                    
                    <div class="flex gap-1">
                        ${!isCompleted && !isFailed ? html`
                            <button class="btn btn-ghost btn-sm px-2 py-0.5 text-[0.65rem] text-red-500 border-2 border-red-500/20 rounded" data-action="quickFailQuest" data-id="${q.id}">
                                <i class="fa-solid fa-skull mr-1"></i> Falhar
                            </button>
                            <button class="btn btn-sm btn-ghost px-2 py-0.5 text-[0.65rem] text-green-400 border-2 border-green-500/30 bg-green-500/5 rounded" data-action="quickCompleteQuest" data-id="${q.id}">
                                <i class="fa-solid fa-check mr-1"></i> Concluir
                            </button>
                        ` : ''}
                        
                        ${isCompleted && q.reward && q.reward !== 'Nenhuma' ? html`
                            ${!q.rewardDistributed ? html`
                                <button class="btn btn-ghost btn-sm px-2 py-0.5 text-[0.65rem] text-emerald-400 border-2 border-emerald-500/35 bg-emerald-500/10 rounded" data-action="quickLootQuest" data-id="${q.id}">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i> Loot
                                </button>
                            ` : html`
                                <span class="text-[0.62rem] text-emerald-400 font-bold uppercase tracking-wide px-1.5 py-0.5 bg-emerald-500/5 rounded inline-flex items-center gap-1">
                                    <i class="fa-solid fa-circle-check"></i> Loot Entregue
                                </span>
                            `}
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
}
