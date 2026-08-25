import { html } from 'htm/preact';
export function renderTable(context) {
    if (context._selectedTable === 'dc') {
        return html`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th>Grau de Dificuldade</th>
                        <th style="text-align:right;">Classe de Dificuldade (CD)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Muito Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">05</td></tr>
                    <tr><td>Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">10</td></tr>
                    <tr><td>Médio</td><td style="text-align:right; font-weight:800; color:var(--accent);">15</td></tr>
                    <tr><td>Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">20</td></tr>
                    <tr><td>Muito Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">25</td></tr>
                    <tr><td>Quase Impossível</td><td style="text-align:right; font-weight:800; color:var(--accent);">30</td></tr>
                </tbody>
            </table>
        `;
    }
    if (context._selectedTable === 'travel') {
        return html`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th style="color:var(--info);">Ritmo de Marcha</th>
                        <th>Distância/Dia</th>
                        <th style="text-align:right;">Efeito em Jogo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="font-weight:800; color:var(--info);">Rápido</td><td>45 km (30 milhas)</td><td style="text-align:right; color:var(--danger);">-5 Percepção Passiva</td></tr>
                    <tr><td style="font-weight:800; color:var(--info);">Normal</td><td>36 km (24 milhas)</td><td style="text-align:right; color:var(--text-dim);">Nenhum</td></tr>
                    <tr><td style="font-weight:800; color:var(--info);">Lento</td><td>27 km (18 milhas)</td><td style="text-align:right; color:var(--success);">Permite Furtividade</td></tr>
                </tbody>
            </table>
        `;
    }
    if (context._selectedTable === 'light') {
        return html`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th style="color:var(--warning);">Fonte de Ignição</th>
                        <th>Luminosidade Plena</th>
                        <th style="text-align:right;">Luz Ofuscada</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="font-weight:800; color:var(--warning);">Tocha</td><td>Raio de 6m (20ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 6m adicionais</td></tr>
                    <tr><td style="font-weight:800; color:var(--warning);">Lanterna Furta-Fogo</td><td>Cone de 18m (60ft)</td><td style="text-align:right; color:var(--text-dim);">Cone de +18m</td></tr>
                    <tr><td style="font-weight:800; color:var(--warning);">Vela</td><td>Raio de 1,5m (5ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 1,5m adicionais</td></tr>
                </tbody>
            </table>
        `;
    }
    if (context._selectedTable === 'armor') {
        return html`
            <table class="shield-table" style="font-size:0.75rem;">
                <thead>
                    <tr style="text-align:left;">
                        <th>Armadura</th>
                        <th>Classe de Armadura (CA)</th>
                        <th style="text-align:right;">Furtividade</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Leves -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Leves</td></tr>
                    <tr><td>Acolchoada</td><td>11 + mod. Des</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <tr><td>Couro</td><td>11 + mod. Des</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Couro Batido</td><td>12 + mod. Des</td><td style="text-align:right;">—</td></tr>
                    <!-- Médias -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Médias</td></tr>
                    <tr><td>Camisão de Malha</td><td>13 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Peitoral</td><td>14 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Meia Armadura</td><td>15 + mod. Des (máx +2)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <!-- Pesadas -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Pesadas</td></tr>
                    <tr><td>Cota de Malha</td><td>16 (Req: For 13)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <tr><td>Placas</td><td>18 (Req: For 15)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <!-- Escudo -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Escudos</td></tr>
                    <tr><td>Escudo comum</td><td>+2 de Bônus na CA</td><td style="text-align:right;">—</td></tr>
                </tbody>
            </table>
        `;
    }
    if (context._selectedTable === 'prof') {
        return html`
            <div style="display:flex; gap:15px;">
                <table class="shield-table" style="flex:1;">
                    <thead>
                        <tr style="text-align:center;">
                            <th style="color:var(--success); text-align:center;">Níveis (1 a 10)</th>
                            <th style="color:var(--success); text-align:center;">Bônus</th>
                        </tr>
                    </thead>
                    <tbody style="text-align:center;">
                        <tr>
                            <td>Nível 1 a 4</td>
                            <td style="font-weight:800; color:var(--success);">+2</td>
                        </tr>
                        <tr>
                            <td>Nível 5 a 8</td>
                            <td style="font-weight:800; color:var(--success);">+3</td>
                        </tr>
                        <tr>
                            <td>Nível 9 a 10</td>
                            <td style="font-weight:800; color:var(--success);">+4</td>
                        </tr>
                    </tbody>
                </table>
                <table class="shield-table" style="flex:1;">
                    <thead>
                        <tr style="text-align:center;">
                            <th style="color:var(--success); text-align:center;">Níveis (11 a 20)</th>
                            <th style="color:var(--success); text-align:center;">Bônus</th>
                        </tr>
                    </thead>
                    <tbody style="text-align:center;">
                        <tr>
                            <td>Nível 11 a 12</td>
                            <td style="font-weight:800; color:var(--success);">+4</td>
                        </tr>
                        <tr>
                            <td>Nível 13 a 16</td>
                            <td style="font-weight:800; color:var(--success);">+5</td>
                        </tr>
                        <tr>
                            <td>Nível 17 a 20</td>
                            <td style="font-weight:800; color:var(--success);">+6</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    if (context._selectedTable === 'conditions') {
        return html`
            <div class="custom-scroll" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                <table class="shield-table" style="font-size:0.75rem;">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="color:var(--danger); width:35%;">Condição</th>
                            <th style="color:var(--danger);">Efeitos Principais</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Agarramento</td>
                            <td style="color:var(--text-dim);">Deslocamento torna-se 0 e não se beneficia de bônus no deslocamento. Termina se o agarrador for incapacitado.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Amedrontado</td>
                            <td style="color:var(--text-dim);">Desvantagem em ataques e testes se puder ver a fonte do medo. Não pode se aproximar voluntariamente da fonte.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Atordoado</td>
                            <td style="color:var(--text-dim);">Incapacitado, não pode se mover, falha automática em For/Des. Ataques contra têm Vantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Caído</td>
                            <td style="color:var(--text-dim);">Apenas rasteja. Desvantagem nos próprios ataques. Ataques corpo-a-corpo contra têm Vantagem. Distância têm Desvantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Cego</td>
                            <td style="color:var(--text-dim);">Falha automática em testes de visão. Ataques do alvo têm Desvantagem; ataques contra o alvo têm Vantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Enfeitiçado</td>
                            <td style="color:var(--text-dim);">Não pode atacar o charmoso. Charmoso tem Vantagem em interações sociais com o alvo.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Envenenado</td>
                            <td style="color:var(--text-dim);">Desvantagem em jogadas de ataque e testes de habilidade.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Impedido</td>
                            <td style="color:var(--text-dim);">Deslocamento 0. Ataques do alvo têm Desvantagem; contra têm Vantagem. Desvantagem em testes de Des.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Invisível</td>
                            <td style="color:var(--text-dim);">Inalvejável para coisas que requerem visão. Ataques têm Vantagem; ataques contra têm Desvantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Paralisado</td>
                            <td style="color:var(--text-dim);">Incapacitado e não se move. Falha auto For/Des. Ataques contra têm Vantagem. Acertos corpo-a-corpo são críticos automáticos.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}
