import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';

export function RefEnvironment() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const topics = [
        // 1. ILUMINAÇÃO & VISIBILIDADE
        {
            category: 'lighting',
            badge: 'Visibilidade',
            badgeColor: '#eab308',
            title: 'Luz Plena (Bright Light)',
            icon: 'fa-sun',
            desc: 'Condição padrão de iluminação ambiental fornecida pelo sol, lanternas fechadas e a maioria das tochas. A maioria das criaturas enxerga normalmente sem qualquer penalidade ou desvantagem mecânica.'
        },
        {
            category: 'lighting',
            badge: 'Visibilidade',
            badgeColor: '#eab308',
            title: 'Penumbra (Dim Light)',
            icon: 'fa-cloud-sun',
            desc: 'Luz tênue de crepúsculo, tochas distantes ou luar pálido. Cria uma área de Camuflagem Leve: criaturas sofrem Desvantagem em testes de Sabedoria (Percepção) que dependem da visão e -5 na Percepção Passiva.'
        },
        {
            category: 'lighting',
            badge: 'Visibilidade',
            badgeColor: '#ef4444',
            title: 'Escuridão Total (Darkness)',
            icon: 'fa-moon',
            desc: 'Cria uma área de Camuflagem Pesada. Bloqueia totalmente a visão: criaturas sem Visão no Escuro são consideradas sob a condição Cego ao tentar ver alvos e o ambiente ao redor.'
        },
        {
            category: 'lighting',
            badge: 'Visibilidade',
            badgeColor: '#a855f7',
            title: 'Camuflagem (Obscurement)',
            icon: 'fa-smog',
            desc: 'Leve (neblina rala, folhagens esparsas, penumbra): Desvantagem em Percepção visual. Pesada (neblina densa, escuridão total, fumaça espessa): Bloqueia a visão completamente; atacantes têm Vantagem e ataques sofridos têm Desvantagem se souberem a localização por som.'
        },

        // 2. SENTIDOS ESPECIAIS
        {
            category: 'senses',
            badge: 'Sentidos',
            badgeColor: '#06b6d4',
            title: 'Visão no Escuro (Darkvision)',
            icon: 'fa-eye',
            desc: 'Permite enxergar na escuridão como se fosse penumbra (em tons de cinza, sem distinguir cores) e na penumbra como se fosse luz plena, geralmente até 18 metros (60 pés). Não permite ver através de escuridão mágica.'
        },
        {
            category: 'senses',
            badge: 'Sentidos',
            badgeColor: '#06b6d4',
            title: 'Percepção às Cegas (Blindsight)',
            icon: 'fa-radar',
            desc: 'A criatura percebe efetivamente seus arredores dentro de um raio específico sem depender da visão (ecolocalização, audição ultrassensível, olfato). Enxerga alvos invisíveis e não é afetada por escuridão ou cegueira.'
        },
        {
            category: 'senses',
            badge: 'Sentidos',
            badgeColor: '#06b6d4',
            title: 'Sentido Sísmico (Tremorsense)',
            icon: 'fa-wave-square',
            desc: 'Detecta a localização exata de criaturas e objetos em contato com a mesma superfície de solo ou rocha dentro do alcance. Não detecta criaturas voadoras ou incorpóreas.'
        },
        {
            category: 'senses',
            badge: 'Sentidos',
            badgeColor: '#f59e0b',
            title: 'Visão Verdadeira (Truesight)',
            icon: 'fa-eye-low-vision',
            desc: 'A forma definitiva de percepção visual: enxerga na escuridão mágica normal, enxerga criaturas e objetos invisíveis, detecta ilusões automaticamente e tem sucesso em testes contra elas, e percebe a forma original de transmorfos.'
        },

        // 3. COBERTURA TÁTICA
        {
            category: 'cover',
            badge: 'Cobertura',
            badgeColor: '#10b981',
            title: 'Meia Cobertura (1/2 Cover)',
            icon: 'fa-shield-halved',
            desc: 'O alvo tem metade do corpo protegido por um obstáculo (mureta baixa, tronco caído, outro combatente de tamanho similar). Concede um bônus de +2 na Classe de Armadura (CA) e +2 em salvaguardas de Destreza.'
        },
        {
            category: 'cover',
            badge: 'Cobertura',
            badgeColor: '#10b981',
            title: 'Três Quartos (3/4 Cover)',
            icon: 'fa-shield',
            desc: 'Aproximadamente 75% do corpo está protegido (fresta de seteira, gradeamento de ferro espesso, porta entreaberta). Concede um bônus massivo de +5 na Classe de Armadura (CA) e +5 em salvaguardas de Destreza.'
        },
        {
            category: 'cover',
            badge: 'Cobertura',
            badgeColor: '#10b981',
            title: 'Cobertura Total (Total Cover)',
            icon: 'fa-cubes',
            desc: 'O alvo está completamente encoberto por um obstáculo físico. Não pode ser alvejado diretamente por nenhum ataque ou magia, embora algumas magias de área com efeito esférico possam contornar quinas.'
        },

        // 4. MOVIMENTO, QUEDAS & SALTOS
        {
            category: 'movement',
            badge: 'Movimentação',
            badgeColor: '#3b82f6',
            title: 'Terreno Difícil (Difficult Terrain)',
            icon: 'fa-shoe-prints',
            desc: 'Lamaçal, entulho, escadarias em espiral íngremes, pântanos ou raízes retorcidas. Cada 1,5m (5 pés) de deslocamento custa 3m (10 pés), efetivamente cortando o avanço pela metade.'
        },
        {
            category: 'movement',
            badge: 'Movimentação',
            badgeColor: '#ef4444',
            title: 'Quedas & Aterrissagens',
            icon: 'fa-person-falling',
            desc: 'Uma criatura sofre 1d6 de dano de Concussão para cada 3 metros (10 pés) de queda livre (até o teto de 20d6) e cai sob a condição Caído (Prone). Quedas na água profunda podem ter dano reduzido pelo Mestre com teste de Atletismo ou Acrobacia.'
        },
        {
            category: 'movement',
            badge: 'Movimentação',
            badgeColor: '#3b82f6',
            title: 'Salto em Distância (Long Jump)',
            icon: 'fa-arrow-right-arrow-left',
            desc: 'Com corrida de pelo menos 3m: percorre uma distância igual ao seu valor de Força em pés (ex: FOR 16 = 4,8 metros / 16 pés). Sem corrida prévia de 3m: salta apenas metade dessa distância.'
        },
        {
            category: 'movement',
            badge: 'Movimentação',
            badgeColor: '#3b82f6',
            title: 'Salto em Altura (High Jump)',
            icon: 'fa-up-long',
            desc: 'Com corrida de pelo menos 3m: salta 3 + Modificador de Força em pés (mínimo de 0 pés). Sem corrida prévia de 3m: salta apenas metade dessa altura. O personagem pode estender os braços para alcançar 1,5x sua própria altura acima do salto.'
        },
        {
            category: 'movement',
            badge: 'Movimentação',
            badgeColor: '#3b82f6',
            title: 'Levantar-se do Chão (Standing Up)',
            icon: 'fa-person-walking-arrow-loop-left',
            desc: 'Levantar-se da condição Caído (Prone) consome metade de todo o seu deslocamento base na rodada. Se seu deslocamento atual for 0 (ex: Agarrado ou Paralisado), você não pode se levantar.'
        },

        // 5. ASFIXIA & AFOGAMENTO
        {
            category: 'survival',
            badge: 'Sobrevivência',
            badgeColor: '#dc2626',
            title: 'Segurar o Fôlego (Suffocation)',
            icon: 'fa-lungs',
            desc: 'Uma criatura consegue prender a respiração por 1 + Modificador de Constituição minutos (mínimo de 30 segundos). Esse tempo é reiniciado se ela puder respirar livremente por pelo menos 1 rodada.'
        },
        {
            category: 'survival',
            badge: 'Sobrevivência',
            badgeColor: '#dc2626',
            title: 'Sem Ar & Asfixia (Choking)',
            icon: 'fa-skull',
            desc: 'Quando o fôlego acaba ou a criatura é sufocada repentinamente, ela sobrevive por um número de rodadas igual ao seu Modificador de Constituição (mínimo de 1 rodada). No início do turno seguinte, seus PV caem para 0, ela fica morrendo e NÃO pode recuperar PV nem ser estabilizada até voltar a respirar!'
        },

        // 6. COMBATE SUBAQUÁTICO
        {
            category: 'aquatic',
            badge: 'Aquático',
            badgeColor: '#0284c7',
            title: 'Ataques Corpo a Corpo Submersos',
            icon: 'fa-water',
            desc: 'Ataques corpo a corpo sofrem Desvantagem, EXCETO se a criatura tiver deslocamento natural de Natação OU se a arma utilizada for perfurante adequada: Adaga, Dardo, Lança, Tridente ou Espada Curta.'
        },
        {
            category: 'aquatic',
            badge: 'Aquático',
            badgeColor: '#0284c7',
            title: 'Projéteis e Fogo Submerso',
            icon: 'fa-crosshairs',
            desc: 'Ataques com armas à distância erram automaticamente além do alcance normal e têm Desvantagem dentro do alcance (exceto Bestas, Redes e dardos arremessados). Qualquer criatura ou objeto totalmente submerso ganha Resistência natural a dano de fogo!'
        },

        // 7. CLIMA EXTREMO
        {
            category: 'hazards',
            badge: 'Perigos',
            badgeColor: '#f97316',
            title: 'Frio Extremo (Extreme Cold)',
            icon: 'fa-snowflake',
            desc: 'Temperaturas abaixo de 0°C. Sem agasalhos térmicos de inverno, cada hora requer uma Salvaguarda de Constituição CD 10; falha concede 1 nível de Exaustão. Criaturas com resistência ou imunidade a dano de frio passam automaticamente.'
        },
        {
            category: 'hazards',
            badge: 'Perigos',
            badgeColor: '#f97316',
            title: 'Calor Extremo (Extreme Heat)',
            icon: 'fa-temperature-high',
            desc: 'Temperaturas acima de 38°C sem abrigo. Exige 4 litros de água por dia (o dobro de dias normais). Sem água abundante ou usando armadura média/pesada, cada hora requer Salvaguarda de Constituição CD 10 (+1 por hora adicional) ou ganha 1 nível de Exaustão.'
        },
        {
            category: 'hazards',
            badge: 'Perigos',
            badgeColor: '#f97316',
            title: 'Ventos Fortes & Tempestades',
            icon: 'fa-wind',
            desc: 'Impõe Desvantagem em ataques com armas de projéteis e testes de Percepção auditiva. Voar contra o vento forte custa o dobro de movimento. Tempestades apagam chamas abertas (tochas, fogueiras) e tornam a área levemente camuflada.'
        },
        {
            category: 'hazards',
            badge: 'Perigos',
            badgeColor: '#dc2626',
            title: 'Lava & Magma Ardente',
            icon: 'fa-fire-flame-curved',
            desc: 'Uma criatura sofre 10d10 de dano de fogo ao entrar em contato direto ou cair em lava. Se iniciar o seu turno completamente submersa em lava incandescente, sofre colossais 18d10 de dano de fogo!'
        },

        // 8. VIAGEM & MARCHA
        {
            category: 'travel',
            badge: 'Exploração',
            badgeColor: '#84cc16',
            title: 'Ritmos de Viagem (Travel Pace)',
            icon: 'fa-compass',
            desc: 'Rápido: 6 km/h (48 km/dia), penalidade de -5 na Percepção Passiva. Normal: 4,5 km/h (36 km/dia). Lento: 3 km/h (24 km/dia), permite ao grupo mover-se em Furtividade para surpreender emboscadas ou evitar patrulhas.'
        },
        {
            category: 'travel',
            badge: 'Exploração',
            badgeColor: '#84cc16',
            title: 'Marcha Forçada (Forced March)',
            icon: 'fa-person-hiking',
            desc: 'Um grupo pode viajar até 8 horas por dia sem penalidades. Cada hora adicional além das 8 horas diárias exige uma Salvaguarda de Constituição CD 10 + 1 por hora excedente. Em caso de falha, o personagem sofre 1 nível de Exaustão.'
        }
    ];

    const categories = [
        { id: 'all', label: 'Tudo', icon: 'fa-border-all' },
        { id: 'lighting', label: 'Luz & Visão', icon: 'fa-sun' },
        { id: 'senses', label: 'Sentidos', icon: 'fa-eye' },
        { id: 'cover', label: 'Cobertura', icon: 'fa-shield-halved' },
        { id: 'movement', label: 'Movimento', icon: 'fa-shoe-prints' },
        { id: 'survival', label: 'Asfixia & Fôlego', icon: 'fa-lungs' },
        { id: 'aquatic', label: 'Aquático', icon: 'fa-water' },
        { id: 'hazards', label: 'Clima & Perigos', icon: 'fa-fire' },
        { id: 'travel', label: 'Viagem & Marcha', icon: 'fa-compass' }
    ];

    const filteredTopics = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return topics.filter(t => {
            if (activeCategory !== 'all' && t.category !== activeCategory) return false;
            if (q) {
                return t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.badge.toLowerCase().includes(q);
            }
            return true;
        });
    }, [activeCategory, searchQuery]);

    return (
        <div className="animate-fadeIn font-sans pb-8">
            {/* Header com destaque */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-emerald-500/20 gap-4">
                <div>
                    <h3 className="font-cinzel text-emerald-400 m-0 text-2xl sm:text-3xl flex items-center gap-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <i className="fa-solid fa-mountain-sun"></i>
                        Ambiente, Exploração & Sobrevivência
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 m-0 mt-1.5 leading-relaxed">
                        Referência tática e regras completas de clima, cobertura, combate aquático, quedas, asfixia e viagens.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[0.7rem] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                        {filteredTopics.length} Tópicos
                    </span>
                </div>
            </div>

            {/* Barra de Busca e Filtros de Categoria */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input 
                        type="text"
                        placeholder="Buscar regras de ambiente (ex: asfixia, lava, penumbra, cobertura, salto)..."
                        value={searchQuery}
                        onInput={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/25 text-white text-xs sm:text-sm placeholder-slate-500 outline-none focus:border-emerald-400 transition-colors shadow-inner"
                    />
                    {searchQuery && (
                        <button 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Badges de Categoria */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {categories.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    isActive
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                        : 'bg-black/30 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-slate-200'
                                }`}
                            >
                                <i className={`fa-solid ${cat.icon} text-[0.7rem]`}></i>
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid de Cards Temáticos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map((topic, i) => (
                    <div 
                        key={i} 
                        className="card glass-accent bg-black/40 p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:bg-black/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                    >
                        {/* Linha de borda superior colorida */}
                        <div 
                            className="absolute top-0 left-0 right-0 h-[3px]"
                            style={{ 
                                background: topic.badgeColor,
                                boxShadow: `0 0 10px ${topic.badgeColor}88`
                            }}
                        ></div>

                        <div>
                            {/* Header do Card */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                        style={{ 
                                            background: `${topic.badgeColor}20`,
                                            color: topic.badgeColor,
                                            border: `1px solid ${topic.badgeColor}40`
                                        }}
                                    >
                                        <i className={`fa-solid ${topic.icon}`}></i>
                                    </div>
                                    <h4 className="font-cinzel text-white text-[1.05rem] m-0 font-bold leading-tight group-hover:text-emerald-300 transition-colors">
                                        {topic.title}
                                    </h4>
                                </div>
                                <span 
                                    className="text-[0.62rem] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0"
                                    style={{
                                        background: `${topic.badgeColor}15`,
                                        color: topic.badgeColor,
                                        border: `1px solid ${topic.badgeColor}40`
                                    }}
                                >
                                    {topic.badge}
                                </span>
                            </div>

                            {/* Descrição Mecânica */}
                            <p className="text-[0.82rem] leading-relaxed text-slate-300 m-0">
                                {topic.desc}
                            </p>
                        </div>
                    </div>
                ))}

                {filteredTopics.length === 0 && (
                    <div className="col-span-full text-center p-12 text-slate-500">
                        <i className="fa-solid fa-compass text-4xl mb-3 opacity-30 text-emerald-400"></i>
                        <h4 className="font-cinzel text-lg text-slate-300 m-0">Nenhuma regra encontrada</h4>
                        <p className="text-xs text-slate-500 mt-1">Tente pesquisar por termos como "queda", "asfixia", "cobertura" ou selecione outra categoria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
