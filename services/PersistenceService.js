import { TOME } from '../core/Registry.js';
import { Toast } from '../ui/components/Toast.js';
import { Storage } from '../core/StorageManager.js';

/**
 * PERSISTENCE SERVICE v6.0 — "Hybrid Storage" Edition
 * Optimized for large assets using IndexedDB + Server Sync.
 */
export class PersistenceService {
    constructor() {
        this.filename = 'state.json';
        this._isSaving = false;
        this._pendingSave = false;
        this._syncStatusElement = null;
    }

    async init() {
        console.log('[Persistence] Sistema de Sincronização Híbrida Ativo.');
        await Storage.init();
        this._createSyncIndicator();
        return Promise.resolve();
    }

    _createSyncIndicator() {
        if (document.getElementById('sync-indicator')) return;
        const div = document.createElement('div');
        div.id = 'sync-indicator';
        div.style = 'position:fixed; bottom:10px; right:10px; font-size:10px; color:#64748b; z-index:10000; pointer-events:none; font-family:monospace; display:flex; align-items:center; gap:5px; transition: opacity 0.3s; opacity: 0;';
        div.innerHTML = '<i class="fa-solid fa-cloud"></i> <span id="sync-text">SINCRONIZADO</span>';
        document.body.appendChild(div);
        this._syncStatusElement = div;
    }

    updateStatus(status) {
        if (!this._syncStatusElement) return;
        const text = document.getElementById('sync-text');
        this._syncStatusElement.style.opacity = '1';
        
        if (status === 'saving') {
            text.textContent = 'SALVANDO...';
            this._syncStatusElement.style.color = '#fbbf24';
        } else if (status === 'success') {
            text.textContent = 'SINCRONIZADO';
            this._syncStatusElement.style.color = '#22c55e';
            setTimeout(() => { if (!this._isSaving) this._syncStatusElement.style.opacity = '0.4'; }, 2000);
        } else {
            text.textContent = 'ERRO DE SYNC';
            this._syncStatusElement.style.color = '#f43f5e';
        }
    }

    /**
     * SALVAMENTO IMEDIATO (FORÇADO)
     */
    async forceSave() {
        console.log('[Persistence] Forçando salvamento imediato...');
        return this.save();
    }

    async save() {
        if (this._isSaving) {
            this._pendingSave = true;
            return;
        }

        this._isSaving = true;
        this.updateStatus('saving');

        const rawState = TOME.store.snapshot();
        
        try {
            // Strip large assets for LocalStorage backup
            const { cleanState, assets } = this._stripLargeAssets(rawState);
            
            // Save assets to IndexedDB
            for (const [key, val] of Object.entries(assets)) {
                await Storage.set(key, val);
            }

            // LocalStorage backup (Lightweight)
            localStorage.setItem('TOME_PRO_STATE_BACKUP', JSON.stringify(cleanState));

            // Server sync (Full state with assets)
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: this.filename,
                    data: rawState
                })
            });

            if (!response.ok) throw new Error('Falha no servidor');
            
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message || 'Erro desconhecido');

            this.updateStatus('success');
            console.log(`[Persistence] Estado sincronizado com sucesso.`);
        } catch (err) {
            this.updateStatus('error');
            console.error('[Persistence] Erro crítico de salvamento:', err);
            Toast.show('⚠️ Erro ao salvar no servidor! Dados mantidos localmente.', 'error');
        } finally {
            this._isSaving = false;
            if (this._pendingSave) {
                this._pendingSave = false;
                setTimeout(() => this.save(), 500);
            }
        }
    }

    async load() {
        try {
            this.updateStatus('saving');
            const response = await fetch(`/data/${this.filename}?t=${Date.now()}`);
            
            if (!response.ok) {
                console.warn('[Persistence] state.json não encontrado. Tentando backup...');
                const backup = localStorage.getItem('TOME_PRO_STATE_BACKUP');
                if (backup) {
                    TOME.store.update(s => Object.assign(s, JSON.parse(backup)));
                    this.updateStatus('success');
                    return true;
                }
                this.updateStatus('error');
                return false;
            }

            let data = await response.json();
            if (data) {
                // Restore from IndexedDB if assets are missing/placeholders
                data = await this._restoreLargeAssets(data);
                TOME.store.update(s => Object.assign(s, data));
                console.log('[Persistence] Dados carregados do servidor.');
                this.updateStatus('success');
                return true;
            }
        } catch (err) {
            console.error('[Persistence] Erro ao carregar:', err);
            this.updateStatus('error');
        }
        return false;
    }

    _stripLargeAssets(obj, path = 'root', assets = {}) {
        const clean = Array.isArray(obj) ? [] : {};
        
        for (const [key, val] of Object.entries(obj)) {
            const currentPath = `${path}.${key}`;
            
            if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 50000) {
                const assetKey = `asset_${currentPath.replace(/[^a-z0-9]/gi, '_')}`;
                assets[assetKey] = val;
                clean[key] = `__REF:${assetKey}`;
            } else if (val !== null && typeof val === 'object') {
                const result = this._stripLargeAssets(val, currentPath, assets);
                clean[key] = result.cleanState;
                Object.assign(assets, result.assets);
            } else {
                clean[key] = val;
            }
        }
        
        return { cleanState: clean, assets };
    }

    async _restoreLargeAssets(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        for (const [key, val] of Object.entries(obj)) {
            if (typeof val === 'string' && val.startsWith('__REF:asset_')) {
                const assetKey = val.replace('__REF:', '');
                const stored = await Storage.get(assetKey);
                if (stored) obj[key] = stored;
            } else if (typeof val === 'object') {
                obj[key] = await this._restoreLargeAssets(val);
            }
        }
        return obj;
    }

    startAutoSave() {
        let timer = null;
        TOME.store.subscribe(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.save().catch(e => console.warn('[Persistence] Auto-save background failed:', e));
            }, 2000); // 2 segundos de inatividade para auto-save
        });
    }
}
