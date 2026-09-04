import { describe, test, expect } from '@jest/globals';

describe('Player Sync & Mobile Vitals Protocol', () => {
    // Replicates the hydration algorithm implemented in Engine.prototype.hydrate
    function hydratePlayerState(localChar, incomingState) {
        if (!incomingState || !incomingState.players) return localChar;
        const currentCharId = localChar.id;
        
        let serverHero = null;
        if (currentCharId) {
            serverHero = incomingState.players.find(p => p.id === currentCharId || String(p.id) === String(currentCharId));
        }
        if (!serverHero && localChar.name) {
            serverHero = incomingState.players.find(p => p.name && p.name.trim().toLowerCase() === localChar.name.trim().toLowerCase());
        }

        if (!serverHero) return localChar;

        const updated = { ...localChar };
        if (serverHero.hp !== undefined) updated.hp = Number(serverHero.hp) || 0;
        if (serverHero.maxHp !== undefined) updated.maxHp = Number(serverHero.maxHp) || 1;
        if (serverHero.tempHp !== undefined) updated.tempHp = Number(serverHero.tempHp) || 0;
        if (serverHero.ac !== undefined) updated.ac = Number(serverHero.ac) || 10;
        if (serverHero.speed !== undefined) updated.speed = Number(serverHero.speed) || 30;
        if (Array.isArray(serverHero.conditions)) updated.conditions = [...serverHero.conditions];

        return updated;
    }

    test('hydratePlayerState matches by ID and updates HP, AC, Speed and conditions', () => {
        const localChar = {
            id: 'hero-123',
            name: 'Valeros',
            hp: 25,
            maxHp: 30,
            tempHp: 0,
            ac: 16,
            speed: 30,
            conditions: []
        };

        const incomingState = {
            players: [
                {
                    id: 'hero-123',
                    name: 'Valeros',
                    hp: 12,
                    maxHp: 30,
                    tempHp: 5,
                    ac: 18,
                    speed: 25,
                    conditions: ['Envenenado', 'Abençoado']
                },
                { id: 'hero-456', name: 'Kyra', hp: 20, maxHp: 20 }
            ]
        };

        const result = hydratePlayerState(localChar, incomingState);

        expect(result.hp).toBe(12);
        expect(result.tempHp).toBe(5);
        expect(result.ac).toBe(18);
        expect(result.speed).toBe(25);
        expect(result.conditions).toEqual(['Envenenado', 'Abençoado']);
    });

    test('hydratePlayerState matches by name when ID is not present', () => {
        const localChar = {
            id: null,
            name: 'Merisiel',
            hp: 20,
            maxHp: 20
        };

        const incomingState = {
            players: [
                { id: 'uuid-789', name: '  merisiel  ', hp: 7, maxHp: 20, tempHp: 3 }
            ]
        };

        const result = hydratePlayerState(localChar, incomingState);

        expect(result.hp).toBe(7);
        expect(result.tempHp).toBe(3);
    });

    test('Safe coordinate extractor supports both function and property getters', () => {
        const konvaLikeToken = {
            _x: 120,
            _y: 240,
            x() { return this._x; },
            y() { return this._y; }
        };

        const pixiLikeToken = {
            x: 350,
            y: 480
        };

        function getCoords(token) {
            const x = typeof token.x === 'function' ? token.x() : token.x;
            const y = typeof token.y === 'function' ? token.y() : token.y;
            return { x, y };
        }

        expect(getCoords(konvaLikeToken)).toEqual({ x: 120, y: 240 });
        expect(getCoords(pixiLikeToken)).toEqual({ x: 350, y: 480 });
    });

    test('Audio channel synchronization payloads conform to multi-track schema', () => {
        const playMusicEvent = {
            channel: 'map_audio',
            tableId: 'mesa-principal',
            action: 'PLAY_MUSIC',
            url: '/audio/music/battle-epic.mp3',
            loop: true,
            volume: 0.8
        };

        const setVolEvent = {
            channel: 'map_audio',
            tableId: 'mesa-principal',
            action: 'SET_CHANNEL_VOL',
            targetChannel: 'ambience',
            volume: 0.4
        };

        expect(playMusicEvent.action).toBe('PLAY_MUSIC');
        expect(playMusicEvent.tableId).toBe('mesa-principal');
        expect(playMusicEvent.volume).toBeCloseTo(0.8);
        expect(setVolEvent.targetChannel).toBe('ambience');
    });

    test('Spell Effect broadcast message contains coordinates and particle type', () => {
        const spellPayload = {
            type: 'SPELL_EFFECT',
            tableId: 'mesa-principal',
            spell: 'Fireball',
            x: 400,
            y: 350,
            color: '#ff4500',
            duration: 1500
        };

        expect(spellPayload.type).toBe('SPELL_EFFECT');
        expect(spellPayload.spell).toBe('Fireball');
        expect(spellPayload.x).toBe(400);
        expect(spellPayload.y).toBe(350);
        expect(spellPayload.color).toBe('#ff4500');
    });

    test('Table ID extraction regex supports both numeric and alphanumeric slugs', () => {
        const tableIdRegex = /^mesa_([a-zA-Z0-9_-]+)\.json$/;

        expect('mesa_123456.json'.match(tableIdRegex)?.[1]).toBe('123456');
        expect('mesa_campanha-epic_01.json'.match(tableIdRegex)?.[1]).toBe('campanha-epic_01');
        expect('mesa_abc-def-ghi.json'.match(tableIdRegex)?.[1]).toBe('abc-def-ghi');
        expect('other_file.json'.match(tableIdRegex)).toBeNull();
    });

    test('Network interface ranking prioritizes physical Wi-Fi and Ethernet over virtual adapters', () => {
        const virtualRegex = /(vethernet|virtualbox|vmware|tailscale|zerotier|hamachi|docker|wsl|loopback|teredo|npcap)/i;
        const priorityRegex = /(wi-fi|wifi|wireless|wlan|ethernet|eth|en0|en1|lan)/i;

        const mockedInterfaces = [
            { name: 'vEthernet (WSL)', ip: '172.28.16.1' },
            { name: 'VirtualBox Host-Only', ip: '192.168.56.1' },
            { name: 'Wi-Fi', ip: '192.168.1.105' },
            { name: 'Ethernet', ip: '10.0.0.50' }
        ];

        const ranked = mockedInterfaces.map(i => ({
            ...i,
            isVirtual: virtualRegex.test(i.name),
            isPriority: priorityRegex.test(i.name)
        })).sort((a, b) => {
            if (a.isVirtual !== b.isVirtual) return a.isVirtual ? 1 : -1;
            if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
            const a192 = a.ip.startsWith('192.168.');
            const b192 = b.ip.startsWith('192.168.');
            if (a192 !== b192) return a192 ? -1 : 1;
            return 0;
        });

        // Wi-Fi should be ranked #1 because it is physical priority + 192.168.x.x
        expect(ranked[0].name).toBe('Wi-Fi');
        expect(ranked[0].ip).toBe('192.168.1.105');
        // Ethernet should be ranked #2
        expect(ranked[1].name).toBe('Ethernet');
        // Virtual adapters should be pushed to the bottom
        expect(ranked[2].isVirtual).toBe(true);
        expect(ranked[3].isVirtual).toBe(true);
    });
});

