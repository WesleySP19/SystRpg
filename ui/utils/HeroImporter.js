import { Toast } from '../components/Toast.js';
import { TOME } from '../../core/Registry.js';
import { Schemas } from '../../data/schemas.js';

export class HeroImporter {
    constructor(formContext) {
        this.ctx = formContext;
    }
    
    $ (selector) { return this.ctx.$(selector); }
    _fillForm(data) { return this.ctx._fillForm(data); }
    previewCards() { return this.ctx.previewCards(); }
    closeImporter() { return this.ctx.closeImporter(); }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
            document.head.appendChild(script);
        });
    }
    async importPDF(file) {
        Toast.show('🔮 Lendo formulário do PDF...');
        try {
            const { PDFDocument } = await import('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.esm.js');
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const form = pdfDoc.getForm();
            const fields = form.getFields();

            const values = {};
            fields.forEach(field => {
                const name = field.getName();
                let val = '';
                
                try {
                    if (typeof field.getText === 'function') {
                        val = field.getText();
                    } else if (typeof field.isChecked === 'function') {
                        val = field.isChecked();
                    } else if (typeof field.getSelected === 'function') {
                        val = field.getSelected();
                        if (Array.isArray(val)) val = val[0];
                    } else {
                        const type = field.constructor.name;
                        if (type.includes('TextField')) val = field.getText?.();
                        else if (type.includes('CheckBox')) val = field.isChecked?.();
                        else if (type.includes('Dropdown') || type.includes('Select')) {
                            val = field.getSelected?.();
                            if (Array.isArray(val)) val = val[0];
                        }
                    }
                } catch (e) {
                    console.warn(`Erro ao ler campo ${name}:`, e);
                }
                
                if (val !== undefined && val !== null && val !== '') {
                    if (typeof val === 'string' && val.length > 50000) {
                        val = val.substring(0, 50000) + '... [texto truncado]';
                    }
                    values[name] = val;
                }
            });

            console.log('Campos extraídos do PDF:', values);

            if (Object.keys(values).length === 0) {
                throw new Error('Nenhum campo interativo encontrado no PDF.');
            }

            const mapped = this._mapPDFFields(values);
            this._fillForm(mapped);

            try {
                TOME.store.update(s => {
                    if (this._editingId) {
                        const idx = s.players.findIndex(p => p.id === this._editingId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...mapped };
                        }
                        Toast.show('✅ Ficha do herói atualizada e salva com sucesso!', 'success');
                    } else {
                        const nameSlug = (mapped.name || 'hero').toLowerCase().replace(/\s+/g, '_');
                        const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
                        const player = { ...Schemas.createPlayer(mapped), id: uniqueId };
                        s.players = [...s.players, player];
                        s.editingHeroId = uniqueId;
                        Toast.show('✅ Novo herói importado e salvo com sucesso!', 'success');
                    }
                });
            } catch (saveErr) {
                if (saveErr.name === 'QuotaExceededError' || saveErr.message.includes('Quota')) {
                    Toast.show('❌ Limite de armazenamento atingido (QuotaExceeded)! Limpe heróis ou mapas antigos.', 'danger');
                    return; // Stop further processing
                }
                throw saveErr;
            }

            this.previewCards();
            this.closeImporter();
        } catch (err) {
            console.error('Erro ao ler PDF como formulário:', err);
            if (err.name === 'QuotaExceededError' || err.message.includes('Quota')) return;
            Toast.show('⚠️ Não foi possível ler campos interativos. Extraindo texto do PDF...', 'warning');
            await this._fallbackPDFText(file);
        }
    }
    async _fallbackPDFText(file) {
        Toast.show('🔍 Extraindo texto do PDF...');
        try {
            await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            const pagesToRead = Math.min(2, pdf.numPages);
            for (let i = 1; i <= pagesToRead; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            if (fullText.trim()) {
                const inputEl = this.$('#import-text');
                if (inputEl) inputEl.value = fullText;
                await this.processImport();
            } else {
                throw new Error('O PDF não contém texto legível.');
            }
        } catch (err) {
            console.error('Erro ao extrair texto do PDF:', err);
            Toast.show('⚠️ Falha ao extrair texto do PDF. Considere inserir manualmente ou via JSON.', 'danger');
        }
    }
    _mapPDFFields(v) {
        // Normalizes keys: lowercase and removes non-alphanumeric chars
        const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        // Find keys by fuzzy/loose matching
        const findVal = (queries, defaultVal = null) => {
            const normalizedQueries = queries.map(q => norm(q));
            // First look for exact match or normalized match
            for (let q of normalizedQueries) {
                const foundKey = Object.keys(v).find(k => norm(k) === q);
                if (foundKey !== undefined) return v[foundKey];
            }
            // Fallback: look for partial match where key contains one of the query terms
            for (let q of normalizedQueries) {
                const foundKey = Object.keys(v).find(k => norm(k).includes(q));
                if (foundKey !== undefined) return v[foundKey];
            }
            return defaultVal;
        };

        const getIntVal = (queries, defaultVal = 0) => {
            const raw = findVal(queries);
            if (raw === null || raw === undefined) return defaultVal;
            const parsed = parseInt(String(raw).replace(/[^-0-9]/g, ''));
            return isNaN(parsed) ? defaultVal : parsed;
        };

        const getBoolVal = (queries, defaultVal = false) => {
            const raw = findVal(queries);
            if (raw === null || raw === undefined) return defaultVal;
            if (typeof raw === 'boolean') return raw;
            const s = String(raw).toLowerCase().trim();
            return s === 'true' || s === 'yes' || s === 'on' || s === '1' || s === 'x' || s === 'v' || s === 's' || raw === 1;
        };

        // Resolves attribute score with fallback scanning
        const getAbilityScore = (abbr, fullName, ptName, ptAbbr) => {
            const queries = [
                `${abbr}score`, `${fullName}score`, `${ptName}valor`, `${abbr}val`, `${ptName}total`,
                `${abbr} score`, `${fullName} score`, `${ptName} valor`, `${abbr} val`, `${ptName} total`,
                abbr, fullName, ptName, ptAbbr
            ];
            
            // 1. Direct lookup
            let score = getIntVal(queries, 0);
            if (score > 5) return score;
            
            // 2. Scan all keys
            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (
                    (nk.includes(abbr) || nk.includes(fullName) || nk.includes(ptName) || nk.includes(ptAbbr)) &&
                    !nk.includes('mod') && !nk.includes('save') && !nk.includes('resist') && !nk.includes('test') && !nk.includes('check')
                ) {
                    const parsed = parseInt(String(v[k]).replace(/[^-0-9]/g, ''));
                    if (parsed > 5 && parsed <= 30) {
                        return parsed;
                    }
                }
            }
            return 10;
        };

        const getSavingThrow = (abbr, fullName, ptName, ptAbbr) => {
            const keys = [
                `st${abbr}`, `st${fullName}`, `save${abbr}`, `save${fullName}`, `${ptName}save`, `resist${ptAbbr}`,
                `salvaguarda${ptName}`, `salvaguarda${ptAbbr}`, `${ptName}resist`,
                `checkbox11`, `checkbox18`, `checkbox19`, `checkbox20`, `checkbox21`, `checkbox22`
            ];
            if (getBoolVal(keys)) return true;

            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (
                    (nk.includes('save') || nk.includes('st') || nk.includes('resist') || nk.includes('salvaguarda')) &&
                    (nk.includes(abbr) || nk.includes(fullName) || nk.includes(ptName) || nk.includes(ptAbbr))
                ) {
                    if (getBoolVal([k])) return true;
                }
            }
            return false;
        };

        const getSkillProficiency = (skKeys) => {
            if (getBoolVal(skKeys)) return true;
            
            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (skKeys.some(key => nk.includes(norm(key))) && (nk.includes('prof') || nk.includes('check') || nk.includes('box'))) {
                    if (getBoolVal([k])) return true;
                }
            }
            return false;
        };

        // Ability Scores Parsing
        const strScore = getAbilityScore('str', 'strength', 'força', 'for');
        const dexScore = getAbilityScore('dex', 'dexterity', 'destreza', 'des');
        const conScore = getAbilityScore('con', 'constitution', 'constituição', 'con');
        const intScore = getAbilityScore('int', 'intelligence', 'inteligência', 'int');
        const wisScore = getAbilityScore('wis', 'wisdom', 'sabedoria', 'sab');
        const chaScore = getAbilityScore('cha', 'charisma', 'carisma', 'car');
        
        const dexMod = Math.floor((dexScore - 10) / 2);

        // Fallback checks for calculated stats
        let acVal = getIntVal(['ac', 'ca', 'armorclass', 'armor class', 'classe de armadura', 'classe de armadura valor'], 0);
        if (acVal <= 0) {
            acVal = 10 + dexMod;
        }

        let initVal = getIntVal(['initiative', 'iniciativa', 'init', 'inic', 'iniciativa valor'], 999);
        if (initVal === 999 || initVal === -5) {
            initVal = dexMod;
        }

        let speedVal = getIntVal(['speed', 'deslocamento', 'desloc', 'movimento', 'speedvalue', 'velocidade'], 30);

        let cls = String(findVal(['classlevel', 'class', 'classe'], '')).trim();
        let lvl = getIntVal(['level', 'nivel', 'lvl', 'charlevel', 'characterlevel'], 0);
        if (!lvl && cls) {
            const match = cls.match(/(\d+)/);
            if (match) {
                lvl = parseInt(match[1]);
                cls = cls.replace(match[0], '').trim();
            }
        }
        if (!lvl) lvl = 1;

        const mapped = {
            name: findVal(['charactername', 'charname', 'name', 'nome', 'nomedopersonagem', 'personagem']) || 'Herói Importado',
            class: cls || 'Guerreiro',
            level: lvl,
            race: findVal(['race', 'raça', 'raca']) || 'Humano',
            background: findVal(['background', 'antecedente', 'antecedentes', 'historico', 'histórico']) || 'Herói do Povo',
            playerName: findVal(['playername', 'jogador', 'player', 'nomedojogador']) || '',
            alignment: findVal(['alignment', 'tendência', 'tendencia', 'alinhamento']) || 'Neutro',
            xp: getIntVal(['xp', 'experience', 'experiencia', 'experiência'], 0),
            ac: acVal,
            initiative: initVal,
            speed: speedVal,
            hp: {
                current: getIntVal(['hpcurrent', 'currenthp', 'hitpointscurrent', 'pontosdevida', 'pv', 'vida', 'pv_atual'], 10),
                max: getIntVal(['hpmax', 'maxhp', 'hitpointsmax', 'pontosdevidamax', 'pvmax', 'maxpv'], 10),
                temp: getIntVal(['hptemp', 'temphp', 'pvtemp', 'vidatemp'], 0)
            },
            hitDice: {
                total: findVal(['hdtotal', 'hitdicetotal', 'dadosdevidatotal']) || `${lvl}d8`,
                remaining: findVal(['hdremaining', 'hdcurrent', 'hitdice', 'dadosdevida']) || `${lvl}`
            },
            inspiration: getBoolVal(['inspiration', 'inspiracao', 'inspiração']),
            proficiencyBonus: getIntVal(['profbonus', 'proficiencybonus', 'bonusdeproficiencia', 'bônusdeproficiência', 'bonusprof'], 2),
            stats: {
                str: strScore,
                dex: dexScore,
                con: conScore,
                int: intScore,
                wis: wisScore,
                cha: chaScore
            },
            savingThrows: {
                str: getSavingThrow('str', 'strength', 'força', 'for'),
                dex: getSavingThrow('dex', 'dexterity', 'destreza', 'des'),
                con: getSavingThrow('con', 'constitution', 'constituição', 'con'),
                int: getSavingThrow('int', 'intelligence', 'inteligência', 'int'),
                wis: getSavingThrow('wis', 'wisdom', 'sabedoria', 'sab'),
                cha: getSavingThrow('cha', 'charisma', 'carisma', 'car')
            },
            skills: [],
            attacks: [],
            currency: {
                pp: getIntVal(['pp', 'platina', 'platinum'], 0),
                gp: getIntVal(['gp', 'gold', 'ouro'], 0),
                ep: getIntVal(['ep', 'electrum', 'electro'], 0),
                sp: getIntVal(['sp', 'silver', 'prata'], 0),
                cp: getIntVal(['cp', 'copper', 'cobre'], 0)
            },
            roleplay: {
                traits: String(findVal(['personalitytraits', 'personality', 'tracos', 'traços'], '')).trim(),
                ideals: String(findVal(['ideals', 'ideais'], '')).trim(),
                bonds: String(findVal(['bonds', 'vinculos', 'vínculos'], '')).trim(),
                flaws: String(findVal(['flaws', 'fraquezas', 'defeitos'], '')).trim()
            },
            equipment: {
                items: [],
                notes: String(findVal(['equipment', 'equipamento', 'itens', 'items', 'posses'], '')).trim()
            },
            otherProfs: String(findVal(['proficiencieslanguage', 'otherproficiencies', 'outrasproficiencias', 'outrasproficiências', 'idiomas'], '')).trim(),
            bio: String(findVal(['backstory', 'biography', 'historia', 'história', 'bio'], '')).trim(),
            allies: String(findVal(['allies', 'alliesorganizations', 'aliados'], '')).trim(),
            spells: {},
            spellSlots: {}
        };

        const skillList = [
            { id: 'athletics', keys: ['athletics', 'atletismo', 'checkbox26', 'athleticsprof'] },
            { id: 'acrobatics', keys: ['acrobatics', 'acrobacia', 'checkbox23', 'acrobaticsprof'] },
            { id: 'sleightOfHand', keys: ['sleightofhand', 'prestidigitacao', 'prestidigitação', 'maosleves', 'mãosleves', 'checkbox38', 'sleightofhandprof'] },
            { id: 'stealth', keys: ['stealth', 'furtividade', 'checkbox39', 'stealthprof'] },
            { id: 'arcana', keys: ['arcana', 'arcano', 'checkbox25', 'arcanaprof'] },
            { id: 'history', keys: ['history', 'historia', 'história', 'checkbox28', 'historyprof'] },
            { id: 'investigation', keys: ['investigation', 'investigacao', 'investigação', 'checkbox31', 'investigationprof'] },
            { id: 'nature', keys: ['nature', 'natureza', 'checkbox33', 'natureprof'] },
            { id: 'religion', keys: ['religion', 'religiao', 'religião', 'checkbox37', 'religionprof'] },
            { id: 'insight', keys: ['insight', 'intuicao', 'intuição', 'checkbox29', 'insightprof'] },
            { id: 'medicine', keys: ['medicine', 'medicina', 'checkbox32', 'medicineprof'] },
            { id: 'perception', keys: ['perception', 'percepcao', 'percepção', 'checkbox34', 'perceptionprof'] },
            { id: 'survival', keys: ['survival', 'sobrevivencia', 'sobrevivência', 'checkbox40', 'survivalprof'] },
            { id: 'animalHandling', keys: ['animalhandling', 'adestramento', 'lidarcomanimais', 'checkbox24', 'animalhandlingprof'] },
            { id: 'deception', keys: ['deception', 'decepcao', 'decepção', 'enganacao', 'enganação', 'checkbox27', 'deceptionprof'] },
            { id: 'intimidation', keys: ['intimidation', 'intimidacao', 'intimidação', 'checkbox30', 'intimidationprof'] },
            { id: 'performance', keys: ['performance', 'atuacao', 'atuação', 'checkbox35', 'performanceprof'] },
            { id: 'persuasion', keys: ['persuasion', 'persuasao', 'persuasão', 'checkbox36', 'persuasionprof'] }
        ];

        skillList.forEach(sk => {
            if (getSkillProficiency(sk.keys)) {
                mapped.skills.push(sk.id);
            }
        });

        // Loop to extract up to 6 attacks / weapons
        for (let i = 1; i <= 6; i++) {
            const name = findVal([`weapon${i}name`, `wknname${i}`, `atkname${i}`, `ataquename${i}`, `arma${i}`, `weapon${i}`]);
            if (name && String(name).trim() && !String(name).toLowerCase().includes('weapon')) {
                const bonus = findVal([`weapon${i}atkbonus`, `wknatkbonus${i}`, `atkatkbonus${i}`, `ataquebonus${i}`, `bonus${i}`]) || '';
                const damage = findVal([`weapon${i}damage`, `wkndamage${i}`, `atkdamage${i}`, `ataquedano${i}`, `dano${i}`]) || '';
                mapped.attacks.push({
                    name: String(name).trim(),
                    bonus: String(bonus).trim(),
                    damage: String(damage).trim()
                });
            }
        }

        // Parse equipment items
        if (mapped.equipment.notes) {
            const lines = mapped.equipment.notes.split(/[\n,;]+/);
            lines.forEach(line => {
                const cleaned = line.trim();
                if (cleaned && cleaned.length > 2) {
                    let qty = 1;
                    let name = cleaned;
                    const qtyMatch = cleaned.match(/(?:x\s*(\d+))|(\d+)\s*x|\((\d+)\)/i);
                    if (qtyMatch) {
                        qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]);
                        name = cleaned.replace(qtyMatch[0], '').trim();
                    }
                    mapped.equipment.items.push({ name, qty, weight: 0 });
                }
            });
        }

        // Parse Spells and Spell Slots from PDF fields
        for (let i = 0; i <= 9; i++) {
            mapped.spells[`lvl${i}`] = '';
            mapped.spellSlots[i] = { total: 0, used: 0 };
            
            if (i > 0) {
                mapped.spellSlots[i].total = getIntVal([`slots${i}`, `spellslots${i}`, `slotslvl${i}`, `spellslotslvl${i}`, `slotstotal${i}`], 0);
            }
            
            const levelSpellKeys = Object.keys(v).filter(k => {
                const nk = norm(k);
                return (nk.includes('spell') || nk.includes('magia')) && (nk.includes(String(i)) || (i === 0 && (nk.includes('cantrip') || nk.includes('truque'))));
            });
            
            const levelSpellsList = [];
            levelSpellKeys.forEach(k => {
                const val = String(v[k]).trim();
                if (val && !levelSpellsList.includes(val) && val.length > 2) {
                    levelSpellsList.push(val);
                }
            });
            
            if (levelSpellsList.length > 0) {
                mapped.spells[`lvl${i}`] = levelSpellsList.join('\n');
            }
        }

        return mapped;
    }
    async processImport() {
        const text = this.$('#import-text').value;
        if (!text) return;
        
        Toast.show('🔮 Sincronizando dados da ficha...');
        
        const clean = (t) => t ? t.trim() : '';
        const getInt = (reg) => { const m = text.match(reg); return m ? parseInt(m[1] || m[2]) : null; };

        // Scanning basic fields
        const name = text.match(/(?:Character Name|Nome do Personagem|Nome):\s*([^\r\n]+)/i)?.[1] || clean(text.split('\n')[0]);
        const charClass = text.match(/(?:Class|Classe)(?:\s*&\s*Level|&Nível)?:\s*([^\r\n]+)/i)?.[1] || text.match(/(?:Classe):\s*([^\r\n]+)/i)?.[1];
        const race = text.match(/(?:Race|Raça):\s*([^\r\n]+)/i)?.[1];
        const background = text.match(/(?:Background|Antecedente|Antecedentes):\s*([^\r\n]+)/i)?.[1];
        const alignment = text.match(/(?:Alignment|Tendência|Tendencia):\s*([^\r\n]+)/i)?.[1];
        const xp = getInt(/(?:Experience|XP|Experiência):\s*(\d+)/i);
        
        const ac = getInt(/(?:Armor Class|AC|CA|Classe de Armadura)\s*(\d+)/i) || getInt(/(?:CA|AC):\s*(\d+)/i);
        const hp = getInt(/(?:Hit Points|HP|PV|Pontos de Vida|Vida)\s*(\d+)/i) || getInt(/(?:PV|HP):\s*(\d+)/i);
        const speed = getInt(/(?:Speed|Deslocamento|Desloc|Velocidade)\s*(\d+)/i);
        const init = getInt(/(?:Initiative|Iniciativa|Inic)\s*([+-]?\d+)/i);
        const prof = getInt(/(?:Proficiency Bonus|Bônus de Proficiência|Bônus Prof)\s*([+-]?\d+)/i);

        // Scan Abilities scores
        const getStatFromText = (abbrs) => {
            for (let abbr of abbrs) {
                const reg = new RegExp(`(?:${abbr}|${abbr.toUpperCase()})\\s*Score?\\s*(\\d+)|(?:${abbr}|${abbr.toUpperCase()})\\s*:\\s*(\\d+)|\\b(?:${abbr}|${abbr.toUpperCase()})\\s+(\\d+)\\b`, 'i');
                const m = text.match(reg);
                if (m) {
                    const val = parseInt(m[1] || m[2] || m[3]);
                    if (val >= 1 && val <= 30) return val;
                }
            }
            return 10;
        };

        const stats = {
            str: getStatFromText(['str', 'strength', 'força', 'forca', 'for']),
            dex: getStatFromText(['dex', 'dexterity', 'destreza', 'des']),
            con: getStatFromText(['con', 'constitution', 'constituição', 'constituiçao', 'con']),
            int: getStatFromText(['int', 'intelligence', 'inteligência', 'inteligencia', 'int']),
            wis: getStatFromText(['wis', 'wisdom', 'sabedoria', 'sab']),
            cha: getStatFromText(['cha', 'charisma', 'carisma', 'car'])
        };

        // Scan checked Skills (matching checkboxes like [X] or circles like ● next to name)
        const skillMatches = [];
        this._skills.forEach(sk => {
            const labelNorm = sk.label.toLowerCase();
            const idNorm = sk.id.toLowerCase();
            const patterns = [
                new RegExp(`\\[[Xx•●]\\]\\s*(?:${labelNorm}|${idNorm})`, 'i'),
                new RegExp(`(?:${labelNorm}|${idNorm})\\s*\\([Xx•●]\\)`, 'i'),
                new RegExp(`●\\s*(?:${labelNorm}|${idNorm})`, 'i'),
                new RegExp(`(?:${labelNorm}|${idNorm})\\s*\\+\\d+\\s*(?:\\(prof\\)|\\bproficiente\\b)`, 'i')
            ];
            if (patterns.some(p => p.test(text))) {
                skillMatches.push(sk.id);
            }
        });

        // Scan checked Saving Throws
        const savingThrows = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
        const statsAbbr = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const statsLabels = {
            str: ['força', 'for', 'strength'],
            dex: ['destreza', 'des', 'dexterity'],
            con: ['constituição', 'con', 'constitution'],
            int: ['inteligência', 'int', 'intelligence'],
            wis: ['sabedoria', 'sab', 'wisdom'],
            cha: ['carisma', 'car', 'charisma']
        };
        
        statsAbbr.forEach(s => {
            const labels = statsLabels[s];
            for (let label of labels) {
                const patterns = [
                    new RegExp(`\\[[Xx•●]\\]\\s*Resistência\\s+de\\s+${label}`, 'i'),
                    new RegExp(`\\[[Xx•●]\\]\\s*${label}\\s+Saving\\s+Throw`, 'i'),
                    new RegExp(`\\[[Xx•●]\\]\\s*${label}\\s+Save`, 'i'),
                    new RegExp(`●\\s*${label}\\s*Save`, 'i'),
                    new RegExp(`●\\s*Resistência\\s+de\\s+${label}`, 'i'),
                    new RegExp(`(?:${label})\\s*\\+\\d+\\s*(?:\\(prof\\)|\\bsave\\b)`, 'i')
                ];
                if (patterns.some(p => p.test(text))) {
                    savingThrows[s] = true;
                }
            }
        });

        // Extract Attacks from text (e.g. "Espada Curta +5 (1d6+3)" or "Arco Longo +4 (1d8+2)")
        const attacks = [];
        const atkRegex = /([a-zA-ZáéíóúÁÉÍÓÚçÇ\s]{3,20})\s+([+-]\d+)\s*\(([^)]+)\)/g;
        let match;
        while ((match = atkRegex.exec(text)) !== null && attacks.length < 6) {
            const nameAtk = match[1].trim();
            const blacklist = ['iniciativa', 'classe', 'armadura', 'deslocamento', 'pontos', 'vida', 'bonus', 'proficiencia', 'experience', 'background', 'level', 'alignment', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            if (!blacklist.some(b => nameAtk.toLowerCase().includes(b))) {
                attacks.push({
                    name: nameAtk,
                    bonus: match[2],
                    damage: match[3]
                });
            }
        }
        if (attacks.length === 0) {
            attacks.push({ name: '', bonus: '', damage: '' });
        }

        // Extract Equipment section
        let eqNotesText = '';
        const eqMatch = text.match(/(?:Equipment|Equipamento|🎒 Itens):\s*([\s\S]+?)(?=\n\n|\n[A-Z][a-z]+:|\n[A-Z]{3,}\b)/i);
        if (eqMatch) {
            eqNotesText = eqMatch[1].trim();
        }
        const items = [];
        if (eqNotesText) {
            const lines = eqNotesText.split(/[\n,;]+/);
            lines.forEach(line => {
                const cleaned = line.trim();
                if (cleaned && cleaned.length > 2) {
                    let qty = 1;
                    let nameItem = cleaned;
                    const qtyMatch = cleaned.match(/(?:x\s*(\d+))|(\d+)\s*x|\((\d+)\)/i);
                    if (qtyMatch) {
                        qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]);
                        nameItem = cleaned.replace(qtyMatch[0], '').trim();
                    }
                    items.push({ name: nameItem, qty, weight: 0 });
                }
            });
        }

        let parsedLvl = 1;
        let parsedClass = clean(charClass) || 'Guerreiro';
        if (parsedClass.includes(' ')) {
            const levelMatch = parsedClass.match(/(\d+)/);
            if (levelMatch) {
                parsedLvl = parseInt(levelMatch[1]);
                parsedClass = parsedClass.replace(levelMatch[0], '').trim();
            }
        }

        const importData = {
            name: clean(name) || 'Herói Sem Nome',
            class: parsedClass,
            level: parsedLvl,
            race: clean(race) || 'Humano',
            background: clean(background) || 'Herói do Povo',
            playerName: '',
            alignment: clean(alignment) || 'Neutro',
            xp: xp || 0,
            ac: ac || 10,
            hp: { current: hp || 10, max: hp || 10, temp: 0 },
            speed: speed || 30,
            initiative: init || 0,
            proficiencyBonus: prof || 2,
            stats: stats,
            savingThrows: savingThrows,
            skills: skillMatches,
            attacks: attacks,
            currency: {
                pp: getInt(/(?:PP|Platina):\s*(\d+)/i) || 0,
                gp: getInt(/(?:GP|Ouro|PO):\s*(\d+)/i) || 0,
                ep: getInt(/(?:EP|Electrum):\s*(\d+)/i) || 0,
                sp: getInt(/(?:SP|Prata|PP):\s*(\d+)/i) || 0,
                cp: getInt(/(?:CP|Cobre|PC):\s*(\d+)/i) || 0
            },
            roleplay: {
                traits: text.match(/(?:Personality Traits|Traços|Características):\s*([^\r\n]+)/i)?.[1] || '',
                ideals: text.match(/(?:Ideals|Ideais):\s*([^\r\n]+)/i)?.[1] || '',
                bonds: text.match(/(?:Bonds|Vínculos):\s*([^\r\n]+)/i)?.[1] || '',
                flaws: text.match(/(?:Flaws|Fraquezas|Defeitos):\s*([^\r\n]+)/i)?.[1] || ''
            },
            equipment: {
                items: items,
                notes: eqNotesText
            },
            otherProfs: text.match(/(?:Other Proficiencies & Languages|Outras Proficiências & Idiomas|Idiomas|Proficiências):\s*([^\r\n]+)/i)?.[1] || '',
            bio: text.match(/(?:Backstory|História|Biografia):\s*([^\r\n]+)/i)?.[1] || '',
            allies: '',
            spells: {},
            spellSlots: {}
        };

        const languages = text.match(/(?:Languages|Idiomas):\s*([^\r\n]+)/i)?.[1];
        if (languages && !importData.otherProfs) importData.otherProfs = `IDIOMAS: ${languages}`;

        // Parse Spells from plain text if present
        for (let i = 0; i <= 9; i++) {
            const spellRegex = new RegExp(`(?:Level ${i} Spells|Magias de ${i}º Nível|Nível ${i}):\\s*([\\s\\S]+?)(?=\\n\\n|\\nLevel|\\nNível|\\b[A-Z][a-z]+:)`, 'i');
            const spellMatch = text.match(spellRegex);
            if (spellMatch) {
                importData.spells[`lvl${i}`] = spellMatch[1].trim();
            }
        }

        this._fillForm(importData);

        // AUTO-SAVE PERSISTENCE INTEGRATION FOR TEXT IMPORT
        try {
            TOME.store.update(s => {
                if (this._editingId) {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...importData };
                    }
                    Toast.show('✅ Ficha do herói atualizada e salva com sucesso!', 'success');
                } else {
                    const nameSlug = (importData.name || 'hero').toLowerCase().replace(/\s+/g, '_');
                    const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
                    const player = { ...Schemas.createPlayer(importData), id: uniqueId };
                    s.players = [...s.players, player];
                    s.editingHeroId = uniqueId;
                    Toast.show('✅ Novo herói importado e salvo com sucesso!', 'success');
                }
            });
        } catch (saveErr) {
            if (saveErr.name === 'QuotaExceededError' || saveErr.message.includes('Quota')) {
                Toast.show('❌ Limite de armazenamento atingido (QuotaExceeded)! Remova dados antigos para liberar espaço.', 'danger');
                return;
            }
            console.error('Erro ao salvar ficha importada por texto:', saveErr);
            Toast.show('❌ Erro inesperado ao salvar ficha.', 'danger');
        }

        this.previewCards();
        this.closeImporter();
    }
}
