/**
 * DiceBoxService - Gerencia o motor de física 3D para dados (Phase 10)
 * Utiliza @3d-dice/dice-box carregado via CDN.
 */
export class DiceBoxService {
    constructor() {
        this.box = null;
        this.initialized = false;
        this.containerId = 'dice-box-container';
        
        // Garantir que o container existe
        if (!document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
    }

    /**
     * Inicializa preguiçosamente (lazy load) o motor 3D
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Importar dinamicamente o ES Module do CDN
            const { default: DiceBox } = await import('https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js');
            
            this.box = new DiceBox(`#${this.containerId}`, {
                assetPath: 'https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/assets/',
                theme: 'default',
                themeColor: '#c5a059',
                scale: 6,
                spinForce: 5,
                throwForce: 7,
                gravity: 3,
                mass: 2,
                friction: 0.8
            });

            await this.box.init();
            
            // Corrige possível problema do canvas interceptar cliques quando não está rolando
            const canvas = document.querySelector(`#${this.containerId} canvas`);
            if (canvas) {
                canvas.style.pointerEvents = 'none';
            }

            this.initialized = true;
            console.log('[DiceBoxService] Motor de física 3D inicializado com sucesso.');
        } catch (error) {
            console.error('[DiceBoxService] Erro ao inicializar motor 3D:', error);
            throw error;
        }
    }

    /**
     * Rola dados com física 3D
     * @param {string|number} notation Pode ser "1d20", "2d6+2" ou apenas o número de lados (ex: 20)
     * @returns {Promise<number>} O total numérico da rolagem
     */
    async roll(notation) {
        if (!this.initialized) await this.init();

        let rollString = typeof notation === 'number' ? `1d${notation}` : notation;

        try {
            // DiceBox.roll retorna os resultados da física assim que o dado parar
            const results = await this.box.roll(rollString);
            
            // O retorno costuma ser um array com os grupos de dados. Somamos o 'value' de cada grupo
            let total = 0;
            if (Array.isArray(results)) {
                total = results.reduce((acc, group) => acc + (group.value || 0), 0);
            } else if (results.value) {
                total = results.value;
            } else {
                total = results;
            }

            // Oculta os dados após 3 segundos
            setTimeout(() => {
                this.box.clear();
            }, 3000);

            return total;
        } catch (err) {
            console.error('[DiceBoxService] Erro ao rolar:', err);
            // Fallback se falhar
            return Math.floor(Math.random() * (typeof notation === 'number' ? notation : 20)) + 1;
        }
    }
}
