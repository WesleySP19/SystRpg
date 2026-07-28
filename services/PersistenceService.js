import { TOME } from '../core/Registry.js';
import { MatchHistoryService } from './MatchHistoryService.js';

/**
 * PERSISTENCE SERVICE v4.0 — "JSON File Sync" Edition
 * Now saves and loads directly from the project's /data folder.
 */
const DEFAULT_INITIAL_STATE = {
    activeView: 'home',
    activeTab: 'dashboard',
    players: [],
    monsters: [],
    savedNPCs: [],
    initiativeOrder: [],
    concentration: [],
    combatRound: 0,
    combatActive: false,
    journalEntries: [],
    sessionNotes: '',
    sessionTitle: '',
    sessionNumber: 1,
    sessionsHistory: [],
    campaigns: [],
    activeCampaignId: null,
    quests: [],
    tacticalMap: { fog: null, mapUrl: null, tokens: [] },
    lastLoot: null,
    audioMuted: false,
    currentTheme: 'default',
    currentEnvironment: 'default',
    resources: { potions: 0, scrolls: 0 },
    xpDistributed: 0,
    schemaVersion: 5
};

export class PersistenceService {
    constructor() {
        this.filename = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
        this._isSaving = false;
        this._maxSnapshots = 5;
    }

    static _getAuthHeaders(headers = {}) {
        const token = localStorage.getItem('DM_JWT_TOKEN');
        const newHeaders = { ...headers };
        if (token) {
            newHeaders['Authorization'] = `Bearer ${token}`;
        }
        return newHeaders;
    }

    async init() {
        console.log('[Persistence] Iniciando Sincronização de Arquivo Local...');

        // Sincronização entre abas em tempo real
        window.addEventListener('storage', (e) => {
            if (e.key === `TOME_PRO_STATE_${this.filename}` && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    const current = TOME.store.snapshot();
                    // Evita loops infinitos de salvamento circular
                    if (JSON.stringify(current) !== e.newValue) {
                        TOME.store.update(s => Object.assign(s, data));
                        console.log('[Persistence] Estado sincronizado a partir de outra aba.');
                    }
                } catch (err) {
                    console.error('[Persistence] Falha ao reativo-sincronizar abas:', err);
                }
            }
        });

        // Purga automática de snapshots locais antigos (> 30 dias)
        try {
            const snapshotsKey = `TOME_SNAPSHOTS_${this.filename}`;
            const snapshotsRaw = localStorage.getItem(snapshotsKey);
            if (snapshotsRaw) {
                const snapshots = JSON.parse(snapshotsRaw);
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const originalLength = snapshots.length;
                const activeSnapshots = snapshots.filter(s => s.id && s.id > thirtyDaysAgo);
                if (activeSnapshots.length < originalLength) {
                    localStorage.setItem(snapshotsKey, JSON.stringify(activeSnapshots));
                    console.log(`[Persistence] Purga automática: removidos ${originalLength - activeSnapshots.length} snapshots antigos (>30 dias).`);
                }
            }
        } catch (e) {
            console.warn('[Persistence] Falha na purga automática de snapshots:', e);
        }

        return Promise.resolve();
    }

    /**
     * DIRETÓRIO DE MESTRES: Registro Arcano
     */
    static async getMastersDirectory() {
        try {
            const response = await fetch(`/data/masters_directory.json?t=${Date.now()}`, {
                headers: this._getAuthHeaders()
            });
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('[Persistence] Diretorio de mestres nao encontrado ou vazio.', err);
            return [];
        }
    }

    static async saveMastersDirectory(directory) {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    filename: 'masters_directory.json',
                    data: directory
                })
            });
            if (!response.ok) throw new Error('Erro na resposta do servidor ao salvar diretorio de mestres.');
            return true;
        } catch (err) {
            console.error('[Persistence] Erro ao salvar diretorio de mestres:', err);
            return false;
        }
    }

    static async getOrCreateMaster(name, phone) {
        const directory = await this.getMastersDirectory();
        const normalizedPhone = phone.replace(/\D/g, '');
        let master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
        
        if (!master) {
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const masterId = `${cleanName}-${normalizedPhone}`;
            
            let internalId = '';
            let isUnique = false;
            while (!isUnique) {
                const hex = Math.floor(0x100000 + Math.random() * 0xefffff).toString(16).toUpperCase();
                internalId = `DGH-MST-${hex}`;
                isUnique = !directory.some(m => m.internalId === internalId);
            }
            
            master = {
                name: name.trim(),
                phone: phone.trim(),
                masterId: masterId,
                internalId: internalId,
                tables: [],
                createdAt: Date.now()
            };
            directory.push(master);
            await this.saveMastersDirectory(directory);
        } else if (name && name.trim() && master.name !== name.trim()) {
            master.name = name.trim();
            await this.saveMastersDirectory(directory);
        }
        return master;
    }

    /**
     * DIRETÓRIO DE MESAS: Funções estáticas de gerenciamento global
     */
    static async getTablesDirectory() {
        try {
            const response = await fetch(`/data/tables_directory.json?t=${Date.now()}`, {
                headers: this._getAuthHeaders()
            });
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('[Persistence] Diretorio de mesas nao encontrado ou vazio.', err);
            return [];
        }
    }

    static async saveTablesDirectory(directory) {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    filename: 'tables_directory.json',
                    data: directory
                })
            });
            if (!response.ok) throw new Error('Erro na resposta do servidor ao salvar diretorio.');
            return true;
        } catch (err) {
            console.error('[Persistence] Erro ao salvar diretorio de mesas:', err);
            return false;
        }
    }

    static async createTable(mestrePhone) {
        const directory = await this.getTablesDirectory();
        let tableId = '';
        let isUnique = false;
        
        while (!isUnique) {
            tableId = Math.floor(100000 + Math.random() * 900000).toString();
            isUnique = !directory.some(t => t.id === tableId);
        }

        const newTable = {
            id: tableId,
            mestrePhone: mestrePhone,
            sessionNum: 1,
            heroesCount: 0,
            createdAt: Date.now()
        };

        directory.push(newTable);
        await this.saveTablesDirectory(directory);

        const masterId = localStorage.getItem('DM_MASTER_ID');
        if (masterId) {
            const mDir = await this.getMastersDirectory();
            const master = mDir.find(m => m.masterId === masterId);
            if (master) {
                if (!master.tables) master.tables = [];
                if (!master.tables.includes(tableId)) {
                    master.tables.push(tableId);
                    await this.saveMastersDirectory(mDir);
                }
            }
        }

        return newTable;
    }

    static async linkTable(tableId, mestrePhone) {
        const directory = await this.getTablesDirectory();
        const table = directory.find(t => t.id === tableId);
        if (!table) {
            throw new Error('Mesa não encontrada. Verifique o ID de 6 dígitos.');
        }
        
        if (table.mestrePhone !== mestrePhone) {
            table.mestrePhone = mestrePhone;
            await this.saveTablesDirectory(directory);
        }

        const masterId = localStorage.getItem('DM_MASTER_ID');
        if (masterId) {
            const mDir = await this.getMastersDirectory();
            const master = mDir.find(m => m.masterId === masterId);
            if (master) {
                if (!master.tables) master.tables = [];
                if (!master.tables.includes(tableId)) {
                    master.tables.push(tableId);
                    await this.saveMastersDirectory(mDir);
                }
            }
        }
        return table;
    }

    static async startNewSession(tableId) {
        try {
            const filename = `mesa_${tableId}.json`;
            const response = await fetch(`/data/${filename}?t=${Date.now()}`, {
                headers: this._getAuthHeaders()
            });
            if (!response.ok) return false;

            const state = await response.json();

            // 1. Archive current session data to history
            state.sessionsHistory = state.sessionsHistory || [];
            const currentSessionNum = state.sessionNumber || 1;

            state.sessionsHistory.push({
                sessionNumber: currentSessionNum,
                sessionTitle: state.sessionTitle || `Sessão ${currentSessionNum}`,
                sessionNotes: state.sessionNotes || '',
                sessionLoot: state.sessionLoot || '',
                journalEntries: state.journalEntries || [],
                xpDistributed: state.xpDistributed || 0,
                timestamp: Date.now()
            });

            // 2. Increment session number
            state.sessionNumber = currentSessionNum + 1;

            // 3. Clear/Reset active session data
            state.sessionTitle = `Sessão ${currentSessionNum + 1}`;
            state.sessionNotes = '';
            state.sessionLoot = '';
            state.journalEntries = [];
            state.combatRound = 0;
            state.combatActive = false;
            state.initiativeOrder = [];
            state.concentration = [];
            state.monsters = [];
            state.xpDistributed = 0;

            // 4. Save back to server
            const saveResponse = await fetch('/api/save', {
                method: 'POST',
                headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    filename: filename,
                    data: state
                })
            });

            if (!saveResponse.ok) throw new Error('Erro ao salvar nova sessão no servidor.');

            // Update the tables directory stats
            const directory = await PersistenceService.getTablesDirectory();
            const table = directory.find(t => t.id === tableId);
            if (table) {
                table.sessionNum = state.sessionNumber;
                await PersistenceService.saveTablesDirectory(directory);
            }

            return true;
        } catch (e) {
            console.error('[Persistence] Erro ao iniciar nova sessao:', e);
            throw e;
        }
    }

    async updateTableStats(state) {
        const match = this.filename.match(/^mesa_(\d+)\.json$/);
        if (!match) return;
        const tableId = match[1];

        try {
            const directory = await PersistenceService.getTablesDirectory();
            const table = directory.find(t => t.id === tableId);
            if (table) {
                table.heroesCount = (state.players || []).length;
                table.sessionNum = state.sessionNumber || 1;
                await PersistenceService.saveTablesDirectory(directory);
                console.log(`[Persistence] Diretorio atualizado para a mesa ${tableId}: ${table.heroesCount} herois, sessao ${table.sessionNum}`);
            }
        } catch (e) {
            console.warn('[Persistence] Falha ao sincronizar estatisticas no diretorio:', e);
        }
    }

    /**
     * SALVAR: Envia o estado completo para o servidor gravar no JSON.
     */
    async save() {
        if (this._isSaving) return;
        this._isSaving = true;

        const state = TOME.store.snapshot();
        
        try {
            // B-08: Limpeza de sessões antigas (> 30 dias)
            if (state.sessionsHistory && Array.isArray(state.sessionsHistory)) {
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const originalLength = state.sessionsHistory.length;
                const cleanedHistory = state.sessionsHistory.filter(entry => !entry.timestamp || entry.timestamp > thirtyDaysAgo);
                if (cleanedHistory.length < originalLength) {
                    state.sessionsHistory = cleanedHistory;
                    if (TOME.store && TOME.store._rawState) {
                        TOME.store._rawState.sessionsHistory = cleanedHistory;
                    }
                    console.log(`[Persistence] Limpeza de sessões antigas: removidas ${originalLength - cleanedHistory.length} sessões anteriores a 30 dias.`);
                }
            }

            // Extract heavy base64 media data into IndexedDB, replacing with references in JSON
            await this._extractMedia(state);

            const response = await fetch('/api/save', {
                method: 'POST',
                headers: PersistenceService._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    filename: this.filename,
                    data: state
                })
            });

            if (!response.ok) throw new Error('Erro na resposta do servidor.');
            
            // Mirror to localStorage with robust try-catch fallbacks:
            const json = JSON.stringify(state);
            const stateKey = `TOME_PRO_STATE_${this.filename}`;
            const backupKey = `TOME_PRO_STATE_BACKUP_${this.filename}`;
            try {
                localStorage.setItem(stateKey, json);
                localStorage.setItem(backupKey, json);
                console.log(`[Persistence] Estado gravado com sucesso em data/${this.filename}`);
                
                // Emite atualização de estado via WebSockets para os jogadores
                if (window.TOME && window.TOME.socket && window.TOME.socket.connected) {
                    const match = this.filename.match(/^mesa_(\d+)\.json$/);
                    if (match && match[1]) {
                        window.TOME.socket.emit('state_update', {
                            mesaId: match[1],
                            state: state
                        });
                        console.log(`[Persistence] Socket: state_update enviado para a mesa ${match[1]}.`);
                    }
                }
            } catch (quotaError) {
                console.warn('[Persistence] LocalStorage limite de cota atingido. Iniciando limpeza...', quotaError);
                localStorage.removeItem(`TOME_SNAPSHOTS_${this.filename}`);
                
                try {
                    localStorage.setItem(stateKey, json);
                    localStorage.setItem(backupKey, json);
                    console.log('[Persistence] Sucesso ao salvar após limpar os snapshots.');
                } catch (stillExceeded) {
                    console.warn('[Persistence] Salvando estado reduzido (sem imagens base64) de contingência.');
                    const strippedState = JSON.parse(JSON.stringify(state));
                    if (strippedState.players && Array.isArray(strippedState.players)) {
                        strippedState.players.forEach(p => {
                            p.portraitData = '';
                            p.cardIconImage = '';
                        });
                    }
                    const strippedJson = JSON.stringify(strippedState);
                    try {
                        localStorage.setItem(stateKey, strippedJson);
                        localStorage.setItem(backupKey, strippedJson);
                        console.log('[Persistence] Estado reduzido salvo com sucesso.');
                    } catch (fatalError) {
                        console.error('[Persistence] Falha crítica no LocalStorage (estado reduzido), mas gravado no servidor:', fatalError);
                    }
                }
            }

            // Atualiza estatísticas da mesa no diretório
            await this.updateTableStats(state);
        } catch (err) {
            console.error('[Persistence] Erro ao salvar arquivo no servidor:', err);
        } finally {
            this._isSaving = false;
        }
    }

    /**
     * CARREGAR: Lê o arquivo JSON do servidor
     */
    async load() {
        try {
            const response = await fetch(`/data/${this.filename}?t=${Date.now()}`, {
                headers: PersistenceService._getAuthHeaders()
            });
            const backupKey = `TOME_PRO_STATE_BACKUP_${this.filename}`;
            const stateKey = `TOME_PRO_STATE_${this.filename}`;

            if (!response.ok) {
                console.warn(`[Persistence] Arquivo ${this.filename} não encontrado no disco. Usando backup local.`);
                const backup = localStorage.getItem(backupKey) || localStorage.getItem(stateKey);
                if (backup) {
                    try {
                        const parsedBackup = JSON.parse(backup);
                        await this._restoreMedia(parsedBackup);
                        TOME.store.update(s => {
                            Object.keys(s).forEach(k => {
                                if (DEFAULT_INITIAL_STATE.hasOwnProperty(k)) {
                                    s[k] = Array.isArray(DEFAULT_INITIAL_STATE[k]) ? [] :
                                           (typeof DEFAULT_INITIAL_STATE[k] === 'object' && DEFAULT_INITIAL_STATE[k] !== null ? {...DEFAULT_INITIAL_STATE[k]} : DEFAULT_INITIAL_STATE[k]);
                                }
                            });
                            Object.assign(s, parsedBackup);
                        });
                        return true;
                    } catch (_) { return false; }
                }

                // Reinicia estado limpo completo
                TOME.store.update(s => {
                    Object.keys(DEFAULT_INITIAL_STATE).forEach(k => {
                        s[k] = Array.isArray(DEFAULT_INITIAL_STATE[k]) ? [] :
                               (typeof DEFAULT_INITIAL_STATE[k] === 'object' && DEFAULT_INITIAL_STATE[k] !== null ? {...DEFAULT_INITIAL_STATE[k]} : DEFAULT_INITIAL_STATE[k]);
                    });
                });
                return false;
            }

            const data = await response.json();
            if (data) {
                await this._restoreMedia(data);
                TOME.store.update(s => {
                    Object.keys(s).forEach(k => {
                        if (DEFAULT_INITIAL_STATE.hasOwnProperty(k)) {
                            s[k] = Array.isArray(DEFAULT_INITIAL_STATE[k]) ? [] :
                                   (typeof DEFAULT_INITIAL_STATE[k] === 'object' && DEFAULT_INITIAL_STATE[k] !== null ? {...DEFAULT_INITIAL_STATE[k]} : DEFAULT_INITIAL_STATE[k]);
                        }
                    });
                    Object.assign(s, data);
                });
                console.log(`[Persistence] Estado restaurado com sucesso de data/${this.filename}`);
                return true;
            }
        } catch (err) {
            console.error('[Persistence] Erro ao carregar arquivo:', err);
            const backupKey = `TOME_PRO_STATE_BACKUP_${this.filename}`;
            const backup = localStorage.getItem(backupKey) || localStorage.getItem(`TOME_PRO_STATE_${this.filename}`);
            if (backup) {
                try {
                    const parsedBackup = JSON.parse(backup);
                    await this._restoreMedia(parsedBackup);
                    TOME.store.update(s => {
                        Object.keys(s).forEach(k => {
                            if (DEFAULT_INITIAL_STATE.hasOwnProperty(k)) {
                                s[k] = Array.isArray(DEFAULT_INITIAL_STATE[k]) ? [] :
                                       (typeof DEFAULT_INITIAL_STATE[k] === 'object' && DEFAULT_INITIAL_STATE[k] !== null ? {...DEFAULT_INITIAL_STATE[k]} : DEFAULT_INITIAL_STATE[k]);
                            }
                        });
                        Object.assign(s, parsedBackup);
                    });
                    return true;
                } catch (_) {}
            }
        }
        return false;
    }

    /**
     * SNAPSHOTS: Pontos de restauração para segurança.
     */
    createSnapshot(label = "Automático") {
        const snapshotsKey = `TOME_SNAPSHOTS_${this.filename}`;
        const snapshots = JSON.parse(localStorage.getItem(snapshotsKey) || '[]');
        const newState = TOME.store.snapshot();
        
        const strippedData = JSON.parse(JSON.stringify(newState));
        if (strippedData.players && Array.isArray(strippedData.players)) {
            strippedData.players.forEach(p => {
                p.portraitData = '';
                p.cardIconImage = '';
            });
        }

        const newSnapshot = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            label: label,
            data: strippedData
        };

        snapshots.unshift(newSnapshot);
        const limited = snapshots.slice(0, this._maxSnapshots);
        
        try {
            localStorage.setItem(snapshotsKey, JSON.stringify(limited));
            console.log(`[Persistence] Snapshot criado com sucesso: ${label}`);
        } catch (e) {
            console.warn('[Persistence] Falha ao salvar snapshots devido ao limite de cota.', e);
            localStorage.removeItem(snapshotsKey);
        }
    }

    getSnapshots() {
        return JSON.parse(localStorage.getItem(`TOME_SNAPSHOTS_${this.filename}`) || '[]');
    }

    restoreSnapshot(id) {
        const snapshots = this.getSnapshots();
        const snap = snapshots.find(s => s.id === id);
        if (snap) {
            TOME.store.update(s => Object.assign(s, snap.data));
            this.save();
            return true;
        }
        return false;
    }

    async switchSession(newFilename) {
        if (!newFilename.endsWith('.json')) {
            newFilename += '.json';
        }
        this.filename = newFilename;
        localStorage.setItem('TOME_ACTIVE_SESSION', newFilename);
        console.log(`[Persistence] Trocando para a sessão: ${newFilename}`);
        
        const loaded = await this.load();
        if (!loaded) {
            console.warn(`[Persistence] Sessão ${newFilename} não encontrada no disco. Iniciando nova.`);
            await this.save();
        }
        MatchHistoryService.touchSession(newFilename, TOME.store.state);
        return true;
    }

    /**
     * AUTO-SAVE: Monitora mudanças e grava no disco a cada 1.5s de inatividade.
     */
    startAutoSave() {
        let timer = null;
        TOME.store.subscribe(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.save().catch(e => console.warn('[Persistence] Auto-save failed:', e));
            }, 1500);
        });
    }

    /**
     * Resolves an offline db:// reference or data:image, and attempts to upload it if online.
     */
    static async resolveAndUpload(filename, value) {
        if (!value) return value;
        
        let base64 = value;
        if (typeof value === 'string' && value.startsWith('db://')) {
            const key = value.replace('db://', '');
            if (window.TOME && window.TOME.db) {
                try {
                    const data = await window.TOME.db.getMedia(key);
                    if (data && data.startsWith('data:image')) {
                        base64 = data;
                    }
                } catch (e) {
                    console.warn('[Persistence] Falha ao recuperar mídia do IndexedDB para upload:', e);
                }
            }
        }
        
        if (typeof base64 === 'string' && base64.startsWith('data:image')) {
            return await PersistenceService.uploadImage(filename, base64);
        }
        
        return value;
    }

    /**
     * Extracts large Base64 images from the state and saves them to the IndexedDB media store.
     * Replaces them with reference strings "db://media_..." in the state object.
     */
    async _extractMedia(state) {
        if (!state) return;
        
        const processVal = async (filename, val) => {
            if (!val) return val;
            if (val.startsWith('data:image') || val.startsWith('db://')) {
                return await PersistenceService.resolveAndUpload(filename, val);
            }
            return val;
        };

        // 1. Process players
        if (state.players && Array.isArray(state.players)) {
            for (let p of state.players) {
                p.portraitData = await processVal(`portrait_${p.id}.png`, p.portraitData);
                p.cardIconImage = await processVal(`icon_${p.id}.png`, p.cardIconImage);
            }
        }

        // 2. Process initiative order (which might contain clones of player portraits)
        if (state.initiativeOrder && Array.isArray(state.initiativeOrder)) {
            for (let c of state.initiativeOrder) {
                c.portraitData = await processVal(`portrait_${c.id}.png`, c.portraitData);
                c.img = await processVal(`img_${c.id}.png`, c.img);
            }
        }

        // 3. Process monsters
        if (state.monsters && Array.isArray(state.monsters)) {
            for (let m of state.monsters) {
                m.img = await processVal(`monster_img_${m.id || m.name}.png`, m.img);
                m.portraitData = await processVal(`monster_portrait_${m.id || m.name}.png`, m.portraitData);
            }
        }

        // 4. Process savedNPCs
        if (state.savedNPCs && Array.isArray(state.savedNPCs)) {
            for (let n of state.savedNPCs) {
                n.img = await processVal(`npc_img_${n.id || n.name}.png`, n.img);
                n.portraitData = await processVal(`npc_portrait_${n.id || n.name}.png`, n.portraitData);
            }
        }

        // 4.5. Process customMonsters (Bestiary forged creatures)
        if (state.customMonsters && Array.isArray(state.customMonsters)) {
            for (let m of state.customMonsters) {
                m.img = await processVal(`custom_monster_img_${m.id || m.name}.png`, m.img);
                m.portraitData = await processVal(`custom_monster_portrait_${m.id || m.name}.png`, m.portraitData);
            }
        }

        // 5. Process tacticalMap tokens
        if (state.tacticalMap && state.tacticalMap.tokens && Array.isArray(state.tacticalMap.tokens)) {
            for (let t of state.tacticalMap.tokens) {
                t.img = await processVal(`token_img_${t.id}.png`, t.img);
            }
        }

        // 6. Process tacticalMap mapUrl and currentMap
        if (state.tacticalMap) {
            state.tacticalMap.mapUrl = await processVal(`map_tactical.png`, state.tacticalMap.mapUrl);
        }
        state.currentMap = await processVal(`map_current.png`, state.currentMap);

        // 7. Process referenceImages and referenceCurrentImg
        if (state.referenceImages && Array.isArray(state.referenceImages)) {
            for (let i = 0; i < state.referenceImages.length; i++) {
                const img = state.referenceImages[i];
                if (img) {
                    img.data = await processVal(`ref_img_${i}_${img.name || 'image'}.png`, img.data);
                }
            }
        }
        if (state.referenceCurrentImg) {
            state.referenceCurrentImg = await processVal(`ref_current.png`, state.referenceCurrentImg);
        }
    }

    async _restoreMedia(state) {
        if (!state || !window.TOME || !window.TOME.db) return;

        const resolveUrl = async (url) => {
            if (typeof url === 'string' && url.startsWith('db://')) {
                const key = url.replace('db://', '');
                try {
                    const data = await window.TOME.db.getMedia(key);
                    return data ? data : url;
                } catch(e) {
                    return url;
                }
            }
            return url;
        };

        const traverse = async (obj) => {
            if (!obj || typeof obj !== 'object') return;
            for (let k of Object.keys(obj)) {
                const val = obj[k];
                if (typeof val === 'string' && val.startsWith('db://')) {
                    obj[k] = await resolveUrl(val);
                } else if (typeof val === 'object' && val !== null) {
                    await traverse(val);
                }
            }
        };

        await traverse(state);
    }

    /**
     * Tenta enviar a imagem em base64 para o servidor.
     * Retorna a URL estática em caso de sucesso, ou o próprio base64 original em caso de falha (para fallback offline).
     */
    static async uploadImage(filename, base64) {
        if (!base64 || !base64.startsWith('data:image')) {
            return base64;
        }
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ filename, base64 })
            });
            if (response.ok) {
                const res = await response.json();
                if (res.status === 'success' && res.url) {
                    console.log('[Persistence] Imagem enviada com sucesso para o servidor:', res.url);
                    return res.url;
                }
            }
        } catch (e) {
            console.warn('[Persistence] Falha ao enviar imagem para o servidor (offline?), tentando salvar localmente:', e);
        }

        // Fallback: tenta salvar localmente no IndexedDB
        if (window.TOME && window.TOME.db) {
            try {
                const key = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
                await window.TOME.db.setMedia(key, base64);
                console.log('[Persistence] Imagem salva localmente no IndexedDB:', key);
                return `db://${key}`;
            } catch (dbErr) {
                console.warn('[Persistence] Falha ao salvar imagem no IndexedDB:', dbErr);
            }
        }

        return base64;
    }
}
