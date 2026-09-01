export class WebRTCManager {
    constructor() {
        this.peers = new Map(); // peerId -> RTCPeerConnection
        this.dataChannels = new Map(); // peerId -> RTCDataChannel
        this.socket = window.TOME?.socket || null;
        this.userId = crypto.randomUUID();
        this.mesaId = localStorage.getItem('DM_ACTIVE_TABLE') || 'global';
        this.handlers = [];

        if (this.socket) {
            this._initSignaling();
        } else {
            console.warn('[WebRTCManager] Socket.io not found. WebRTC requires a signaling server.');
        }
    }

    _initSignaling() {
        this.socket.on('webrtc-peer-joined', async ({ peerId }) => {
            console.log(`[WebRTC] Peer ${peerId} joined. Initiating connection...`);
            const pc = this._createPeerConnection(peerId);
            const dc = pc.createDataChannel('tome-sync');
            this._setupDataChannel(peerId, dc);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.socket.emit('webrtc-offer', { targetId: peerId, sdp: pc.localDescription });
        });

        this.socket.on('webrtc-offer', async ({ senderId, sdp }) => {
            console.log(`[WebRTC] Offer received from ${senderId}`);
            const pc = this._createPeerConnection(senderId);
            pc.ondatachannel = (event) => {
                this._setupDataChannel(senderId, event.channel);
            };

            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.socket.emit('webrtc-answer', { targetId: senderId, sdp: pc.localDescription });
        });

        this.socket.on('webrtc-answer', async ({ senderId, sdp }) => {
            console.log(`[WebRTC] Answer received from ${senderId}`);
            const pc = this.peers.get(senderId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        });

        this.socket.on('webrtc-ice-candidate', async ({ senderId, candidate }) => {
            const pc = this.peers.get(senderId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('[WebRTC] Error adding ICE candidate', e);
                }
            }
        });

        this.socket.on('webrtc-peer-left', ({ peerId }) => {
            const pc = this.peers.get(peerId);
            if (pc) {
                pc.close();
                this.peers.delete(peerId);
                this.dataChannels.delete(peerId);
                console.log(`[WebRTC] Peer ${peerId} disconnected.`);
            }
        });

        // Join the signaling room
        this.socket.emit('webrtc-join', { mesaId: this.mesaId, userId: this.userId });
    }

    _createPeerConnection(peerId) {
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('webrtc-ice-candidate', { targetId: peerId, candidate: event.candidate });
            }
        };

        this.peers.set(peerId, pc);
        return pc;
    }

    _setupDataChannel(peerId, dc) {
        dc.onopen = () => console.log(`[WebRTC] DataChannel open with ${peerId}`);
        dc.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handlers.forEach(h => h(data, peerId));
                
                // Native high-frequency event dispatching (bypasses Preact store)
                if (data.type === 'TOKEN_DRAG') {
                    window.dispatchEvent(new CustomEvent('webrtc:token_sync', {
                        detail: { id: data.id, x: data.x, y: data.y, peerId }
                    }));
                } else if (data.type === 'PING') {
                    window.dispatchEvent(new CustomEvent('webrtc:ping_sync', {
                        detail: { x: data.x, y: data.y, color: data.color, peerId }
                    }));
                }
            } catch(e) {
                console.warn('[WebRTC] Error parsing message', e);
            }
        };
        dc.onclose = () => {
            console.log(`[WebRTC] DataChannel closed with ${peerId}`);
            this.dataChannels.delete(peerId);
        };
        this.dataChannels.set(peerId, dc);
    }

    onMessage(callback) {
        this.handlers.push(callback);
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.dataChannels.forEach((dc, peerId) => {
            if (dc.readyState === 'open') {
                dc.send(message);
            }
        });
    }

    sendTo(peerId, data) {
        const dc = this.dataChannels.get(peerId);
        if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify(data));
        }
    }
}
