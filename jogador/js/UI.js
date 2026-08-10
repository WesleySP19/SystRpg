export class UI {
    constructor() {
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        this.chatScreen = document.getElementById('chat-screen');
        this.profileScreen = document.getElementById('profile-screen');
        this.msgsContainer = document.getElementById('messages-container');
        this.statusIndicator = document.getElementById('status-indicator');
        this.chatInput = document.getElementById('chat-input');
        
        this.tabChat = document.getElementById('tab-chat');
        this.tabProfile = document.getElementById('tab-profile');
        this.tabDeck = document.getElementById('tab-deck');
        this.tabTomo = document.getElementById('tab-tomo');

        this.deckScreen = document.getElementById('deck-screen');
        this.tomoScreen = document.getElementById('tomo-screen');
        
        this.btnChangeAvatar = document.getElementById('btn-change-avatar');
        this.avatarUploadInput = document.getElementById('avatar-upload-input');
        this.avatarDisplay = document.getElementById('hero-avatar-display');
        this.heroNameDisplay = document.getElementById('hero-name-display');
        this.heroClassDisplay = document.getElementById('hero-class-display');
        this.statMesa = document.getElementById('stat-mesa');
        
        this.engine = null;

        // Auto-restore fields
        const lastTable = localStorage.getItem('tome_last_table');
        const lastName = localStorage.getItem('tome_last_name');
        if (lastTable && document.getElementById('tableId')) document.getElementById('tableId').value = lastTable;
        if (lastName && document.getElementById('playerName')) document.getElementById('playerName').value = lastName;

        this._setupTabListeners();
        this._setupAvatarUpload();
    }

    _setupTabListeners() {
        const tabs = [
            { btn: this.tabChat, screen: this.chatScreen },
            { btn: this.tabProfile, screen: this.profileScreen },
            { btn: this.tabDeck, screen: this.deckScreen },
            { btn: this.tabTomo, screen: this.tomoScreen }
        ];

        tabs.forEach(t => {
            if (!t.btn) return;
            t.btn.addEventListener('click', () => {
                // Hide all
                tabs.forEach(x => {
                    if(x.btn) x.btn.classList.remove('active');
                    if(x.screen) x.screen.style.display = 'none';
                });
                // Show selected
                t.btn.classList.add('active');
                if(t.screen) t.screen.style.display = 'flex';
            });
        });
    }

    _setupAvatarUpload() {
        if (!this.btnChangeAvatar || !this.avatarUploadInput) return;

        this.btnChangeAvatar.addEventListener('click', () => {
            this.avatarUploadInput.click();
        });

        this.avatarUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file || !this.engine) return;

            // Comprime a imagem em Canvas localmente para poupar tráfego Wi-Fi LAN
            const base64 = await this._compressImage(file);
            if (base64) {
                this.updateAvatarDisplay(base64);
                this.engine.uploadAvatar(base64);
            }
        });
    }

    _compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (readerEv => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 320; // 320x320 é perfeito para avatar e leve para Wi-Fi
                    let w = img.width;
                    let h = img.height;
                    if (w > h) {
                        if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
                    } else {
                        if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/png', 0.85));
                };
                img.src = readerEv.target.result;
            });
            reader.readAsDataURL(file);
        });
    }

    getLoginData() {
        return {
            tableId: document.getElementById('tableId').value.trim(),
            playerName: document.getElementById('playerName').value.trim()
        };
    }

    showMainApp(engineInstance) {
        this.engine = engineInstance;
        this.loginScreen.style.display = 'none';
        if (this.mainApp) {
            this.mainApp.style.display = 'flex';
        } else {
            this.chatScreen.style.display = 'flex';
        }
    }

    showChat() {
        this.showMainApp(null);
    }

    renderProfile(data) {
        if (!data) return;
        if (data.name && this.heroNameDisplay) this.heroNameDisplay.textContent = data.name;
        if (data.classe && this.heroClassDisplay) this.heroClassDisplay.textContent = data.classe;
        if (data.tableId && this.statMesa) this.statMesa.textContent = `#${data.tableId}`;
        if (data.avatar) this.updateAvatarDisplay(data.avatar);
    }

    updateAvatarDisplay(avatarUrl) {
        if (!avatarUrl || !this.avatarDisplay) return;
        this.avatarDisplay.src = avatarUrl;
    }

    setStatus(connected) {
        if (connected) {
            this.statusIndicator.classList.add('connected');
        } else {
            this.statusIndicator.classList.remove('connected');
        }
    }

    playAlertEffect() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) { console.warn("Audio not supported"); }

        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 600);
    }

    renderMessage(msg) {
        if (msg.timestamp && document.querySelector(`[data-ts="${msg.timestamp}"]`)) return;

        const div = document.createElement('div');
        div.className = `msg ${msg.tipo || 'publica'}`;
        if (msg.timestamp) div.dataset.ts = msg.timestamp;
        
        const title = document.createElement('div');
        title.className = 'msg-title';
        
        let titleText = '';
        if (msg.tipo === 'sussurro') titleText = 'Sussurro do Mestre';
        else if (msg.tipo === 'alerta') titleText = 'ALERTA CRÍTICO';
        else if (msg.tipo === 'sistema') titleText = 'SISTEMA';
        else titleText = msg.nome || 'Mestre';
        
        title.textContent = titleText;

        const content = document.createElement('div');
        content.className = 'msg-content';
        content.textContent = msg.conteudo;

        if (msg.tipo !== 'sistema' && msg.tipo !== 'jogador') {
            div.appendChild(title);
        }
        div.appendChild(content);
        this.msgsContainer.appendChild(div);

        this.msgsContainer.scrollTop = this.msgsContainer.scrollHeight;

        if (msg.tipo === 'alerta' && !msg.isHistory) {
            this.playAlertEffect();
        } else if (msg.tipo === 'sussurro' && !msg.isHistory) {
            if (navigator.vibrate) navigator.vibrate([50]);
        }
    }
}
