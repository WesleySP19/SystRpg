import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from './Toast.js';
import { GridEngine } from '../../engine/GridEngine.js';
import { TokenEngine, CONDITIONS, TOKEN_SIZES } from '../../engine/TokenEngine.js';
import { FogEngine } from '../../engine/FogEngine.js';
import { EffectEngine, EFFECT_SHAPES, EFFECT_COLORS } from '../../engine/EffectEngine.js';
import { VisionEngine } from '../../engine/VisionEngine.js';
import { ReferencePanel } from '../../engine/ReferencePanel.js';
import { Dice } from '../../utils/Dice.js';
import { LootEngine } from '../../services/LootEngine.js';
import { TurnTracker } from './TurnTracker.js';
import { combat } from '../../utils/combat.js';
import { CombatArena } from './CombatArena.js';
import { PersistenceService } from '../../services/PersistenceService.js';
import { LightingEngine } from '../../engine/LightingEngine.js';
import { DungeonGenerator } from '../../engine/DungeonGenerator.js';
import { MapInputHandler } from './MapInputHandler.js';
import { MapRenderer } from './MapRenderer.js';
import { CommandStack } from '../../engine/UndoRedo.js';
import { ECSWorld, Position, Vision, Health, Light, Aura, CombatState, MovementSystem, VisionSystem, CombatSystem } from '../../engine/ECS.js';
import { QuadTree } from '../../engine/QuadTree.js';

const COMBAT_TOOLS = ['select', 'measure', 'fog', 'sphere', 'cone', 'cube', 'line'];
const EDITOR_TOOLS = ['wall', 'door', 'stairs', 'floor_rect', 'floor_circle', 'freehand', 'stamp', 'text', 'light', 'erase'];
const TOOLS = [...COMBAT_TOOLS, ...EDITOR_TOOLS];

const TOOL_ICONS = {
  select: 'fa-mouse-pointer',
  measure: 'fa-ruler-combined',
  fog: 'fa-cloud',
  sphere: 'fa-circle-dot',
  cone: 'fa-triangle',
  cube: 'fa-square',
  line: 'fa-grip-lines',
  wall: 'fa-ban',
  door: 'fa-door-open',
  stairs: 'fa-stairs',
  floor_rect: 'fa-vector-square',
  floor_circle: 'fa-circle',
  freehand: 'fa-signature',
  stamp: 'fa-tree',
  text: 'fa-font',
  light: 'fa-lightbulb',
  erase: 'fa-eraser'
};

const TOOL_LABELS = {
  select: 'Selecionar',
  measure: 'Medir',
  fog: 'Névoa de Guerra',
  sphere: 'Efeito: Esfera',
  cone: 'Efeito: Cone',
  cube: 'Efeito: Cubo',
  line: 'Efeito: Linha',
  wall: 'Desenhar Parede',
  door: 'Desenhar Porta',
  stairs: 'Desenhar Escada',
  floor_rect: 'Desenhar Chão Retangular',
  floor_circle: 'Desenhar Chão Circular',
  freehand: 'Desenhar Linha Livre',
  stamp: 'Carimbo Decorativo',
  text: 'Escrever Texto',
  light: 'Fonte de Luz',
  erase: 'Borracha'
};

const COND_LIST = Object.keys(CONDITIONS);

export class MapManager extends Component {
  constructor(opts) {
    super(opts);
    const saved = this.store.state.tacticalMap || {};
    this._grid = saved.grid ? GridEngine.deserialize(saved.grid) : new GridEngine({cellSize:60,cols:28,rows:18});
    this._tokens = saved.tokens ? TokenEngine.deserialize(saved.tokens) : new TokenEngine();
    
    // Editor State
    this._tool = 'select';
    this._activePings = [];
    this._zoom = 1;
    this._pan = {x:0,y:0};
    this._fog = null;
    this._fogEnabled = saved.fog?.enabled || false;
    this._fogBrush = 1;
    this._fogMode = 'reveal';
    this._effects = null;
    this._vision = new VisionEngine(this._grid);
    
    // Environment & Constraints
    this._timeOfDayMode = saved.timeOfDayMode || 'auto';
    this._weather = saved.weather || 'none';
    this._maxMonsters = saved.maxMonsters || 150;
    
    this._gridType = saved.gridType || 'square';
    this._mapTheme = saved.theme || 'classic';
    this._mapElements = saved.elements || [];
    this._mapLights = saved.lights || [];
    this._showGrid = saved.showGrid !== false;
    
    this._selectedElementId = null;
    this._offscreenCanvas = null;
    
    // Tool options
    this._stampKey = '🌲';
    this._scatterStamps = false;
    this._textValue = 'Marcador';
    this._textColor = '#ffffff';
    this._textSize = 14;
    this._lightColor = '#ff9c33';
    this._lightRange = 30;

    // Measurement & drawings temp
    this._measuring = false;
    this._measureStart = null;
    this._measureEnd = null;
    this._effectOrigin = null;
    this._effectDragging = false;
    this._effectShape = 'sphere';
    this._effectSizeFt = 20;
    this._effectColorKey = 'fire';
    this._selectedTokenId = null;
    this._animId = null;
    this._mapImg = null;
    this._mapUrl = this.store.state.currentMap || '';
    this._mapWidth = 1680;
    this._mapHeight = 1080;
    this._channel = null;
    this._refPanel = null;
    this._showCleanupMenu = false;
    this._encounterReport = null;
    this._contributions = saved.contributions || {};
    
    // Mouse drawing state
    this._drawingStart = null;
    this._currentMousePos = null;
    this._currentPath = null;
    this._isDraggingToken = false;
    this._draggedTokenId = null;

    // Infrastructure: ECS, QuadTree & UndoRedo
    this._undoRedo = new CommandStack(this);
    this._ecsWorld = new ECSWorld();
    this._ecsMovementSystem = new MovementSystem(this._grid);
    this._ecsVisionSystem = new VisionSystem(this._grid, null);
    this._ecsCombatSystem = new CombatSystem();
    this._ecsWorld.addSystem(this._ecsMovementSystem);
    this._ecsWorld.addSystem(this._ecsVisionSystem);
    this._ecsWorld.addSystem(this._ecsCombatSystem);

    this._quadTree = new QuadTree({ x: 0, y: 0, w: this._mapWidth, h: this._mapHeight });

    try { this._channel = new BroadcastChannel('tome_map'); } catch(e){}
  }

  template() {
    const st = this.store.state;
    const order = st.initiativeOrder || [];
    const curr = order[st.initiativeIndex || 0];
    const tokens = this._tokens.getAllTokens();
    const sel = this._selectedTokenId ? this._tokens.getToken(this._selectedTokenId) : null;
    const hpPct = sel ? Math.round((sel.hp.current/sel.hp.max)*100) : 100;
    const hpColor = TokenEngine.hpColor(hpPct);

    // Common glass style
    const glassStyle = "background:rgba(12,14,20,0.75); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.08); box-shadow:0 15px 35px rgba(0,0,0,0.5);";

    return `<div class="tmap-root" style="position:relative; width:100%; height:100%; overflow:hidden; background:#040507; display:flex; font-family:'Outfit', sans-serif;">
      
      <!-- CANVAS AREA (HERO) -->
      <div class="tmap-canvas-wrap" id="tmap-wrap" style="position:absolute; inset:0; width:100%; height:100%; overflow:hidden; z-index:0;">
        <canvas id="tmap-grid" class="tmap-canvas-layer" style="position:absolute; inset:0; width:100%; height:100%;"></canvas>
        <canvas id="tmap-fog" class="tmap-canvas-layer" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none;"></canvas>
        <svg id="tmap-svg" class="tmap-canvas-layer" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none;"></svg>
        <div id="tmap-tokens" class="tmap-canvas-layer" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:10;"></div>
        <!-- Measure readout -->
        <div id="tmap-measure-hud" class="tmap-measure-hud" style="position:absolute; bottom:90px; left:50%; transform:translateX(-50%); padding:8px 16px; background:rgba(10,12,16,0.9); border:1px solid var(--accent); color:#fff; border-radius:12px; font-family:'Outfit'; font-weight:bold; font-size:0.9rem; display:none; z-index:100; box-shadow:0 10px 30px rgba(0,0,0,0.8); backdrop-filter:blur(10px);"></div>
      </div>

      <!-- UI OVERLAY -->
      <div class="tmap-ui-layer" style="position:absolute; inset:0; pointer-events:none; z-index:20; display:flex; justify-content:space-between; padding:20px;">
        
        <!-- LEFT DOCK (Tools) -->
        <div class="tmap-left-dock" style="pointer-events:auto; display:flex; flex-direction:column; gap:15px; width:54px; max-height:100%; overflow-y:auto; scrollbar-width:none;">
          <!-- Combat Tools -->
          <div style="${glassStyle} border-radius:16px; padding:6px; display:flex; flex-direction:column; gap:6px; align-items:center;">
            <div style="font-size:0.5rem; color:var(--accent); font-weight:900; font-family:'Cinzel'; text-align:center; padding:4px 0;">CBT</div>
            ${COMBAT_TOOLS.map(t=>`<button class="tmap-tool-btn ${this._tool===t?'active':''}" style="width:40px; height:40px; border-radius:10px; transition:all 0.2s;" data-action="setTool" data-tool="${t}" title="${TOOL_LABELS[t]}"><i class="fa-solid ${TOOL_ICONS[t]}"></i></button>`).join('')}
          </div>

          <!-- Design Tools -->
          <div style="${glassStyle} border-radius:16px; padding:6px; display:flex; flex-direction:column; gap:6px; align-items:center;">
            <div style="font-size:0.5rem; color:var(--accent); font-weight:900; font-family:'Cinzel'; text-align:center; padding:4px 0;">DSG</div>
            ${EDITOR_TOOLS.map(t=>`<button class="tmap-tool-btn ${this._tool===t?'active':''}" style="width:40px; height:40px; border-radius:10px; transition:all 0.2s;" data-action="setTool" data-tool="${t}" title="${TOOL_LABELS[t]}"><i class="fa-solid ${TOOL_ICONS[t]}"></i></button>`).join('')}
            
            <div style="width:100%; height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
            
            <button class="tmap-tool-btn ${this._fogEnabled?'active':''}" style="width:40px; height:40px; border-radius:10px;" data-action="toggleFog" title="Ativar Névoa"><i class="fa-solid fa-cloud"></i></button>
            
            <!-- Cleanup Menu -->
            <div style="position:relative; display:flex; justify-content:center;">
                <button class="tmap-tool-btn ${this._showCleanupMenu?'active':''}" style="color:var(--warning); width:40px; height:40px; border-radius:10px;" data-action="toggleCleanupMenu" title="Opções de Limpeza"><i class="fa-solid fa-broom"></i></button>
                ${this._showCleanupMenu ? `
                <div class="glass" style="position:absolute; top:0; left:55px; width:220px; ${glassStyle} border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:6px; z-index:9999; animation: fadeIn 0.15s ease-out;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:4px; font-family:'Outfit';"><i class="fa-solid fa-broom" style="color:var(--accent);"></i> LIMPEZA RÁPIDA</div>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; color:#fff;" data-action="clearVisualEffects">✨ Limpar Efeitos</button>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; color:#fff;" data-action="clearWalls">🧱 Limpar Paredes</button>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; color:#fff;" data-action="resetFog">🌫️ Resetar Névoa</button>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; color:#fff;" data-action="clearDeadTokens">💀 Remover Mortos</button>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; color:var(--warning);" data-action="endCombatAndCleanScenario">🏁 Encerrar & Limpar</button>
                    <div style="width:100%; height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; font-size:0.75rem; font-weight:bold; color:#10b981;" data-action="switchToClassic"><i class="fa-solid fa-pen-nib"></i> Modo Clássico</button>
                    <div style="width:100%; height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button class="btn btn-danger btn-sm" style="justify-content:flex-start; font-size:0.75rem; font-weight:800; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3);" data-action="hardResetMap">💥 RESET COMPLETO</button>
                </div>
                ` : ''}
            </div>
          </div>

          <!-- Zoom & Actions -->
          <div style="${glassStyle} border-radius:16px; padding:6px; display:flex; flex-direction:column; gap:6px; align-items:center;">
            <button class="btn btn-ghost" style="padding:8px; color:#fff;" data-action="zoomIn" title="Aumentar Zoom"><i class="fa-solid fa-plus"></i></button>
            <button class="btn btn-ghost" style="padding:8px; color:#fff;" data-action="resetView" title="Focar"><i class="fa-solid fa-expand"></i></button>
            <button class="btn btn-ghost" style="padding:8px; color:#fff;" data-action="zoomOut" title="Diminuir Zoom"><i class="fa-solid fa-minus"></i></button>
            
            <div style="width:100%; height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
            
            <button class="tmap-tool-btn" style="color:var(--accent); width:40px; height:40px; border-radius:10px;" data-action="broadcastMap" title="Transmitir Mapa"><i class="fa-solid fa-broadcast-tower"></i></button>
            <button class="tmap-tool-btn" style="width:40px; height:40px; border-radius:10px;" data-action="uploadMap" title="Fundo"><i class="fa-solid fa-file-image"></i></button>
            <input type="file" id="map-file" accept="image/*" style="display:none">
          </div>
        </div>

        <!-- CENTER DYNAMIC TOOLS (Contextual) -->
        <div style="position:absolute; top:20px; left:50%; transform:translateX(-50%); pointer-events:auto; display:flex; gap:10px;">
          ${['sphere','cone','cube','line'].includes(this._tool)?`
            <div style="${glassStyle} border-radius:12px; padding:6px 12px; display:flex; gap:8px;">
              <select class="form-input" style="padding:4px 10px; font-size:0.8rem; background:rgba(0,0,0,0.5); border:1px solid rgba(197,160,89,0.3); color:#fff; border-radius:6px; outline:none;" data-action="setEffectSize">
                <option value="10" ${this._effectSizeFt==10?'selected':''}>10ft</option>
                <option value="15" ${this._effectSizeFt==15?'selected':''}>15ft</option>
                <option value="20" ${this._effectSizeFt==20?'selected':''}>20ft</option>
                <option value="30" ${this._effectSizeFt==30?'selected':''}>30ft</option>
                <option value="60" ${this._effectSizeFt==60?'selected':''}>60ft</option>
              </select>
              <select class="form-input" style="padding:4px 10px; font-size:0.8rem; background:rgba(0,0,0,0.5); border:1px solid rgba(197,160,89,0.3); color:#fff; border-radius:6px; outline:none;" data-action="setEffectColor">
                ${Object.keys(EFFECT_COLORS).map(k=>`<option value="${k}" ${this._effectColorKey===k?'selected':''}>${k}</option>`).join('')}
              </select>
            </div>
          ` : ''}
          ${this._tool==='fog' ? `
            <div style="${glassStyle} border-radius:12px; padding:6px 12px; display:flex; gap:8px; align-items:center;">
              <button class="btn btn-sm ${this._fogMode==='reveal'?'btn-primary':'btn-ghost'}" style="border-radius:6px;" data-action="setFogMode" data-mode="reveal">REVELAR</button>
              <button class="btn btn-sm ${this._fogMode==='hide'?'btn-primary':'btn-ghost'}" style="border-radius:6px;" data-action="setFogMode" data-mode="hide">ESCONDER</button>
              <select class="form-input" style="padding:2px 8px; font-size:0.8rem; background:rgba(0,0,0,0.5); color:#fff; border-radius:6px;" data-action="setFogBrush">
                <option value="1" ${this._fogBrush===1?'selected':''}>P</option>
                <option value="2" ${this._fogBrush===2?'selected':''}>M</option>
                <option value="4" ${this._fogBrush===4?'selected':''}>G</option>
              </select>
            </div>
          ` : ''}
        </div>

        <!-- RIGHT PANEL (Combatants & Settings) -->
        <div class="tmap-right-panel" style="pointer-events:auto; width:300px; display:flex; flex-direction:column; gap:15px; max-height:100%; overflow-y:auto; scrollbar-width:none;">
          
          <!-- Round Info -->
          <div style="${glassStyle} border-radius:16px; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(197,160,89,0.3);">
            <div style="display:flex; flex-direction:column;">
              <span style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800; letter-spacing:1px;">RODADA</span>
              <span style="font-size:1.6rem; font-weight:800; line-height:1;">${st.combatRound||1}</span>
            </div>
            ${curr ? `<div style="background:rgba(96,165,250,0.15); border:1px solid rgba(96,165,250,0.4); padding:6px 12px; border-radius:20px; font-weight:700; font-size:0.8rem; color:var(--info); box-shadow:0 0 15px rgba(96,165,250,0.2);"><i class="fa-solid fa-swords"></i> ${curr.name}</div>` : ''}
          </div>

          <!-- PROPERTIES OR CONFIGURATIONS -->
          <div style="${glassStyle} border-radius:16px; padding:15px; flex-shrink:0;">
            ${sel ? `
              <div style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; font-weight:800; margin-bottom:10px;"><i class="fa-solid fa-circle-user"></i> ATRIBUTOS DO ALVO</div>
              
              <div style="display:flex; gap:12px; margin-bottom:15px;">
                <div style="width:70px; height:70px; border-radius:12px; background:${sel.img?`url(${sel.img}) center/cover`:'rgba(255,255,255,0.05)'}; border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.4);">
                  ${!sel.img ? `<span style="font-size:1.8rem; color:var(--accent);">${sel.emoji || sel.name[0]}</span>` : ''}
                </div>
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                  <div style="font-size:1.1rem; font-weight:800; margin-bottom:4px;">${sel.name}</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.75rem;">
                    <div>HP <span style="color:${hpColor}; font-weight:800;">${sel.hp.current}/${sel.hp.max}</span></div>
                    <div>CA <span style="color:var(--accent); font-weight:800;">${sel.ac}</span></div>
                    <div>VEL <span style="color:var(--info); font-weight:800;">${this._tokens.getRemainingMove(sel.id)}ft</span></div>
                  </div>
                </div>
              </div>

              <!-- HP Controls -->
              <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;">
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-danger btn-sm" style="flex:1; border-radius:8px; font-weight:800;" data-action="dmgToken"><i class="fa-solid fa-minus"></i></button>
                  <input id="tmap-hp-input" type="number" class="form-input" style="width:60px; text-align:center; background:rgba(0,0,0,0.5); border:1px solid rgba(197,160,89,0.3); border-radius:8px; font-weight:bold; height:32px;" value="5">
                  <button class="btn btn-success btn-sm" style="flex:1; border-radius:8px; font-weight:800;" data-action="healToken"><i class="fa-solid fa-plus"></i></button>
                </div>
              </div>

              <!-- Conditions -->
              <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
                ${COND_LIST.slice(0,10).map(c=>`
                  <button class="tmap-cond-btn ${sel.conditions.includes(c)?'active':''}" style="padding:6px; font-size:1.1rem; background:${sel.conditions.includes(c)?'rgba(197,160,89,0.2)':'rgba(0,0,0,0.3)'}; border:1px solid ${sel.conditions.includes(c)?'var(--accent)':'rgba(255,255,255,0.05)'}; color:#fff; border-radius:8px; cursor:pointer; transition:all 0.2s;" data-action="toggleCond" data-cond="${c}" title="${CONDITIONS[c].label}">
                    ${CONDITIONS[c].icon}
                  </button>
                `).join('')}
              </div>
            ` : `
              <!-- NO SELECTION: SETTINGS -->
              <div style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; font-weight:800; margin-bottom:10px;"><i class="fa-solid fa-wand-magic-sparkles"></i> GERADORES DE CENÁRIO</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-bottom:12px;">
                <button class="btn btn-sm btn-primary" style="font-size:0.65rem; padding:4px;" data-action="generateDungeon">MASMORRA</button>
                <button class="btn btn-sm btn-primary" style="font-size:0.65rem; padding:4px;" data-action="generateForest">FLORESTA</button>
                <button class="btn btn-sm btn-primary" style="font-size:0.65rem; padding:4px;" data-action="generateQuest">QUEST</button>
              </div>

              <div style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; font-weight:800; margin-bottom:10px; margin-top:10px;"><i class="fa-solid fa-cloud-sun"></i> CLIMA & ILUMINAÇÃO</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:4px; margin-bottom:8px;">
                <button class="btn btn-sm ${this._timeOfDayMode==='auto'?'btn-primary':'btn-ghost'}" style="font-size:0.6rem; padding:4px;" data-action="setTimeMode" data-mode="auto"><i class="fa-solid fa-clock"></i> Ciclo 10m</button>
                <button class="btn btn-sm ${this._timeOfDayMode==='day'?'btn-primary':'btn-ghost'}" style="font-size:0.6rem; padding:4px;" data-action="setTimeMode" data-mode="day"><i class="fa-solid fa-sun"></i> Dia</button>
                <button class="btn btn-sm ${this._timeOfDayMode==='night'?'btn-primary':'btn-ghost'}" style="font-size:0.6rem; padding:4px;" data-action="setTimeMode" data-mode="night"><i class="fa-solid fa-moon"></i> Noite</button>
              </div>
              <div style="margin-bottom:12px;">
                <select class="form-input" style="width:100%; padding:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); border-radius:6px; color:#fff; font-family:'Outfit'; font-size:0.75rem;" data-action="changeWeather">
                  <option value="none" ${this._weather==='none'?'selected':''}>☀️ Sem Clima / Limpo</option>
                  <option value="rain" ${this._weather==='rain'?'selected':''}>🌧️ Chuva Torrencial</option>
                  <option value="snow" ${this._weather==='snow'?'selected':''}>❄️ Neve Suave</option>
                  <option value="fog" ${this._weather==='fog'?'selected':''}>🌫️ Névoa Densa</option>
                </select>
              </div>

              <div style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; font-weight:800; margin-bottom:10px; margin-top:10px;"><i class="fa-solid fa-layer-group"></i> CONFIGURAÇÕES DO MAPA</div>
              
              <div style="margin-bottom:12px;">
                <label style="font-size:0.65rem; color:var(--text-dim); display:block; margin-bottom:4px; text-transform:uppercase; font-weight:800;">Estilo Visual</label>
                <select class="form-input" style="width:100%; padding:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); border-radius:6px; color:#fff; font-family:'Outfit';" data-action="setTheme">
                  <option value="classic" ${this._mapTheme==='classic'?'selected':''}>Masmorra Clássica</option>
                  <option value="scrawl" ${this._mapTheme==='scrawl'?'selected':''}>Blueprint Scrawl</option>
                  <option value="scrawl-classic" ${this._mapTheme==='scrawl-classic'?'selected':''}>Dungeon Scrawl (Branco)</option>
                  <option value="tavern" ${this._mapTheme==='tavern'?'selected':''}>Taverna (Madeira)</option>
                  <option value="cave" ${this._mapTheme==='cave'?'selected':''}>Caverna Escura</option>
                  <option value="scifi" ${this._mapTheme==='scifi'?'selected':''}>Sci-Fi / Cyberpunk</option>
                </select>
              </div>

              <label style="font-size:0.65rem; color:var(--text-dim); display:block; margin-bottom:4px; text-transform:uppercase; font-weight:800;">Tipo de Grade</label>
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-bottom:12px;">
                <button class="btn btn-sm ${this._gridType==='square'?'btn-primary':'btn-ghost'}" style="font-size:0.65rem;" data-action="setGridType" data-type="square">GRADE</button>
                <button class="btn btn-sm ${this._gridType==='hex'?'btn-primary':'btn-ghost'}" style="font-size:0.65rem;" data-action="setGridType" data-type="hex">HEX</button>
                <button class="btn btn-sm ${this._gridType==='iso'?'btn-primary':'btn-ghost'}" style="font-size:0.65rem;" data-action="setGridType" data-type="iso">ISO</button>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:0.8rem;">
                <span style="color:var(--text-dim);">Mostrar Linhas:</span>
                <input type="checkbox" style="accent-color:var(--accent); width:16px; height:16px;" ${this._showGrid!==false?'checked':''} data-action="toggleShowGrid">
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
                <div>
                  <label style="font-size:0.65rem; color:var(--text-dim); display:block; margin-bottom:4px;">Colunas</label>
                  <input id="tmap-cols-input" type="number" class="form-input" style="width:100%; padding:6px; text-align:center; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); border-radius:6px; height:32px;" value="${this._grid.cols}">
                </div>
                <div>
                  <label style="font-size:0.65rem; color:var(--text-dim); display:block; margin-bottom:4px;">Linhas</label>
                  <input id="tmap-rows-input" type="number" class="form-input" style="width:100%; padding:6px; text-align:center; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); border-radius:6px; height:32px;" value="${this._grid.rows}">
                </div>
              </div>
              <button class="btn btn-ghost btn-sm btn-block" style="border:1px solid rgba(197,160,89,0.4); margin-bottom:15px;" data-action="resizeGrid">REDIMENSIONAR</button>

              <!-- Tools specific config (Stamp/Light) -->
              ${this._tool === 'stamp' ? `
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:12px;">
                  <label style="font-size:0.7rem; color:var(--accent); font-family:'Cinzel';">Símbolo (Carimbo):</label>
                  <select class="form-input" style="width:100%; padding:6px; background:rgba(0,0,0,0.5); border:1px solid rgba(197,160,89,0.3); border-radius:6px; outline:none; margin-top:6px;" data-action="setStampKey">
                    <option value="🌲" ${this._stampKey==='🌲'?'selected':''}>🌲 Árvore</option>
                    <option value="🪨" ${this._stampKey==='🪨'?'selected':''}>🪨 Rocha</option>
                    <option value="📦" ${this._stampKey==='📦'?'selected':''}>📦 Baú</option>
                    <option value="🚪" ${this._stampKey==='🚪'?'selected':''}>🚪 Porta</option>
                    <option value="💀" ${this._stampKey==='💀'?'selected':''}>💀 Esqueleto</option>
                  </select>
                </div>
              ` : ''}
              ${this._tool === 'light' ? `
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:12px;">
                  <label style="font-size:0.7rem; color:var(--accent); font-family:'Cinzel';">Raio de Luz (ft):</label>
                  <select class="form-input" style="width:100%; margin-bottom:8px; background:rgba(0,0,0,0.5); border-radius:6px;" data-action="setLightRange">
                    <option value="15" ${this._lightRange==15?'selected':''}>15 ft</option>
                    <option value="30" ${this._lightRange==30?'selected':''}>30 ft</option>
                    <option value="60" ${this._lightRange==60?'selected':''}>60 ft</option>
                  </select>
                  <label style="font-size:0.7rem; color:var(--accent); font-family:'Cinzel';">Cor:</label>
                  <select class="form-input" style="width:100%; background:rgba(0,0,0,0.5); border-radius:6px;" data-action="setLightColor">
                    <option value="#ff9c33" ${this._lightColor==='#ff9c33'?'selected':''}>Fogo</option>
                    <option value="#3399ff" ${this._lightColor==='#3399ff'?'selected':''}>Magia (Azul)</option>
                    <option value="#33ff99" ${this._lightColor==='#33ff99'?'selected':''}>Tóxico (Verde)</option>
                  </select>
                </div>
              ` : ''}
            `}
          </div>

          <!-- COMBATANTS LIST -->
          <div style="${glassStyle} border-radius:16px; padding:15px; flex:1; display:flex; flex-direction:column; overflow:hidden;">
            <div style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; font-weight:800; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
              <span><i class="fa-solid fa-users"></i> COMBATENTES</span>
            </div>
            
            <div style="overflow-y:auto; scrollbar-width:thin; display:flex; flex-direction:column; gap:8px; padding-right:4px; flex:1;">
              ${tokens.map(t=>{
                const hpP = Math.round((t.hp.current/t.hp.max)*100);
                const hpC = TokenEngine.hpColor(hpP);
                const isSelected = this._selectedTokenId===t.id;
                const isActive = t.isCurrentTurn;
                
                let border = isSelected ? 'border:1px solid var(--accent);' : isActive ? 'border:1px solid rgba(96,165,250,0.4);' : 'border:1px solid rgba(255,255,255,0.05);';
                let bg = isSelected ? 'background:rgba(197,160,89,0.15);' : isActive ? 'background:rgba(96,165,250,0.1);' : 'background:rgba(0,0,0,0.4);';
                let shadow = isActive ? 'box-shadow:0 0 15px rgba(96,165,250,0.2);' : '';

                return `
                  <div class="tmap-token-item" style="${bg} ${border} ${shadow} border-radius:12px; padding:10px; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all 0.2s; opacity:${t.isDead?0.5:1};" data-action="selectToken" data-id="${t.id}">
                    <div style="width:36px; height:36px; border-radius:50%; background:${t.img?`url(${t.img}) center/cover`:'rgba(255,255,255,0.1)'}; border:2px solid ${t.type==='monster'?'var(--danger)':'var(--info)'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      ${!t.img ? (t.name[0]||'?') : ''}
                    </div>
                    <div style="flex:1; min-width:0;">
                      <div style="font-weight:700; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>
                      <div style="height:4px; background:rgba(0,0,0,0.5); border-radius:2px; margin-top:4px; overflow:hidden;">
                        <div style="height:100%; width:${hpP}%; background:${hpC};"></div>
                      </div>
                    </div>
                    <button style="background:none; border:none; color:var(--text-dim); cursor:pointer; font-size:0.9rem;" data-action="removeToken" data-id="${t.id}"><i class="fa-solid fa-times"></i></button>
                  </div>
                `;
              }).join('')}
              ${tokens.length === 0 ? '<div style="text-align:center; padding:20px; opacity:0.5; font-size:0.8rem;"><i class="fa-solid fa-ghost" style="font-size:2rem; margin-bottom:10px; display:block;"></i>Vazio</div>' : ''}
            </div>

            <!-- Quick Add -->
            <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
              <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px; font-weight:800;"><i class="fa-solid fa-ghost" style="margin-right:4px;"></i> Invocação Dinâmica</div>
              <div style="display:flex; flex-direction:column; gap:4px; max-height:160px; overflow-y:auto; scrollbar-width:none; padding-right:4px;">
                ${[...(this.store.state.players||[]),...(this.store.state.monsters||[])].map(e=>{
                  const isMon = (this.store.state.monsters||[]).some(m => m.id === e.id);
                  const isSelSpawn = this._tool === 'spawn' && this._spawnEntity?.id === e.id;
                  const bColor = isMon ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
                  const bg = isSelSpawn ? bColor : 'rgba(0,0,0,0.3)';
                  const ic = isMon ? 'fa-skull' : 'fa-user';
                  return `<button style="background:${bg}; border:1px solid ${bColor}; border-radius:8px; padding:6px 10px; font-size:0.75rem; color:#fff; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s; font-weight:${isSelSpawn?'800':'500'}; box-shadow:${isSelSpawn?'0 0 10px '+bColor:'none'};" data-action="addToken" data-id="${e.id}"><i class="fa-solid ${ic}" style="opacity:0.7;"></i> ${e.name}</button>`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- BOTTOM ACTION BAR -->
      <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); pointer-events:auto; z-index:20; display:flex; gap:15px; align-items:center; background:rgba(12,14,20,0.85); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(197,160,89,0.3); border-radius:30px; padding:8px 16px; box-shadow:0 20px 40px rgba(0,0,0,0.8);">
        ${st.combatActive ? `
          <button class="btn btn-ghost" style="border-radius:20px; font-weight:800; font-size:0.8rem; padding:8px 16px; color:#fff;" data-action="nextTurn">
            <i class="fa-solid fa-forward-step" style="color:var(--accent);"></i> PRÓXIMO TURNO
          </button>
          <div style="width:1px; height:20px; background:rgba(255,255,255,0.1);"></div>
          <button class="btn btn-danger" style="border-radius:20px; font-weight:800; font-size:0.8rem; padding:8px 16px; box-shadow:0 0 15px rgba(244,63,94,0.3);" data-action="endCombat">
            <i class="fa-solid fa-flag-checkered"></i> ENCERRAR
          </button>
        ` : `
          <button class="btn btn-primary" style="border-radius:20px; font-weight:800; font-size:0.8rem; padding:8px 20px; background:linear-gradient(135deg, var(--accent), var(--accent-bright)); color:#000;" data-action="startCombat">
            <i class="fa-solid fa-swords"></i> INICIAR COMBATE
          </button>
        `}
      </div>

      ${this._encounterReport ? this._renderEncounterReportModal() : ''}
    </div>`;
  }

  onMount() {
    this._renderer = new MapRenderer(this);
    this._setupCanvases();
    this._inputHandler = new MapInputHandler(this);
    this._inputHandler.attach(this.$('#tmap-wrap'));
    this._loadMap(this._mapUrl);
    this._startLoop();
    this._mountRef();

    this._onSummonEvent = (e) => {
      const entity = e.detail;
      this._tool = 'spawn';
      this._spawnEntity = entity;
      import('./Toast.js').then(m => m.Toast.show(`Modo Invocação: Clique no grid para invocar ${entity.name}!`, 'info')).catch(() => {});
      this.render();
    };
    window.addEventListener('tome-summon-monster', this._onSummonEvent);
    
    const fi = this.$('#map-file');
    if(fi) fi.onchange = e => {
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader();
      r.onload = async (re) => {
        const raw = re.target.result;
        const compressed = await this._compressImage(raw);
        const fileName = `map_${Date.now()}_${f.name}`;
        const finalUrl = await PersistenceService.uploadImage(fileName, compressed);
        this._loadMap(finalUrl);
      };
      r.readAsDataURL(f);
    };
  }

  _mountRef() {
    const el = this.$('#tmap-refpanel');
    if(!el) return;
    this._refPanel = new ReferencePanel({ store: this.store, element: el });
    this._refPanel.mount();
  }

  _setupCanvases() {
    const wrap = this.$('#tmap-wrap');
    if(!wrap) return;
    const W = wrap.clientWidth  || 900;
    const H = wrap.clientHeight || 540;
    this._W = W; this._H = H;
    this._mapWidth  = this._grid.cols * this._grid.cellSize;
    this._mapHeight = this._grid.rows * this._grid.cellSize;

    ['tmap-grid','tmap-fog'].forEach(id => {
      const c = this.$('#'+id);
      if(c){ c.width=W; c.height=H; }
    });
    const svg = this.$('#tmap-svg');
    if(svg){ svg.setAttribute('width',W); svg.setAttribute('height',H); }

    this._ctxGrid = this.$('#tmap-grid').getContext('2d');
    const fogCanvas = this.$('#tmap-fog');
    this._fog = new FogEngine(fogCanvas, this._grid);
    this._ecsVisionSystem.fog = this._fog;
    this._effects = new EffectEngine(svg, this._grid);
    
    const saved = this.store.state.tacticalMap || {};
    if (saved.fog) this._fog.load(saved.fog);
    this._fog.enabled = this._fogEnabled;
    if (saved.effects) this._effects.load(saved.effects);
    
    // Invalidate static background cache when canvas resizes
    if (this._renderer) this._renderer.invalidateCache();
  }

  requestRender() {
    this._needsRender = true;
  }

  _startLoop() {
    this._needsRender = true;
    const loop = () => {
      // isAnimating detects if any continuous interaction is happening
      const hasWeather = this._weather && this._weather !== 'none';
      const hasAutoTime = this._timeOfDayMode === 'auto';
      const isAnimating = this._isDraggingToken || this._drawingStart || this._measuring || this._effectDragging || this._panning || hasWeather || hasAutoTime;
      
      if (this._needsRender || isAnimating) {
        this._renderer.render();
        this._fog.render(this._zoom, this._pan.x, this._pan.y);
        this._needsRender = false;
      }
      this._animId = requestAnimationFrame(loop);
    };
    this._animId = requestAnimationFrame(loop);
  }

  _setupEvents() {
    return; // Migrated to MapInputHandler
  }

  toMap(clientX, clientY) {
    const wrap = this.$('#tmap-wrap');
    if (!wrap) return { x: 0, y: 0 };
    const rect = wrap.getBoundingClientRect();
    const rawX = (clientX - rect.left - this._pan.x) / this._zoom;
    const rawY = (clientY - rect.top - this._pan.y) / this._zoom;
    
    if (this._gridType === 'iso') {
      const W = this._grid.cols * this._grid.cellSize * 1.5;
      const isoOffset = W / 2;
      const normX = rawX - isoOffset;
      const normY = rawY - 50;
      const C = Math.cos(Math.PI / 4);
      return {
        x: (normX + 2 * normY) / (2 * C),
        y: (2 * normY - normX) / (2 * C)
      };
    }
    return { x: rawX, y: rawY };
  }

  getProjectedCoords(x, y) {
    if (this._gridType === 'iso') {
      const W = this._grid.cols * this._grid.cellSize * 1.5;
      const isoOffset = W / 2;
      const isoX = (x - y) * Math.cos(Math.PI / 4);
      const isoY = (x + y) * Math.sin(Math.PI / 4) * 0.5;
      return {
        x: (isoOffset + isoX) * this._zoom + this._pan.x,
        y: (50 + isoY) * this._zoom + this._pan.y
      };
    }
    return {
      x: x * this._zoom + this._pan.x,
      y: y * this._zoom + this._pan.y
    };
  }


  _eraseNear(x, y) {
    const thresh = 25;
    let erased = false;

    // A. Erase elements
    const beforeCount = this._mapElements.length;
    this._mapElements = this._mapElements.filter(el => {
      if (el.type === 'stamp' || el.type === 'text') {
        return Math.hypot(el.x - x, el.y - y) > thresh;
      }
      if (el.type === 'rect' || el.type === 'stairs') {
        const midX = (el.x1 + el.x2) / 2;
        const midY = (el.y1 + el.y2) / 2;
        return Math.hypot(midX - x, midY - y) > thresh * 2;
      }
      if (el.type === 'circle') {
        return Math.hypot(el.cx - x, el.cy - y) > el.r && Math.hypot(el.cx - x, el.cy - y) > thresh;
      }
      return true;
    });
    if (this._mapElements.length !== beforeCount) erased = true;

    // B. Erase lights
    const beforeLights = this._mapLights.length;
    this._mapLights = this._mapLights.filter(l => Math.hypot(l.x - x, l.y - y) > thresh);
    if (this._mapLights.length !== beforeLights) erased = true;

    // C. Erase walls
    const beforeWalls = this._grid._walls.length;
    this._grid._walls = this._grid._walls.filter(w => {
      const midX = (w.x1 + w.x2) / 2;
      const midY = (w.y1 + w.y2) / 2;
      return Math.hypot(midX - x, midY - y) > thresh;
    });
    if (this._grid._walls.length !== beforeWalls) erased = true;

    // D. Erase doors
    const beforeDoors = this._grid._doors.length;
    this._grid._doors = this._grid._doors.filter(d => {
      const midX = (d.x1 + d.x2) / 2;
      const midY = (d.y1 + d.y2) / 2;
      return Math.hypot(midX - x, midY - y) > thresh;
    });
    if (this._grid._doors.length !== beforeDoors) erased = true;

    if (erased) {
      Toast.show('Elemento apagado!', 'info');
      this._sync();
      this.render();
    }
  }

  _hitToken(mx,my) {
    const tokens = this._tokens.getAllTokens();
    const cs = this._grid.cellSize;
    return tokens.find(t => Math.abs(t.x-mx)<cs/1.2 && Math.abs(t.y-my)<cs/1.2) || null;
  }

  _resizeCanvases() {
    const wrap = this.$('#tmap-wrap');
    if(!wrap) return;
    const W=wrap.clientWidth, H=wrap.clientHeight;
    this._W=W; this._H=H;
    ['tmap-grid','tmap-fog'].forEach(id=>{
      const c=this.$('#'+id);
      if(c){c.width=W;c.height=H;}
    });
    const svg=this.$('#tmap-svg');
    if(svg){svg.setAttribute('width',W);svg.setAttribute('height',H);}
    if(this._effects) this._effects.resize(W,H);
  }

  _loadMap(url) {
    if(!url) return;
    this._mapUrl=url;
    const img=new Image();
    img.crossOrigin='anonymous';
    img.onload=()=>{
      this._mapImg=img;
      if (this._renderer) this._renderer.invalidateCache();
      if(this._fog) this._fog.revealAll();
      this._sync();
      this.render();
    };
    img.src=url;
    TOME.store.update(s=>s.currentMap=url);
  }

  /* ── ACTIONS ──────────────────────────────────────────────────── */
  setTool(e,el) { 
    this._tool=el.dataset.tool; 
    this._selectedTokenId = null;
    this._selectedElementId = null;
    this._effectShape=el.dataset.tool; 
    this.render(); 
  }
  setEffectSize(e,el) { this._effectSizeFt=parseInt(el.value)||20; }
  setEffectColor(e,el) { this._effectColorKey=el.value; }
  
  setGridType(e, el) {
    this._gridType = el.dataset.type;
    if (this._renderer) this._renderer.invalidateCache();
    this._sync();
    this.render();
    Toast.show(`Layout da grade alterado para: ${el.dataset.type.toUpperCase()}`, 'success');
  }

  setTheme(e, el) {
    this._mapTheme = el.value;
    if (this._renderer) this._renderer.invalidateCache();
    this._sync();
    this.render();
    Toast.show(`Estilo visual alterado!`, 'success');
  }

  setTimeMode(e, el) {
    this._timeOfDayMode = el.dataset.mode;
    this._sync();
    this.render();
    import('./Toast.js').then(m => m.Toast.show(`Modo de iluminação: ${this._timeOfDayMode.toUpperCase()}`, 'success')).catch(() => {});
  }

  changeWeather(e, el) {
    this._weather = el.value;
    this._sync();
    this.render();
    import('./Toast.js').then(m => m.Toast.show(`Clima alterado para: ${this._weather.toUpperCase()}`, 'success')).catch(() => {});
  }

  toggleShowGrid(e, el) {
    this._showGrid = el.checked;
    this._sync();
    this.render();
  }

  setStampKey(e, el) { this._stampKey = el.value; }
  toggleScatter(e, el) { this._scatterStamps = el.checked; }
  setTextValue(e, el) { this._textValue = el.value; }
  setTextSize(e, el) { this._textSize = parseInt(el.value) || 14; }
  setTextColor(e, el) { this._textColor = el.value; }
  setLightRange(e, el) { this._lightRange = parseInt(el.value) || 30; }
  setLightColor(e, el) { this._lightColor = el.value; }

  uploadCustomImage(e, el) {
      const file = el.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          const imgData = ev.target.result;
          const center = this.toMap(this._W/2, this._H/2);
          
          this._tokens.addToken({
              id: `custom_img_${Date.now()}`,
              name: 'Objeto',
              img: imgData,
              size: 'medium',
              hp_max: 0
          }, center.x, center.y);
          
          Toast.show('Objeto adicionado ao mapa!', 'success');
          this._sync();
          this.render();
      };
      reader.readAsDataURL(file);
      el.value = ''; // Reset input
  }

  generateDungeon() {
    if (confirm('🚨 Deseja gerar uma masmorra procedural? Isso apagará as paredes, portas, luzes e elementos atuais do mapa!')) {
      const result = DungeonGenerator.generateDungeon(this._grid.cols, this._grid.rows, this._grid.cellSize);
      
      this._grid._walls = result.walls;
      this._grid._doors = result.doors;
      this._mapElements = result.elements;
      this._mapLights = result.lights;
      this._mapTheme = 'classic';
      if (this._renderer) this._renderer.invalidateCache();
      
      this._sync();
      this.render();
      Toast.show('🧱 Masmorra gerada com sucesso!', 'success');
    }
  }

  generateForest() {
    if (confirm('🚨 Deseja gerar uma floresta procedural? Isso apagará as paredes, portas, luzes e elementos atuais do mapa!')) {
      const result = DungeonGenerator.generateForest(this._grid.cols, this._grid.rows, this._grid.cellSize);
      
      this._grid._walls = result.walls;
      this._grid._doors = result.doors;
      this._mapElements = result.elements;
      this._mapLights = result.lights;
      this._mapTheme = 'cave'; // Use cave theme as base for forest (dirt/moss)
      if (this._renderer) this._renderer.invalidateCache();
      
      this._sync();
      this.render();
      Toast.show('🌲 Floresta gerada com sucesso!', 'success');
    }
  }

  generateQuest() {
    if (confirm('🗺️ Deseja gerar uma Quest estruturada? Isso apagará o mapa atual!')) {
      const result = DungeonGenerator.generateQuestMap(this._grid.cols, this._grid.rows, this._grid.cellSize);
      
      this._grid._walls = result.walls;
      this._grid._doors = result.doors;
      this._mapElements = result.elements;
      this._mapLights = result.lights;
      this._mapTheme = 'classic';
      if (this._renderer) this._renderer.invalidateCache();
      
      this._sync();
      this.render();
      Toast.show('🗺️ Quest gerada com sucesso!', 'success');
    }
  }

  exportAsImage() {
    // Generate high resolution image capture
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = this._grid.cols * this._grid.cellSize;
    captureCanvas.height = this._grid.rows * this._grid.cellSize;
    const cctx = captureCanvas.getContext('2d');
    
    // Draw cells
    for(let r=0; r<this._grid.rows; r++) {
      for(let c=0; c<this._grid.cols; c++) {
        this._drawCellBackground(cctx, c, r, this._grid.cellSize, this._mapTheme);
      }
    }
    
    // Draw elements
    this._mapElements.forEach(el => {
      if (el.type === 'rect') {
        cctx.fillStyle = '#22232a';
        cctx.fillRect(Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.abs(el.x2-el.x1), Math.abs(el.y2-el.y1));
      } else if (el.type === 'circle') {
        cctx.fillStyle = '#22232a';
        cctx.beginPath();
        cctx.arc(el.cx, el.cy, el.r, 0, Math.PI*2);
        cctx.fill();
      }
    });

    // Draw walls
    cctx.strokeStyle = '#c5a059';
    cctx.lineWidth = 4;
    this._grid.getWalls().forEach(w => {
      cctx.beginPath(); cctx.moveTo(w.x1, w.y1); cctx.lineTo(w.x2, w.y2); cctx.stroke();
    });

    // Download trigger
    const link = document.createElement('a');
    link.download = `tome_map_${Date.now()}.png`;
    link.href = captureCanvas.toDataURL('image/png');
    link.click();
    Toast.show('📷 Imagem exportada!', 'success');
  }

  toggleFog() { 
    this._fogEnabled = !this._fogEnabled; 
    if (this._fog) this._fog.enabled = this._fogEnabled; 
    this._sync();
    this.render(); 
    Toast.show(this._fogEnabled ? 'Névoa Ativada' : 'Névoa Desativada', 'info');
  }
  setFogMode(e, el) { this._fogMode = el.dataset.mode; this.render(); }
  setFogBrush(e, el) { this._fogBrush = parseInt(el.value); }
  toggleCleanupMenu(e) {
    if (e) e.stopPropagation();
    this._showCleanupMenu = !this._showCleanupMenu;
    this.render();
  }
  endCombatAndCleanScenario() {
    const allTokens = this._tokens.getAllTokens();
    const defeated = allTokens.filter(t => t.type === 'monster' && (t.hp.current <= 0 || t.isDead));
    const players = this.store.state.players || [];
    const survivors = allTokens.filter(t => t.type === 'player' && !t.isDead);

    this._encounterReport = combat.generateEncounterReport(
      defeated, 
      survivors, 
      players, 
      this.store.state.monsters || [], 
      this._contributions || {}, 
      this.store.state.combatRound || 1
    );

    this.render();
  }

  applyEncounterRewards() {
    if (!this._encounterReport) return;
    const report = this._encounterReport;
    const { totalLoot, summaryText } = report;

    TOME.store.update(s => {
      const updatedPlayers = combat.applyEncounterRewards(report, s.players || []);
      
      // Handle UI feedback and currency for the players
      s.players = updatedPlayers.map(p => {
        const oldPlayer = (s.players || []).find(op => op.id === p.id) || {};
        
        if (p.level > (oldPlayer.level || 1)) {
          setTimeout(() => {
            Toast.show(`🎉 PARABÉNS! ${p.name} SUBIU PARA O NÍVEL ${p.level}!`, 'success');
          }, 500);
        }

        if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
        p.currency.cp = (parseInt(p.currency.cp) || 0) + (totalLoot.cp || 0);
        p.currency.sp = (parseInt(p.currency.sp) || 0) + (totalLoot.sp || 0);
        p.currency.ep = (parseInt(p.currency.ep) || 0) + (totalLoot.ep || 0);
        p.currency.gp = (parseInt(p.currency.gp) || 0) + (totalLoot.gp || 0);
        p.currency.pp = (parseInt(p.currency.pp) || 0) + (totalLoot.pp || 0);

        return p;
      });

      const rewardLines = report.rewards.map(r => `${r.name}: +${r.xpEarned} XP (Fator: ${r.pct}%)`).join(', ');

      if (!s.journalEntries) s.journalEntries = [];
      s.journalEntries.push({
        id: Date.now(),
        timestamp: Date.now(),
        type: 'combat',
        title: 'Encontro Concluído com Sucesso',
        content: `${summaryText}\nRecompensas individuais distribuídas: ${rewardLines}.\nTesouros de ${totalLoot.gp} PO, ${totalLoot.sp} PP, ${totalLoot.cp} PC para cada herói.`
      });

      if (s.tacticalMap) {
        s.tacticalMap.contributions = {};
      }
    });

    this._contributions = {};
    this.justClearMap(true);
    Toast.show('⚔️ Encontro Encerrado! Experiência e riquezas creditadas para o grupo!', 'success');
  }

  justClearMap(silent = false) {
    if(this._effects) this._effects.clearAllEffects();
    this._grid._walls = [];
    this._grid._doors = [];
    this._mapElements = [];
    this._mapLights = [];
    
    if(this._fog) this._fog.revealAll();
    const allTokens = this._tokens.getAllTokens();
    const survivors = allTokens.filter(t => t.hp.current > 0 && !t.isDead);
    this._tokens._tokens.clear();
    survivors.forEach(t => {
      t.isCurrentTurn = false;
      this._tokens._tokens.set(t.id, t);
    });
    this._selectedTokenId = null;
    this._selectedElementId = null;
    TOME.store.update(s => {
      s.combatActive = false;
      s.combatRound = 1;
      s.initiativeIndex = 0;
      s.initiativeOrder = [];
      if (s.tacticalMap) {
        s.tacticalMap.contributions = {};
      }
    });
    this._contributions = {};
    const layer = this.$('#tmap-tokens');
    if (layer) layer.innerHTML = '';
    this._sync();
    this._broadcastCombat();
    this._encounterReport = null;
    this._showCleanupMenu = false;
    if (!silent) {
      Toast.show('🧹 Limpeza concluída! Apenas os combatentes vivos permanecem.', 'info');
    }
    this.render();
  }

  cancelEncounterReport() {
    this._encounterReport = null;
    this.render();
  }
  clearVisualEffects() {
    if(this._effects) {
      this._effects.clearAllEffects();
      this._sync();
      Toast.show('✨ Efeitos visuais limpos!', 'success');
    }
    this._showCleanupMenu = false;
    this.render();
  }
  clearWalls() {
    this._grid._walls = [];
    this._grid._doors = [];
    this._mapElements = [];
    this._mapLights = [];
    this._sync();
    Toast.show('🧱 Desenhos e paredes limpos!', 'success');
    this._showCleanupMenu = false;
    this.render();
  }
  resetFog() {
    if(this._fog) {
      this._fog.revealAll();
      this._sync();
      Toast.show('🌫️ Névoa de guerra resetada (revelada)!', 'success');
    }
    this._showCleanupMenu = false;
    this.render();
  }
  clearDeadTokens() {
    const dead = this._tokens.getAllTokens().filter(t => t.isDead);
    if(dead.length === 0) {
      Toast.show('Nenhum combatente morto para remover.', 'info');
      this._showCleanupMenu = false;
      this.render();
      return;
    }
    dead.forEach(t => this._tokens.removeToken(t.id));
    this._sync();
    Toast.show(`💀 ${dead.length} combatentes mortos removidos!`, 'success');
    this._showCleanupMenu = false;
    this.render();
  }
  clearAllTokens() {
    const count = this._tokens.getAllTokens().length;
    if(count === 0) {
      Toast.show('Nenhum combatente no mapa.', 'info');
      this._showCleanupMenu = false;
      this.render();
      return;
    }
    this._tokens._tokens.clear();
    this._selectedTokenId = null;
    const layer = this.$('#tmap-tokens');
    if (layer) layer.innerHTML = '';
    this._sync();
    Toast.show(`🎭 Todos os ${count} combatentes removidos!`, 'success');
    this._showCleanupMenu = false;
    this.render();
  }
  resetWholeScenario() {
    if(confirm('🚨 Deseja realizar um RESET TOTAL do cenário? Isso limpará efeitos, paredes, combatentes e revelará a névoa!')) {
      this._grid._walls = [];
      this._grid._doors = [];
      this._mapElements = [];
      this._mapLights = [];
      this._tokens._tokens.clear();
      this._selectedTokenId = null;
      if(this._effects) this._effects.clearAllEffects();
      if(this._fog) this._fog.revealAll();
      const layer = this.$('#tmap-tokens');
      if (layer) layer.innerHTML = '';
      this._sync();
      Toast.show('💥 Reset total do cenário concluído!', 'danger');
    }
    this._showCleanupMenu = false;
    this.render();
  }

  switchToClassic() {
    this._grid._walls = [];
    this._grid._doors = [];
    this._mapElements = [];
    this._mapLights = [];
    this._tokens._tokens.clear();
    this._selectedTokenId = null;
    if(this._effects) this._effects.clearAllEffects();
    if(this._fog) Object.assign(this._fog, { enabled: false });
    this._fogEnabled = false;
    this._mapTheme = 'scrawl-classic';
    this._showGrid = true;
    this._gridType = 'square';
    const layer = this.$('#tmap-tokens');
    if (layer) layer.innerHTML = '';
    
    Toast.show('Modo Dungeon Scrawl Clássico Ativado! Tela limpa.', 'success');
    this._showCleanupMenu = false;
    this._sync();
    this.render();
  }
  uploadMap() { this.$('#map-file')?.click(); }
  zoomIn() { this._zoom=Math.min(3,this._zoom+0.15); this._resizeCanvases(); }
  zoomOut() { this._zoom=Math.max(0.3,this._zoom-0.15); this._resizeCanvases(); }
  resetView() { this._zoom=1; this._pan={x:0,y:0}; this._resizeCanvases(); }
  
  broadcastMap() {
    const filename = TOME.persistence?.filename || 'state.json';
    let tableId = filename.replace('mesa_', '').replace('.json', '');
    if (tableId === 'state') tableId = 'default';

    const data = { 
      mapUrl: this._mapUrl, 
      grid: this._grid.serialize(),
      tokens: this._tokens.serialize(), 
      fog: this._fog?.serialize(),
      effects: this._effects?.serialize(),
      elements: this._mapElements,
      lights: this._mapLights,
      gridType: this._gridType,
      theme: this._mapTheme,
      showGrid: this._showGrid
    };
    
    const cleanData = JSON.parse(JSON.stringify(data));
    TOME.store.update(s=>s.playerMapData=cleanData);
    if(this._channel) this._channel.postMessage({type:'MAP_UPDATE',...cleanData});
    window.open(`./player-view.html?mesa=${tableId}`,'TOME_PLAYER_VIEW','width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
    Toast.show('Mapa transmitido para tela de jogadores!','success');
  }

  addToken(e,el) {
    const id=el.dataset.id;
    const all=[...(this.store.state.players||[]),...(this.store.state.monsters||[])];
    const entity=all.find(x=>x.id===id);
    if(!entity){Toast.show('Entidade não encontrada','danger');return;}
    
    // Arm SpawnTool
    this._tool = 'spawn';
    this._spawnEntity = entity;
    Toast.show(`Modo Invocação: Clique no grid para invocar ${entity.name}!`, 'info');
    
    // Auto-close right panel on mobile if needed, or simply render
    this.render();
  }

  removeToken(e,el) {
    e.stopPropagation();
    const id=el.dataset.id;
    this._tokens.removeToken(id);
    if(this._selectedTokenId===id) this._selectedTokenId=null;
    const layer=this.$('#tmap-tokens');
    layer?.querySelector(`[data-tid="${id}"]`)?.remove();
    this._sync(); this.render();
  }

  selectToken(e,el) {
    const id=el.dataset.id;
    this._selectedTokenId=(this._selectedTokenId===id)?null:id;
    this.render();
  }

  dmgToken() {
    if(!this._selectedTokenId) return;
    const v=parseInt(this.$('#tmap-hp-input')?.value)||5;
    this._tokens.modifyHP(this._selectedTokenId,-v);
    
    const authorId = this.$('#tmap-action-author')?.value;
    const target = this._tokens.getToken(this._selectedTokenId);
    if (authorId && target && target.type === 'monster') {
      this._recordContribution(authorId, 'damage', v);
    }

    const t=this._tokens.getToken(this._selectedTokenId);
    if(t?.isDead) Toast.show(`${t.name} foi derrotado!`,'danger');
    this._sync(); this.render();
  }

  healToken() {
    if(!this._selectedTokenId) return;
    const v=parseInt(this.$('#tmap-hp-input')?.value)||5;
    this._tokens.modifyHP(this._selectedTokenId,v);

    const authorId = this.$('#tmap-action-author')?.value;
    const target = this._tokens.getToken(this._selectedTokenId);
    if (authorId && target && target.type === 'player') {
      this._recordContribution(authorId, 'healing', v);
    }

    this._sync(); this.render();
  }

  toggleCond(e,el) {
    if(!this._selectedTokenId) return;
    this._tokens.toggleCondition(this._selectedTokenId,el.dataset.cond);
    this._sync(); this.render();
  }

  rollCheck(e, el) {
    if (!this._selectedTokenId) return;
    const type = el.dataset.type;
    const sel = this._tokens.getToken(this._selectedTokenId);
    if (!sel) return;

    if (sel.type === 'player' && sel.entityId) {
      this._recordContribution(sel.entityId, 'actions', 10);
    }

    const getMod = (v) => Math.floor((v - 10) / 2);
    let mod = 0;
    let label = '';
    let notation = '';

    if (type === 'initiative') {
      mod = getMod(sel.stats?.dex || 10);
      label = 'Iniciativa';
    } else if (type === 'attack') {
      mod = getMod(sel.stats?.str || 10) + 2;
      label = 'Ataque Físico';
    } else if (type === 'save') {
      mod = getMod(sel.stats?.con || 10);
      label = 'Salvaguarda de Constituição';
    }

    const sign = mod >= 0 ? '+' : '';
    notation = `1d20${sign}${mod}`;
    const result = Dice.roll(notation);

    if (result.error) {
      Toast.show('Erro ao rolar dados.', 'danger');
      return;
    }

    Toast.show(`🎲 ${sel.name} - ${label}: Rolo [${result.rolls.join(', ')}] ${sign}${result.modifier} = **${result.total}**`, 'success');
  }

  resizeGrid() {
    const cols = parseInt(this.$('#tmap-cols-input')?.value) || 28;
    const rows = parseInt(this.$('#tmap-rows-input')?.value) || 18;
    
    this._grid.cols = cols;
    this._grid.rows = rows;
    this._mapWidth = cols * this._grid.cellSize;
    this._mapHeight = rows * this._grid.cellSize;
    
    this._resizeCanvases();
    if(this._fog) this._fog.revealAll();
    this._sync();
    this.render();
    Toast.show(`Grade do mapa reajustada para ${cols}x${rows}!`, 'success');
  }

  nextTurn() {
    const order=this.store.state.initiativeOrder||[];
    if(!order.length) return;
    TOME.store.update(s=>{ s.initiativeIndex=((s.initiativeIndex||0)+1)%order.length; });
    const curr=order[this.store.state.initiativeIndex||0];
    if(curr) {
      const tok=[...this._tokens.getAllTokens()].find(t=>t.name===curr.name||t.entityId===curr.id);
      if(tok) this._tokens.setCurrentTurn(tok.id);
    }
    Toast.show(`Turno: ${curr?.name||'Próximo'}`,'info');
    this._broadcastCombat();
    this.render();
  }

  endCombat() {
    TOME.store.update(s=>{s.combatActive=false;s.combatRound=1;s.initiativeIndex=0;});
    Toast.show('Combate encerrado.','info');
    this._broadcastCombat();
    this.render();
  }

  startCombat() {
    const tokens = this._tokens.getAllTokens();
    if (!tokens.length) { Toast.show('Adicione combatentes primeiro!','warning'); return; }
    const order = combat.startCombat(tokens);
    TOME.store.update(s => {
      s.combatActive = true;
      s.combatRound = 1;
      s.initiativeIndex = 0;
      s.initiativeOrder = order;
    });
    const firstToken = this._tokens.getToken(order[0]);
    if (firstToken) this._tokens.setCurrentTurn(firstToken.id);
    Toast.show('⚔️ Combate iniciado!','success');
    this._broadcastCombat();
    this.render();
  }

  _renderEncounterReportModal() {
    if (!this._encounterReport) return '';
    const r = this._encounterReport;
    return `
      <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(4, 5, 8, 0.85); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px;">
        <div class="card glass animate-scaleIn" style="max-width:700px; width:100%; padding:30px; border:1.5px solid rgba(197, 160, 89, 0.4); border-radius:20px; background: linear-gradient(135deg, rgba(14, 16, 22, 0.95), rgba(8, 10, 15, 0.98)); box-shadow:0 25px 60px rgba(0,0,0,0.95); font-family:'Outfit'; max-height:92vh; overflow-y:auto; scrollbar-width:thin;">
          
          <div style="text-align:center; margin-bottom:24px; border-bottom:1.5px solid rgba(197, 160, 89, 0.25); padding-bottom:18px;">
            <i class="fa-solid fa-flag-checkered fa-3x" style="color:var(--accent); filter: drop-shadow(0 0 12px rgba(197,160,89,0.5)); margin-bottom:12px;"></i>
            <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.9rem; text-shadow:0 3px 6px rgba(0,0,0,0.8); letter-spacing:2px; font-weight: 900;">🏁 RELATÓRIO DO ENCONTRO</h3>
            <p style="font-size:0.75rem; color:var(--text-dim); margin-top:6px; text-transform:uppercase; font-weight:800; letter-spacing:2px;">Batalha concluída em <span style="color:#fff;">${r.combatRound}</span> rodadas</p>
          </div>

          <div style="background:rgba(197, 160, 89, 0.03); border:1px solid rgba(197, 160, 89, 0.15); border-radius:12px; padding:18px; margin-bottom:24px;">
            <div style="font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase; margin-bottom:8px; font-family:'Cinzel'; letter-spacing:1px; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-scroll"></i> Pergaminho de Batalha
            </div>
            <div style="font-size:0.85rem; color:#e2e8f0; line-height:1.5; font-style:italic;">"${r.summaryText}"</div>
          </div>

          <div style="background:rgba(8, 10, 15, 0.6); border:1px solid rgba(255, 255, 255, 0.05); border-radius:12px; padding:18px; margin-bottom:24px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
            <div style="font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase; margin-bottom:14px; font-family:'Cinzel'; display:flex; align-items:center; gap:6px; letter-spacing:1px;">
              <i class="fa-solid fa-trophy" style="color:var(--accent);"></i> Quadro de Proezas & Experiência
            </div>
            
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.8rem; text-align:left; color:#fff;">
                <thead>
                  <tr style="border-bottom:2px solid rgba(197, 160, 89, 0.3); font-size:0.65rem; text-transform:uppercase; color:var(--accent); letter-spacing:1px;">
                    <th style="padding:8px 6px; font-family:'Outfit';">Herói</th>
                    <th style="padding:8px 6px; text-align:center;">Dano Causado</th>
                    <th style="padding:8px 6px; text-align:center;">Cura Realizada</th>
                    <th style="padding:8px 6px; text-align:center;">Ações Críticas</th>
                    <th style="padding:8px 6px; text-align:center;">Fator Proporcional</th>
                    <th style="padding:8px 6px; text-align:right;">XP Concedido</th>
                  </tr>
                </thead>
                <tbody>
                  ${(r.rewards || []).map(p => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:12px 6px; font-weight:bold; color:#fff; font-size:0.85rem; font-family:'Cinzel', serif;">${p.name}</td>
                      <td style="padding:12px 6px; text-align:center; color:#f43f5e; font-weight:800; font-size:0.85rem;">💥 ${p.damage}</td>
                      <td style="padding:12px 6px; text-align:center; color:#10b981; font-weight:800; font-size:0.85rem;">💚 ${p.healing}</td>
                      <td style="padding:12px 6px; text-align:center; color:#60a5fa; font-weight:800; font-size:0.85rem;">⚡ ${p.actions}</td>
                      <td style="padding:12px 6px; text-align:center; font-weight:800; color:rgba(255,255,255,0.9);">${p.pct}%</td>
                      <td style="padding:12px 6px; text-align:right; font-weight:900; color:var(--accent); font-size:0.9rem; text-shadow:0 0 8px rgba(197,160,89,0.35);">+${p.xpEarned} XP</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:28px;">
            <div class="glass" style="padding:18px; border-radius:12px; border:1.5px solid rgba(197, 160, 89, 0.4); background:rgba(197,160,89,0.02); text-align:center; display:flex; flex-direction:column; justify-content:center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position:relative; overflow:hidden;">
              <div style="font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; margin-bottom:6px; font-family:'Cinzel'; letter-spacing:1px;"><i class="fa-solid fa-bolt"></i> Pool de Experiência do Encontro</div>
              <div style="font-size:2rem; font-weight:900; color:#fff; font-family:'Cinzel';">${r.totalXP} <span style="font-size:1rem; color:var(--accent); font-weight:700;">XP</span></div>
            </div>

            <div class="glass" style="padding:18px; border-radius:12px; border:1.5px solid rgba(16, 185, 129, 0.4); background:rgba(16, 185, 129, 0.02); text-align:center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position:relative; overflow:hidden;">
              <div style="font-size:0.65rem; color:#10b981; font-weight:800; text-transform:uppercase; margin-bottom:6px; font-family:'Cinzel'; letter-spacing:1px;"><i class="fa-solid fa-gem"></i> Tesouros Gerados do Saque</div>
              <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap;">
                ${r.totalLoot.gp > 0 ? `<span style="font-size:1rem; font-weight:800; color:#ffd700; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-coins"></i> ${r.totalLoot.gp} PO</span>` : ''}
                ${r.totalLoot.sp > 0 ? `<span style="font-size:1rem; font-weight:800; color:#cbd5e1; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-coins"></i> ${r.totalLoot.sp} PP</span>` : ''}
                ${r.totalLoot.cp > 0 ? `<span style="font-size:1rem; font-weight:800; color:#b45309; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-coins"></i> ${r.totalLoot.cp} PC</span>` : ''}
                ${(!r.totalLoot.gp && !r.totalLoot.sp && !r.totalLoot.cp) ? '<span style="font-size:0.85rem; color:var(--text-dim); font-style:italic;">Nenhum tesouro encontrado</span>' : ''}
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <button class="btn btn-primary" 
                    style="padding:15px; font-size:1rem; font-family:'Cinzel'; font-weight:900; border-radius:10px; background: linear-gradient(135deg, var(--accent), var(--accent-bright)); color:#000; border:none; box-shadow:0 0 20px rgba(197, 160, 89, 0.45); cursor:pointer;" 
                    data-action="applyEncounterRewards">
              💰 DISTRIBUIR RECOMPENSAS PROPORCIONAIS
            </button>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <button class="btn btn-ghost" 
                      style="padding:12px; border-radius:10px; font-size:0.8rem; font-weight:800; color:#f59e0b; border: 1.5px solid rgba(245,158,11,0.3); background:rgba(245,158,11,0.05); cursor:pointer;" 
                      data-action="justClearMap">
                🧹 APENAS LIMPAR MAPA
              </button>
              <button class="btn btn-ghost" 
                      style="padding:12px; border-radius:10px; font-size:0.8rem; font-weight:800; color:var(--text-dim); border: 1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02); cursor:pointer;" 
                      data-action="cancelEncounterReport">
                ❌ CANCELAR
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  _isHeroCurrentTurn(playerId) {
    const order = this.store.state.initiativeOrder || [];
    const index = this.store.state.initiativeIndex || 0;
    if (order.length === 0) return false;
    const currentName = order[index]?.name || order[index];
    const player = this.store.state.players?.find(p => p.id === playerId);
    return player && player.name === currentName;
  }

  _recordContribution(playerId, type, amount) {
    if (!playerId) return;
    if (!this._contributions) this._contributions = {};
    if (!this._contributions[playerId]) {
      this._contributions[playerId] = { damage: 0, healing: 0, actions: 0 };
    }
    this._contributions[playerId][type] = (this._contributions[playerId][type] || 0) + amount;
    this._sync();
  }

  _updateQuadTree() {
    const W = this._mapWidth || 1680;
    const H = this._mapHeight || 1080;
    this._quadTree = new QuadTree({ x: 0, y: 0, w: W, h: H });
    
    // Insert walls
    this._grid.getWalls().forEach(w => {
      const boundary = {
        x: Math.min(w.x1, w.x2),
        y: Math.min(w.y1, w.y2),
        w: Math.max(1, Math.abs(w.x2 - w.x1)),
        h: Math.max(1, Math.abs(w.y2 - w.y1))
      };
      this._quadTree.insert({ boundary, data: { type: 'wall', segment: w } });
    });
    
    // Insert doors
    this._grid.getDoors().forEach(d => {
      const boundary = {
        x: Math.min(d.x1, d.x2),
        y: Math.min(d.y1, d.y2),
        w: Math.max(1, Math.abs(d.x2 - d.x1)),
        h: Math.max(1, Math.abs(d.y2 - d.y1))
      };
      this._quadTree.insert({ boundary, data: { type: 'door', segment: d } });
    });
  }

  _syncECSWorld() {
    if (!this._ecsWorld) return;
    this._ecsWorld.entities.clear();
    
    const tokens = this._tokens.getAllTokens();
    tokens.forEach(t => {
      const entityId = this._ecsWorld.createEntity(t.id);
      
      this._ecsWorld.addComponent(entityId, new Position(t.x, t.y, 0));
      this._ecsWorld.addComponent(entityId, new Vision(t.visionRange, t.darkvision, 360, 0));
      this._ecsWorld.addComponent(entityId, new Health(t.hp.current, t.hp.max, t.ac, t.speed));
      
      const cs = new CombatState(t.initiative);
      cs.isCurrentTurn = t.isCurrentTurn;
      cs.movedFt = t.movedFt;
      this._ecsWorld.addComponent(entityId, cs);
      
      if (t.lightRadius > 0) {
        this._ecsWorld.addComponent(entityId, new Light(t.lightRadius, '#ffddaa', 0.95, 360, true));
      }
    });

    // Run systems update
    this._ecsWorld.update(16);
  }

  _sync() {
    this._updateQuadTree();
    this._syncECSWorld();
    this.requestRender();
    
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => {
      TOME.store.update(s=>{
        const mapData = {
          grid: this._grid.serialize(),
          tokens: this._tokens.serialize(),
          fog: this._fog?.serialize(),
          effects: this._effects?.serialize(),
          mapUrl: this._mapUrl,
          contributions: this._contributions || {},
          elements: this._mapElements,
          lights: this._mapLights,
          gridType: this._gridType,
          theme: this._mapTheme,
          showGrid: this._showGrid,
          timeOfDayMode: this._timeOfDayMode,
          weather: this._weather,
          maxMonsters: this._maxMonsters
        };
        // Use JSON.parse(JSON.stringify) to strip any Proxies before storing or broadcasting
        const cleanData = JSON.parse(JSON.stringify(mapData));
        s.tacticalMap = cleanData;
        s.playerMapData = cleanData;
        s.currentMap = this._mapUrl;
      });
    }, 400);

    if (this._channel) {
      try {
        const payload = {
          type: 'MAP_UPDATE',
          grid: this._grid.serialize(),
          tokens: this._tokens.serialize(),
          fog: this._fog?.serialize(),
          effects: this._effects?.serialize(),
          mapUrl: this._mapUrl,
          elements: this._mapElements,
          lights: this._mapLights,
          gridType: this._gridType,
          theme: this._mapTheme,
          showGrid: this._showGrid,
          timeOfDayMode: this._timeOfDayMode,
          weather: this._weather,
          maxMonsters: this._maxMonsters
        };
        this._channel.postMessage(JSON.parse(JSON.stringify(payload)));
      } catch (err) {
        console.error('Failed to sync map to broadcast channel:', err);
      }
    }
  }

  _syncDelta(deltaType, data) {
    if (this._channel) {
      try {
        this._channel.postMessage({ type: 'DELTA_UPDATE', deltaType, data });
      } catch(e) {
        console.error('Failed to send delta via broadcast channel:', e);
      }
    }
    
    if (window.socket && window.socketConnected && TOME.store.state.activeSession) {
      window.socket.emit('delta_update', {
        mesaId: TOME.store.state.activeSession,
        deltaType,
        data
      });
    }
  }

  _broadcastCombat() {
    if (this._channel) {
      try {
        const payload = {
          type: 'COMBAT_UPDATE',
          state: {
            combatActive: this.store.state.combatActive,
            initiativeOrder: this.store.state.initiativeOrder,
            initiativeIndex: this.store.state.initiativeIndex,
            combatRound: this.store.state.combatRound || 1
          }
        };
        this._channel.postMessage(JSON.parse(JSON.stringify(payload)));
      } catch (err) {
        console.error('Failed to broadcast combat:', err);
      }
    }
  }

  unmount() {
    if(this._animId) cancelAnimationFrame(this._animId);
    if(this._refPanel) this._refPanel.unmount();
    window.removeEventListener('tome-summon-monster', this._onSummonEvent);
    super.unmount?.();
  }

  _compressImage(base64Str, maxWidth = 1600, maxHeight = 1600, quality = 0.75) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/webp', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  }

}
