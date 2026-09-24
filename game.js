(() => {
  'use strict';

  const GRID_SIZE = 4;
  const STARTING_HP = 34;
  const BASE_ACTION_POINTS = 3;
  const HAND_SIZE = 5;
  const MAX_HAND_SIZE = 6;
  const COUNTER_BONUS = 3;
  const ATTACK_GUARD_BONUS = 2;
  const ROOMS = [
    { type: 'enemy', enemy: 'scout' },
    { type: 'enemy', enemy: 'bulwark' },
    { type: 'event', event: 'salvage' },
    { type: 'enemy', enemy: 'duelist' },
    { type: 'enemy', enemy: 'breaker' },
    { type: 'event', event: 'waystation' },
    { type: 'enemy', enemy: 'saboteur' },
    { type: 'enemy', enemy: 'hound' },
    { type: 'event', event: 'vault' },
    { type: 'event', event: 'signal' },
    { type: 'enemy', enemy: 'boss' },
  ];
  const RACES = {
    ember: { name: '烬裔', glyph: '✦', skill: 'presence', skillName: '气势', modifier: 3, description: '气势检定 +3；每场战斗首次攻击 +2 伤害。' },
    stone: { name: '岩裔', glyph: '⬡', skill: 'endurance', skillName: '耐力', modifier: 3, description: '耐力检定 +3；每场战斗首次受伤 -3。' },
    tinker: { name: '机巧民', glyph: '⌘', skill: 'craft', skillName: '机巧', modifier: 3, description: '机巧检定 +3；每场战斗起手多抽 1 张。' },
  };
  const GEAR = {
    edge: { name: '锋刃', short: '刃', shape: [[0, 0], [0, 1]], description: '攻击牌伤害 +2', attack: 2 },
    charm: { name: '护符', short: '盾', shape: [[0, 0], [1, 0]], description: '格挡牌护甲 +2', block: 2 },
    battery: { name: '蓄能器', short: '能', shape: [[0, 0]], description: '每回合行动点 +1', action: 1 },
    counter: { name: '回响棱镜', short: '响', shape: [[0, 0], [1, 0], [1, 1]], description: '格挡连携伤害 +2', counter: 2 },
    medkit: { name: '生命模块', short: '愈', shape: [[0, 0]], description: '获得时最大生命 +3，并恢复 3 点', health: 3 },
    scope: { name: '鹰眼镜片', short: '眼', shape: [[0, 0], [0, 1], [0, 2]], description: '每回合第一张攻击 +3 伤害', firstAttack: 3 },
    thorns: { name: '荆棘甲片', short: '棘', shape: [[0, 0], [1, 0]], description: '完全格挡时反伤敌人 3 点', reflect: 3 },
    prism: { name: '均衡核心', short: '衡', shape: [[0, 0], [0, 1], [1, 1]], description: '攻击与格挡各 +1', attack: 1, block: 1 },
  };
  const ENEMIES = {
    scout: {
      name: '荒径斥候', hp: 24, shield: 0, mechanic: 'scout',
      intents: [{ type: 'attack', damage: 5 }, { type: 'attack', damage: 7 }],
      status: '攻击在 5 点与 7 点之间交替。',
    },
    bulwark: {
      name: '壁垒搬运工', hp: 28, shield: 4, mechanic: 'bulwark',
      intents: [{ type: 'guard', shield: 5 }, { type: 'attack', damage: 6 }, { type: 'attack', damage: 8 }],
      status: '开场有护盾；蓄力时会再获得护盾。',
    },
    duelist: {
      name: '镜面决斗者 · 精英', hp: 30, shield: 0, mechanic: 'duelist', counter: 1,
      intents: [{ type: 'attack', damage: 6 }, { type: 'pierce', damage: 8, pierce: 3 }],
      status: '每打出一张攻击牌，受到 1 点反击伤害。',
    },
    breaker: {
      name: '裂甲重锤手', hp: 30, shield: 0, mechanic: 'breaker',
      intents: [{ type: 'attack', damage: 6 }, { type: 'pierce', damage: 10, pierce: 4 }],
      status: '每两回合发动一次破甲重击。',
    },
    saboteur: {
      name: '齿轮窃贼', hp: 30, shield: 0, mechanic: 'saboteur',
      intents: [{ type: 'attack', damage: 6 }, { type: 'jam', damage: 7, jam: 1 }],
      status: '每两回合干扰你的行动点，使下回合少 1 点。',
    },
    hound: {
      name: '余烬狂犬', hp: 32, shield: 0, mechanic: 'berserk',
      intents: [{ type: 'attack', damage: 5 }, { type: 'fury', damage: 8 }, { type: 'attack', damage: 6 }, { type: 'fury', damage: 8 }],
      status: '狂怒重击后，后续狂怒伤害永久 +2。',
    },
    boss: {
      name: '铸炉守卫 · Boss', hp: 40, shield: 6, mechanic: 'boss',
      intents: [
        { type: 'attack', damage: 7 },
        { type: 'pierce', damage: 10, pierce: 3 },
        { type: 'guard', shield: 8 },
        { type: 'fury', damage: 13 },
      ],
      status: '循环攻击、破甲与架势；狂怒重锤每次增强。',
    },
  };
  const CARD_LIBRARY = {
    strike: { name: '轻击', kind: 'attack', cost: 1, amount: 5, description: '造成伤害。' },
    guard: { name: '格挡', kind: 'block', cost: 1, amount: 5, description: '获得护甲。' },
    heavy: { name: '重击', kind: 'attack', cost: 2, amount: 10, description: '造成较高伤害。' },
    disarm: { name: '缴械', kind: 'weaken', cost: 1, amount: 4, description: '敌人本次攻击伤害 -4。' },
    quick: { name: '迅捷一击', kind: 'attack', cost: 0, amount: 4, description: '0 费攻击。' },
    pierce: { name: '穿甲刺', kind: 'attack', cost: 2, amount: 12, pierce: 6, description: '忽略最多 6 点敌方护盾。' },
    fortify: { name: '坚壁', kind: 'block', cost: 2, amount: 8, description: '获得大量护甲。' },
    cycle: { name: '战术换手', kind: 'draw', cost: 2, amount: 2, description: '抽 2 张牌。' },
    mend: { name: '急救贴片', kind: 'heal', cost: 1, amount: 4, description: '恢复 4 点生命。' },
    sweep: { name: '横扫', kind: 'attack', cost: 1, amount: 4, weaken: 2, description: '造成伤害，并令敌人攻击 -2。' },
  };
  const STARTER_CARD_IDS = ['strike', 'strike', 'strike', 'guard', 'guard', 'heavy', 'disarm'];
  const ART_IDS = { strike: 'card-strike', guard: 'card-guard', heavy: 'card-heavy', disarm: 'card-disarm', quick: 'card-quick', pierce: 'card-pierce', fortify: 'card-fortify', cycle: 'card-cycle', mend: 'card-mend', sweep: 'card-sweep', edge: 'gear-edge', charm: 'gear-charm', battery: 'gear-battery', counter: 'gear-counter', medkit: 'gear-medkit', scope: 'gear-scope', thorns: 'gear-thorns', prism: 'gear-prism' };
  const ENEMY_ART = { scout: 'enemy-scout', bulwark: 'enemy-bulwark', duelist: 'enemy-duelist', breaker: 'enemy-breaker', saboteur: 'enemy-saboteur', hound: 'enemy-berserk', boss: 'enemy-boss' };
  const REWARDS = [
    { id: 'edge', kind: 'gear', name: '锋刃', description: GEAR.edge.description },
    { id: 'charm', kind: 'gear', name: '护符', description: GEAR.charm.description },
    { id: 'battery', kind: 'gear', name: '蓄能器', description: GEAR.battery.description },
    { id: 'counter', kind: 'gear', name: '回响棱镜', description: GEAR.counter.description },
    { id: 'medkit', kind: 'gear', name: '生命模块', description: GEAR.medkit.description },
    { id: 'scope', kind: 'gear', name: '鹰眼镜片', description: GEAR.scope.description },
    { id: 'thorns', kind: 'gear', name: '荆棘甲片', description: GEAR.thorns.description },
    { id: 'prism', kind: 'gear', name: '均衡核心', description: GEAR.prism.description },
    { id: 'attack', kind: 'upgrade', stat: 'attack', amount: 2, name: '磨砺刀锋', description: '本局攻击牌伤害 +2' },
    { id: 'block', kind: 'upgrade', stat: 'block', amount: 2, name: '加固护甲', description: '本局格挡牌护甲 +2' },
    { id: 'counterUpgrade', kind: 'upgrade', stat: 'counter', amount: 2, name: '反击训练', description: '格挡连携伤害 +2' },
    { id: 'ration', kind: 'heal', name: '急救补给', description: '最大生命 +3，并恢复 3 点生命' },
    { id: 'quick', kind: 'card', card: 'quick', name: '迅捷一击', description: '加入一张 0 费、造成 4 点伤害的牌' },
    { id: 'pierce', kind: 'card', card: 'pierce', name: '穿甲刺', description: '加入一张能穿透敌方护盾的攻击牌' },
    { id: 'fortify', kind: 'card', card: 'fortify', name: '坚壁', description: '加入一张获得 8 点护甲的牌' },
    { id: 'cycle', kind: 'card', card: 'cycle', name: '战术换手', description: '加入一张抽 2 张牌的循环牌' },
    { id: 'mend', kind: 'card', card: 'mend', name: '急救贴片', description: '加入一张恢复生命的牌' },
    { id: 'sweep', kind: 'card', card: 'sweep', name: '横扫', description: '加入一张附带削弱的攻击牌' },
  ];
  const EVENTS = {
    salvage: {
      title: '塌陷的补给车',
      copy: '车体卡在岩缝里，里面还有可用物资。你有时间带走一件。',
      choices: [
        { name: '应急医疗包', description: '恢复 7 点生命。', action: 'heal', amount: 7 },
        { name: '拆下刃口', description: '本局攻击牌伤害 +1。', action: 'upgrade', stat: 'attack', amount: 1 },
        { name: '翻找遗落卡牌', description: '从 3 张牌中选 1 张加入牌组。', action: 'draft' },
      ],
    },
    waystation: {
      title: '荒径修理站',
      copy: '一台旧修理机还亮着指示灯。你可以修复身体、牌组或装备。',
      choices: [
        { name: '休整', description: '恢复 8 点生命。', action: 'heal', amount: 8 },
        { name: '精简牌组', description: '移除一张牌，让循环更快。', action: 'remove' },
        { name: '扩容电池', description: '最大生命 +3，并恢复 3 点生命。', action: 'maxHp', amount: 3 },
      ],
    },
    vault: {
      title: '封锁的旧军械库',
      copy: '门后的铸炉能源仍在运行。选择一种方法尝试打开它；专长会给检定带来加值。',
      choices: [
        { name: '强行撬开', description: '耐力检定 · DC 14', action: 'check', stat: 'endurance', dc: 14 },
        { name: '说服守门构装体', description: '气势检定 · DC 14', action: 'check', stat: 'presence', dc: 14 },
        { name: '破解门锁', description: '机巧检定 · DC 14', action: 'check', stat: 'craft', dc: 14 },
      ],
    },
    signal: {
      title: '失联信号塔',
      copy: '塔顶的旧信标断断续续闪烁。你可以冒险重启它，或先整理补给。',
      choices: [
        { name: '重启信标', description: '恢复 5 点生命，并获得 +1 攻击强化。', action: 'signal' },
        { name: '翻找工具箱', description: '从三张战术牌中选一张加入牌组。', action: 'draft' },
        { name: '拆解旧电池', description: '最大生命 +2，并恢复 2 点生命。', action: 'maxHp', amount: 2 },
      ],
    },
  };

  const $ = (selector) => document.querySelector(selector);
  const loadout = $('#loadout');
  const combat = $('#combat');
  const loadoutGrid = $('#loadout-grid');
  const combatGrid = $('#combat-grid');
  const loadoutInstruction = $('#loadout-instruction');
  const loadoutRotate = $('#loadout-rotate');
  const startButton = $('#start-run');
  const enemyName = $('#enemy-name');
  const cardGrid = $('#card-grid');
  const playerHpLabel = $('#player-hp');
  const playerHealth = $('#player-health');
  const playerBlock = $('#player-block');
  const enemyHpLabel = $('#enemy-hp');
  const enemyHealth = $('#enemy-health');
  const enemyStatus = $('#enemy-status');
  const enemyIntent = $('#enemy-intent');
  const actionPointsLabel = $('#action-points');
  const deckCountLabel = $('#deck-count');
  const turnLabel = $('#turn-label');
  const runProgress = $('#run-progress');
  const gearEffects = $('#gear-effects');
  const endTurnButton = $('#end-turn');
  const feedback = $('#feedback');
  const overlay = $('#result-overlay');
  const resultTitle = $('#result-title');
  const resultCopy = $('#result-copy');
  const resultButton = $('#result-button');
  const resultActions = $('#result-actions');
  const rewardOptions = $('#reward-options');
  const eventBack = $('#event-back');
  const dicePanel = $('#dice-panel');
  const dieFace = $('#die-face');
  const diceCheckName = $('#dice-check-name');
  const diceBreakdown = $('#dice-breakdown');
  const diceOutcome = $('#dice-outcome');
  const rollDieButton = $('#roll-die');
  const diceContinueButton = $('#dice-continue');
  const raceAbilityLabel = $('#race-ability');
  const handDrawCount = $('#hand-draw-count');
  const enemyIllustration = $('#enemy-illustration');
  const soundToggle = $('#sound-toggle');
  const placementDone = $('#placement-done');
  const placementPanel = $('#placement-panel');
  const placementName = $('#placement-name');
  const placementDescription = $('#placement-description');
  const placementHint = $('#placement-hint');
  const placementGrid = $('#placement-grid');
  const placementRotate = $('#placement-rotate');
  const placementSkip = $('#placement-skip');
  const changeLoadout = $('#change-loadout');

  let board = emptyBoard();
  let items = [];
  let selectedStarter = null;
  let selectedRace = null;
  let starterPlaced = false;
  let starterRotation = 0;
  let nextItemId = 1;
  let nextCardUid = 1;
  let playerHp = STARTING_HP;
  let playerMaxHp = STARTING_HP;
  let enemyHp = 0;
  let enemyShield = 0;
  let enemyRage = 0;
  let block = 0;
  let actionPoints = BASE_ACTION_POINTS;
  let turn = 1;
  let roomIndex = 0;
  let encounter = null;
  let used = new Set();
  let ended = true;
  let upgrades = { attack: 0, block: 0, counter: 0 };
  let runDeck = [];
  let drawPile = [];
  let hand = [];
  let discardPile = [];
  let counterReady = false;
  let guardComboReady = false;
  let attacksThisTurn = 0;
  let enemyWeak = 0;
  let actionPenalty = 0;
  let pendingActionPenalty = 0;
  let pendingReward = null;
  let placementRotation = 0;
  let movingItem = null;
  let rewardPlaced = false;
  let previewCell = -1;
  let soundEnabled = (() => { try { return localStorage.getItem('card-case-sound') !== 'off'; } catch { return true; } })();
  let audioContext = null;
  let currentEvent = null;
  let currentCheck = null;
  let raceWardReady = false;
  let raceFirstAttackReady = false;

  function emptyBoard() { return Array(GRID_SIZE * GRID_SIZE).fill(null); }
  function art(symbol, className = '') { return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="#${symbol}"></use></svg>`; }
  function playSound(kind) {
    if (!soundEnabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext ||= new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const notes = { card: [440, 620], damage: [180, 95], block: [280, 420], gear: [330, 520, 740], reward: [520, 680], turn: [260, 340] }[kind] || [440];
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = kind === 'damage' ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.045);
      gain.gain.setValueAtTime(0.0001, now + index * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.055, now + index * 0.045 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.045 + 0.13);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now + index * 0.045);
      oscillator.stop(now + index * 0.045 + 0.14);
    });
  }
  function currentRoom() { return ROOMS[roomIndex]; }
  function currentIntent() { return encounter.intents[(turn - 1) % encounter.intents.length]; }

  function rotatedShape(gearId, rotation) {
    let cells = GEAR[gearId].shape.map(([r, c]) => [r, c]);
    for (let n = 0; n < rotation % 4; n += 1) cells = cells.map(([r, c]) => [c, -r]);
    const minR = Math.min(...cells.map(([r]) => r));
    const minC = Math.min(...cells.map(([, c]) => c));
    return cells.map(([r, c]) => [r - minR, c - minC]);
  }

  function placementCells(gearId, row, col, rotation) {
    const shape = rotatedShape(gearId, rotation);
    const cells = shape.map(([r, c]) => [row + r, col + c]);
    if (cells.some(([r, c]) => r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE)) return null;
    const indices = cells.map(([r, c]) => r * GRID_SIZE + c);
    if (indices.some(index => board[index] !== null)) return null;
    return indices;
  }

  function firstValidAnchor(gearId, rotation) {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (placementCells(gearId, row, col, rotation)) return row * GRID_SIZE + col;
      }
    }
    return -1;
  }

  function showLoadoutPreview(anchor = 0) {
    loadoutGrid.querySelectorAll('.placement-preview, .placement-invalid').forEach(cell => cell.classList.remove('placement-preview', 'placement-invalid'));
    if (!selectedStarter || starterPlaced) return;
    const row = Math.floor(anchor / GRID_SIZE);
    const col = anchor % GRID_SIZE;
    const shape = rotatedShape(selectedStarter, starterRotation);
    const valid = shape.every(([r, c]) => row + r < GRID_SIZE && col + c < GRID_SIZE && board[(row + r) * GRID_SIZE + col + c] === null);
    for (const [r, c] of shape) {
      if (row + r < 0 || col + c < 0 || row + r >= GRID_SIZE || col + c >= GRID_SIZE) continue;
      loadoutGrid.querySelector(`[data-index="${(row + r) * GRID_SIZE + col + c}"]`)?.classList.add(valid ? 'placement-preview' : 'placement-invalid');
    }
  }

  function makeGear(gearId, cells, rotation = 0) { return { uid: nextItemId++, gearId, cells, rotation }; }

  function gearAnchor(item) {
    const occupied = new Set(item.cells);
    const shape = rotatedShape(item.gearId, item.rotation);
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const coords = shape.map(([r, c]) => [row + r, col + c]);
        if (coords.some(([r, c]) => r >= GRID_SIZE || c >= GRID_SIZE)) continue;
        const cells = coords.map(([r, c]) => r * GRID_SIZE + c);
        if (cells.every(index => occupied.has(index)) && cells.length === occupied.size) return row * GRID_SIZE + col;
      }
    }
    return -1;
  }

  function placeGear(gearId, row, col, rotation) {
    const cells = placementCells(gearId, row, col, rotation);
    if (!cells) return false;
    const item = makeGear(gearId, cells, rotation);
    items.push(item);
    for (const index of cells) board[index] = item.uid;
    return true;
  }

  function getStats() {
    const stats = { attack: 0, block: 0, counter: 0, action: 0, firstAttack: 0, reflect: 0, resonance: 0 };
    for (const item of items) {
      const gear = GEAR[item.gearId];
      for (const key of ['attack', 'block', 'counter', 'action', 'firstAttack', 'reflect']) stats[key] += gear[key] || 0;
    }
    const pairs = new Set();
    for (let index = 0; index < board.length; index += 1) {
      const uid = board[index];
      if (uid === null) continue;
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      for (const [r, c] of [[row + 1, col], [row, col + 1]]) {
        if (r >= GRID_SIZE || c >= GRID_SIZE) continue;
        const neighbor = board[r * GRID_SIZE + c];
        if (neighbor !== null && neighbor !== uid) pairs.add([Math.min(uid, neighbor), Math.max(uid, neighbor)].join(':'));
      }
    }
    stats.resonance = Math.min(2, pairs.size);
    stats.attack += stats.resonance;
    stats.block += stats.resonance;
    return stats;
  }

  function cardAmount(card) {
    const stats = getStats();
    if (card.kind === 'weaken' || card.kind === 'draw' || card.kind === 'heal') return card.amount;
    let amount = card.amount + (card.kind === 'attack' ? stats.attack + upgrades.attack : stats.block + upgrades.block);
    if (card.kind === 'attack' && counterReady) amount += COUNTER_BONUS + upgrades.counter + stats.counter;
    if (card.kind === 'attack' && attacksThisTurn === 0) amount += stats.firstAttack + (raceFirstAttackReady ? 2 : 0);
    if (card.kind === 'block' && guardComboReady) amount += ATTACK_GUARD_BONUS;
    return amount;
  }

  function makeCard(cardId) { return { ...CARD_LIBRARY[cardId], cardId, uid: nextCardUid++ }; }

  function shuffle(cards) {
    const result = [...cards];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function renderBoard(container, interactive, onCellClick) {
    container.replaceChildren();
    for (let index = 0; index < board.length; index += 1) {
      const uid = board[index];
      const item = items.find(entry => entry.uid === uid);
      const cell = document.createElement(interactive ? 'button' : 'div');
      if (interactive) cell.type = 'button';
      cell.className = `board-cell${uid === null ? '' : ` occupied gear-color-${(uid - 1) % 8}`}`;
      cell.dataset.index = String(index);
      if (item) {
        cell.innerHTML = `${art(ART_IDS[item.gearId], 'gear-cell-art')}<span>${GEAR[item.gearId].short}</span>`;
        cell.title = `${GEAR[item.gearId].name}：${GEAR[item.gearId].description}`;
        if (interactive) cell.setAttribute('aria-label', `${GEAR[item.gearId].name}，${GEAR[item.gearId].description}；点击移动`);
      } else cell.setAttribute('aria-label', `空格 ${index + 1}`);
      if (interactive) cell.addEventListener('click', () => onCellClick(index, uid));
      container.append(cell);
    }
  }

  function renderLoadout() {
    renderBoard(loadoutGrid, Boolean(selectedStarter) && !starterPlaced, placeStarter);
    showLoadoutPreview();
    startButton.disabled = !starterPlaced || !selectedRace;
    loadoutRotate.disabled = !selectedStarter;
    loadoutInstruction.textContent = !selectedRace
      ? '先选择一种种族'
      : !selectedStarter ? '选择一件起始装备'
        : starterPlaced ? '配置完成；按 R 或旋转键可调整。' : '点击空格摆放；按 R 或旋转键改变形状。';
    document.querySelectorAll('.race-option').forEach(button => {
      const selected = button.dataset.race === selectedRace;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('.starter-option').forEach(button => {
      const selected = button.dataset.gear === selectedStarter;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function placeStarter(index) {
    if (!selectedStarter || starterPlaced) return;
    if (placeGear(selectedStarter, Math.floor(index / GRID_SIZE), index % GRID_SIZE, starterRotation)) {
      starterPlaced = true;
      renderLoadout();
    } else loadoutInstruction.textContent = '这个位置放不下；按 R 旋转装备或选择其他空格。';
  }

  function enemyIntentText() {
    const intent = currentIntent();
    if (intent.type === 'guard') return `意图：架势 · 获得 ${intent.shield} 点护盾${enemyWeak ? `（下次攻击 -${enemyWeak}）` : ''}`;
    const damage = Math.max(0, intent.damage + (intent.type === 'fury' ? enemyRage : 0) - enemyWeak);
    const labels = { attack: '攻击', pierce: '破甲重击', jam: '干扰', fury: '狂怒重击' };
    const jamText = intent.jam ? `，下回合行动点 -${intent.jam}` : '';
    const weakText = enemyWeak ? `（削弱 -${enemyWeak}）` : '';
    return `意图：${labels[intent.type] || '攻击'} ${damage}${intent.type === 'pierce' ? `（穿透 ${intent.pierce}）` : ''}${jamText}${weakText}`;
  }

  function update() {
    const stats = getStats();
    const maxActions = Math.max(1, BASE_ACTION_POINTS + stats.action - actionPenalty);
    playerHpLabel.textContent = `${playerHp} / ${playerMaxHp}`;
    playerHealth.style.width = `${Math.max(0, playerHp / playerMaxHp) * 100}%`;
    playerBlock.textContent = `护甲 ${block}`;
    const race = selectedRace ? RACES[selectedRace] : null;
    raceAbilityLabel.textContent = race ? `${race.glyph} ${race.name} · ${race.description}` : '未选择种族';
    handDrawCount.textContent = String(HAND_SIZE + (selectedRace === 'tinker' && turn === 1 ? 1 : 0));
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.textContent = soundEnabled ? '音效：开' : '音效：关';
    const enemyArtId = encounter ? ENEMY_ART[encounter.mechanic] : null;
    const renderedEnemyArt = enemyIllustration.querySelector('use')?.getAttribute('href');
    if (renderedEnemyArt !== (enemyArtId ? `#${enemyArtId}` : null)) {
      enemyIllustration.innerHTML = enemyArtId ? art(enemyArtId, 'enemy-art') : '';
    }
    if (encounter) {
      enemyName.textContent = encounter.name;
      enemyHpLabel.textContent = `${enemyHp} / ${encounter.hp}`;
      enemyHealth.style.width = `${Math.max(0, enemyHp / encounter.hp) * 100}%`;
      enemyStatus.textContent = [`护盾 ${enemyShield}`, enemyRage ? `狂怒 +${enemyRage}` : '', encounter.status].filter(Boolean).join(' · ');
      enemyIntent.textContent = enemyIntentText();
    }
    actionPointsLabel.textContent = `${actionPoints} / ${maxActions}`;
    turnLabel.textContent = `回合 ${turn}`;
    runProgress.textContent = `房间 ${roomIndex + 1} / ${ROOMS.length}`;
    gearEffects.textContent = [
      stats.attack && `攻击 +${stats.attack}`, stats.block && `格挡 +${stats.block}`,
      stats.counter && `反击 +${stats.counter}`, stats.action && `行动 +${stats.action}`,
      stats.firstAttack && `首攻 +${stats.firstAttack}`, stats.reflect && `反伤 ${stats.reflect}`,
      stats.resonance && `共鸣 ${stats.resonance}`,
    ].filter(Boolean).join(' · ') || '无额外效果';
    deckCountLabel.textContent = `抽牌堆 ${drawPile.length} · 弃牌堆 ${discardPile.length} · 牌组 ${runDeck.length}`;
    combatGrid.setAttribute('aria-label', items.map(item => `${GEAR[item.gearId].name}：${GEAR[item.gearId].description}`).join('；') || '空装备板');
    endTurnButton.disabled = ended;
    renderBoard(combatGrid, false);
  }

  function renderCards() {
    cardGrid.replaceChildren();
    cardGrid.classList.toggle('full-hand', hand.length > 5);
    hand.forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `play-card ${card.kind}`;
      button.dataset.cardId = String(card.uid);
      button.dataset.cost = String(card.cost);
      button.dataset.kind = card.kind;
      button.innerHTML = `<span class="card-cost">${card.cost} AP <kbd>${index + 1}</kbd></span>${art(ART_IDS[card.cardId], 'card-art')}<strong class="card-name">${card.name}</strong><span class="card-effect"></span>`;
      button.addEventListener('click', () => playCard(card));
      const amount = cardAmount(card);
      const effect = card.kind === 'attack' ? `伤害 ${amount}${card.pierce ? ` · 穿盾 ${card.pierce}` : ''}`
        : card.kind === 'block' ? `护甲 ${amount}`
          : card.kind === 'weaken' ? `攻击 -${amount}`
            : card.kind === 'draw' ? `抽牌 ${amount}` : `治疗 ${amount}`;
      button.querySelector('.card-effect').textContent = effect;
      button.setAttribute('aria-label', `${index + 1}，${card.name}，费用 ${card.cost} 点行动，${card.description}`);
      button.disabled = ended || actionPoints < card.cost;
      cardGrid.append(button);
    });
    update();
  }

  function drawCards(amount) {
    let drawn = 0;
    while (drawn < amount && hand.length < MAX_HAND_SIZE) {
      if (drawPile.length === 0) {
        if (discardPile.length === 0) break;
        drawPile = shuffle(discardPile);
        discardPile = [];
      }
      const card = drawPile.pop();
      hand.push(card);
      drawn += 1;
    }
    return drawn;
  }

  function addCardToDeck(cardId) {
    runDeck.push(makeCard(cardId));
  }

  function removeCardFromDeck(uid) {
    runDeck = runDeck.filter(card => card.uid !== uid);
    drawPile = drawPile.filter(card => card.uid !== uid);
    hand = hand.filter(card => card.uid !== uid);
    discardPile = discardPile.filter(card => card.uid !== uid);
  }

  function showTerminalResult(won) {
    ended = true;
    resultTitle.textContent = won ? '穿越荒径 · 胜利' : '本局结束';
    resultCopy.textContent = won
      ? `击败全部敌人，剩余生命 ${playerHp} / ${playerMaxHp}。你的牌组与装备构筑经受住了考验。`
      : `在第 ${roomIndex + 1} 个房间落败。调整路线选择、牌组循环与装备摆放，再试一次。`;
    rewardOptions.hidden = true;
    rewardOptions.replaceChildren();
    eventBack.hidden = true;
    placementPanel.hidden = true;
    dicePanel.hidden = true;
    resultActions.hidden = false;
    resultButton.textContent = '重新构筑';
    overlay.hidden = false;
    renderCards();
    resultButton.focus();
  }

  function shuffledRewards() {
    const ownedGear = new Set(items.map(item => item.gearId));
    return shuffle(REWARDS.filter(reward => reward.kind !== 'gear' || !ownedGear.has(reward.id))).slice(0, 3);
  }

  function showChoices(title, copy, choices, onChoose) {
    resultTitle.textContent = title;
    resultCopy.textContent = copy;
    resultActions.hidden = true;
    placementPanel.hidden = true;
    dicePanel.hidden = true;
    eventBack.hidden = true;
    rewardOptions.replaceChildren();
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reward-option';
      const artId = ART_IDS[choice.id] || ART_IDS[choice.cardId];
      button.innerHTML = `<span class="choice-number">${index + 1}</span>${artId ? art(artId, 'reward-art') : ''}<strong>${choice.name}</strong><span>${choice.description}</span>`;
      button.addEventListener('click', () => onChoose(choice));
      rewardOptions.append(button);
    });
    rewardOptions.hidden = false;
    overlay.hidden = false;
    rewardOptions.querySelector('button')?.focus();
  }

  function showRewards() {
    ended = true;
    pendingReward = null;
    const choices = shuffledRewards();
    showChoices('选择一件战利品', `第 ${roomIndex + 1} 个房间胜利。生命 ${playerHp} / ${playerMaxHp}。`, choices, chooseReward);
  }

  function showEvent() {
    ended = true;
    currentEvent = EVENTS[currentRoom().event];
    renderEventChoices();
  }

  function renderEventChoices() {
    if (!currentEvent) return;
    const choices = currentEvent.choices
      .filter(choice => choice.action !== 'remove' || runDeck.length > 4)
      .map(choice => ({ ...choice }));
    showChoices(currentEvent.title, currentEvent.copy, choices, chooseEvent);
    eventBack.hidden = false;
    eventBack.textContent = '离开事件';
    eventBack.onclick = () => { currentEvent = null; advanceRoom(); };
  }

  function showCardDraft() {
    const ids = shuffle(['quick', 'pierce', 'fortify', 'cycle', 'mend', 'sweep']).slice(0, 3);
    const choices = ids.map(cardId => ({ cardId, name: CARD_LIBRARY[cardId].name, description: CARD_LIBRARY[cardId].description }));
    showChoices('翻找遗落卡牌', '选一张加入牌组，或跳过。', choices, choice => {
      addCardToDeck(choice.cardId);
      currentEvent = null;
      advanceRoom();
    });
    eventBack.hidden = false;
    eventBack.textContent = '跳过选牌';
    eventBack.onclick = () => { currentEvent = null; advanceRoom(); };
  }

  function showCardRemoval() {
    if (runDeck.length <= 4) {
      resultCopy.textContent = '牌组已足够精简，无法继续移除。';
      renderEventChoices();
      return;
    }
    const choices = runDeck.map(card => ({ uid: card.uid, name: `移除「${card.name}」`, description: `${card.cost} 行动点 · ${card.description}` }));
    showChoices('精简牌组', '选择一张永久移除的牌。牌组变薄后，更容易循环到关键牌。', choices, choice => {
      removeCardFromDeck(choice.uid);
      currentEvent = null;
      advanceRoom();
    });
    eventBack.hidden = false;
    eventBack.textContent = '返回事件';
    eventBack.onclick = renderEventChoices;
  }

  function advanceRoom() {
    roomIndex += 1;
    if (roomIndex >= ROOMS.length) {
      showTerminalResult(true);
      return;
    }
    const room = currentRoom();
    if (room.type === 'event') {
      combat.hidden = true;
      showEvent();
      return;
    }
    beginEncounter(room.enemy);
  }

  function chooseReward(reward) {
    if (reward.kind === 'gear') {
      pendingReward = reward;
      rewardPlaced = false;
      placementDone.hidden = true;
      placementDone.disabled = false;
      placementRotate.disabled = false;
      placementRotation = 0;
      previewCell = firstValidAnchor(reward.id, placementRotation);
      movingItem = null;
      resultTitle.textContent = '装配新装备';
      resultCopy.textContent = '先将新装备放在空位。放置后可整理旧装备，完成后继续。';
      placementName.textContent = reward.name;
      placementDescription.textContent = `${GEAR[reward.id].shape.length} 格 · ${reward.description}`;
      placementHint.textContent = '选择空位安装新装备；已占用位置不会选中旧装备。';
      placementSkip.textContent = '放弃这件装备';
      rewardOptions.hidden = true;
      placementPanel.hidden = false;
      resultActions.hidden = true;
      eventBack.hidden = true;
      renderPlacementBoard();
      return;
    }
    if (reward.kind === 'upgrade') upgrades[reward.stat] += reward.amount;
    if (reward.kind === 'heal') {
      playerMaxHp += 3;
      playerHp = Math.min(playerMaxHp, playerHp + 3);
    }
    if (reward.kind === 'card') addCardToDeck(reward.card);
    currentEvent = null;
    advanceRoom();
  }

  function chooseEvent(choice) {
    if (choice.action === 'heal') playerHp = Math.min(playerMaxHp, playerHp + choice.amount);
    if (choice.action === 'upgrade') upgrades[choice.stat] += choice.amount;
    if (choice.action === 'maxHp') {
      playerMaxHp += choice.amount;
      playerHp = Math.min(playerMaxHp, playerHp + choice.amount);
    }
    if (choice.action === 'signal') {
      playerHp = Math.min(playerMaxHp, playerHp + 5);
      upgrades.attack += 1;
    }
    update();
    if (choice.action === 'check') {
      ended = true;
      beginAbilityCheck(choice);
      return;
    }
    if (choice.action === 'draft') {
      showCardDraft();
      return;
    }
    if (choice.action === 'remove') {
      showCardRemoval();
      return;
    }
    currentEvent = null;
    advanceRoom();
  }

  function beginAbilityCheck(choice) {
    const race = RACES[selectedRace];
    const modifier = race.skill === choice.stat ? race.modifier : 0;
    currentCheck = { ...choice, modifier, roll: null, total: null, success: false };
    resultTitle.textContent = '命运检定';
    resultCopy.textContent = `${choice.name}。${race.name}的${race.skillName}专长${modifier ? `提供 +${modifier} 加值` : '对此检定没有专长加值'}。`;
    rewardOptions.hidden = true;
    placementPanel.hidden = true;
    resultActions.hidden = true;
    eventBack.hidden = true;
    dicePanel.hidden = false;
    dieFace.textContent = '20';
    dieFace.className = 'die-face';
    diceCheckName.textContent = `${race.skillName}检定 · ${choice.name}`;
    diceBreakdown.textContent = `d20 + ${modifier} · DC ${choice.dc}`;
    diceOutcome.textContent = '掷出 1 点会大失败，掷出 20 点会大成功。';
    rollDieButton.disabled = false;
    rollDieButton.hidden = false;
    diceContinueButton.hidden = true;
    overlay.hidden = false;
  }

  function rollAbilityCheck() {
    if (!currentCheck || currentCheck.roll !== null) return;
    rollDieButton.disabled = true;
    dieFace.classList.add('rolling');
    let frames = 0;
    const animation = window.setInterval(() => {
      dieFace.textContent = String(Math.floor(Math.random() * 20) + 1);
      frames += 1;
      if (frames < 10) return;
      window.clearInterval(animation);
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + currentCheck.modifier;
      currentCheck.roll = roll;
      currentCheck.total = total;
      currentCheck.success = roll === 20 || (roll !== 1 && total >= currentCheck.dc);
      dieFace.textContent = String(roll);
      dieFace.classList.remove('rolling');
      dieFace.classList.toggle('critical', roll === 20);
      dieFace.classList.toggle('failed', roll === 1);
      diceBreakdown.textContent = `${roll}（骰面） ${currentCheck.modifier >= 0 ? '+' : '−'} ${Math.abs(currentCheck.modifier)} = ${total} · DC ${currentCheck.dc}`;
      diceOutcome.textContent = roll === 20 ? '大成功 · 军械库的隐藏储藏也被你找到了。'
        : roll === 1 ? '大失败 · 陷阱被触发了。'
          : currentCheck.success ? '检定成功 · 门锁应声打开。'
            : '检定失败 · 门后的机关启动了。';
      rollDieButton.hidden = true;
      diceContinueButton.textContent = currentCheck.success ? '领取发现' : '承受后果';
      diceContinueButton.hidden = false;
      diceContinueButton.focus();
    }, 65);
  }

  function finishAbilityCheck() {
    if (!currentCheck) return;
    const check = currentCheck;
    dicePanel.hidden = true;
    if (check.success) {
      currentCheck = null;
      const choices = check.roll === 20
        ? [
            { name: '精密刃口', description: '本局攻击牌伤害 +2。', action: 'upgrade', stat: 'attack', amount: 2 },
            { name: '军医储藏', description: '最大生命 +4，并恢复 4 点生命。', action: 'maxHp', amount: 4 },
            { name: '战术图谱', description: '从三张牌中选一张加入牌组。', action: 'draft' },
          ]
        : [
            { name: '补给药剂', description: '恢复 6 点生命。', action: 'heal', amount: 6 },
            { name: '备用刃片', description: '本局攻击牌伤害 +1。', action: 'upgrade', stat: 'attack', amount: 1 },
            { name: '遗落战术牌', description: '从三张牌中选一张加入牌组。', action: 'draft' },
          ];
      showChoices(check.roll === 20 ? '大成功 · 隐藏宝藏' : '检定成功 · 军械库开启', '选择一件发现带走。', choices, applyCheckReward);
      return;
    }
    const loss = check.roll === 1 ? 7 : 4;
    playerHp = Math.max(1, playerHp - loss);
    update();
    currentCheck = null;
    resultTitle.textContent = check.roll === 1 ? '陷阱触发' : '检定失败';
    resultCopy.textContent = `机关击中了你，损失 ${loss} 点生命；远征仍可继续。`;
    rewardOptions.hidden = true;
    eventBack.hidden = true;
    resultActions.hidden = true;
    dicePanel.hidden = false;
    rollDieButton.hidden = true;
    diceContinueButton.textContent = '继续前进';
    diceContinueButton.hidden = false;
  }

  function applyCheckReward(choice) {
    if (choice.action === 'heal') playerHp = Math.min(playerMaxHp, playerHp + choice.amount);
    if (choice.action === 'upgrade') upgrades[choice.stat] += choice.amount;
    if (choice.action === 'maxHp') {
      playerMaxHp += choice.amount;
      playerHp = Math.min(playerMaxHp, playerHp + choice.amount);
    }
    update();
    if (choice.action === 'draft') {
      showCardDraft();
      return;
    }
    currentEvent = null;
    advanceRoom();
  }

  function renderPlacementBoard() {
    renderBoard(placementGrid, true, placeReward);
    if (previewCell >= 0) showPlacementPreview(previewCell);
  }

  function showPlacementPreview(index) {
    placementGrid.querySelectorAll('.placement-preview, .placement-invalid').forEach(entry => entry.classList.remove('placement-preview', 'placement-invalid'));
    if (!pendingReward || (rewardPlaced && !movingItem)) return;
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const gearId = movingItem ? movingItem.gearId : pendingReward.id;
    const shape = rotatedShape(gearId, placementRotation);
    const valid = shape.every(([r, c]) => row + r >= 0 && col + c >= 0 && row + r < GRID_SIZE && col + c < GRID_SIZE && board[(row + r) * GRID_SIZE + col + c] === null);
    for (const [r, c] of shape) {
      const targetRow = row + r;
      const targetCol = col + c;
      if (targetRow < 0 || targetCol < 0 || targetRow >= GRID_SIZE || targetCol >= GRID_SIZE) continue;
      placementGrid.querySelector(`[data-index="${targetRow * GRID_SIZE + targetCol}"]`)?.classList.add(valid ? 'placement-preview' : 'placement-invalid');
    }
  }

  function placeReward(index, uid) {
    if (!pendingReward) return;
    if (movingItem && uid !== null) {
      placementHint.textContent = '移动中的装备只能放到空位；其他装备不会被选中。';
      return;
    }
    if (rewardPlaced && !movingItem && uid === null) {
      placementHint.textContent = '新装备已经安装；点已装装备可移动，或点完成整理继续。';
      return;
    }
    if (rewardPlaced && !movingItem && uid !== null) {
      movingItem = items.find(item => item.uid === uid) || null;
      if (!movingItem) return;
      for (const cell of movingItem.cells) board[cell] = null;
      placementRotation = movingItem.rotation;
      previewCell = gearAnchor(movingItem);
      placementHint.textContent = `移动「${GEAR[movingItem.gearId].name}」：选择新位置，可旋转。`;
      placementSkip.textContent = '取消移动';
      placementDone.disabled = true;
      placementRotate.disabled = false;
      renderPlacementBoard();
      update();
      return;
    }
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    if (movingItem) {
      const shape = rotatedShape(movingItem.gearId, placementRotation);
      const fits = shape.every(([r, c]) => row + r >= 0 && col + c >= 0 && row + r < GRID_SIZE && col + c < GRID_SIZE && board[(row + r) * GRID_SIZE + col + c] === null);
      if (!fits) {
        placementHint.textContent = '这个位置放不下或与其他装备重叠；旋转或选择空位。';
        return;
      }
      movingItem.cells = shape.map(([r, c]) => (row + r) * GRID_SIZE + col + c);
      movingItem.rotation = placementRotation;
      for (const cell of movingItem.cells) board[cell] = movingItem.uid;
      movingItem = null;
      placementRotation = 0;
      previewCell = -1;
      placementHint.textContent = '装备已重新摆放。';
      playSound('gear');
      placementSkip.textContent = '跳过整理';
      placementDone.disabled = false;
      placementRotate.disabled = true;
      renderPlacementBoard();
      update();
      return;
    }
    const gearId = pendingReward.id;
    if (!placeGear(gearId, row, col, placementRotation)) {
      placementHint.textContent = '位置超出边界或与其他装备重叠；请选空位。';
      return;
    }
    if (gearId === 'medkit') {
      playerMaxHp += GEAR.medkit.health;
      playerHp = Math.min(playerMaxHp, playerHp + GEAR.medkit.health);
    }
    rewardPlaced = true;
    placementRotation = 0;
    previewCell = -1;
    placementHint.textContent = '新装备已放置；现在可点旧装备调整位置。';
    placementDone.hidden = false;
    placementSkip.textContent = '跳过整理';
    placementRotate.disabled = true;
    playSound('gear');
    renderPlacementBoard();
    update();
  }

  function finishGearPlacement() {
    if (!pendingReward || !rewardPlaced || movingItem) return;
    pendingReward = null;
    rewardPlaced = false;
    placementDone.hidden = true;
    placementPanel.hidden = true;
    currentEvent = null;
    advanceRoom();
  }

  function finish(won) {
    ended = true;
    if (!won) {
      showTerminalResult(false);
      return;
    }
    if (roomIndex === ROOMS.length - 1) {
      showTerminalResult(true);
      return;
    }
    showRewards();
  }

  function playCard(card) {
    if (ended || !hand.some(entry => entry.uid === card.uid) || actionPoints < card.cost) return;
    actionPoints -= card.cost;
    playSound('card');
    hand = hand.filter(entry => entry.uid !== card.uid);
    discardPile.push(card);
    if (card.kind === 'attack') {
      const stats = getStats();
      const comboBonus = counterReady ? COUNTER_BONUS + upgrades.counter + stats.counter : 0;
      const amount = cardAmount(card);
      counterReady = false;
      guardComboReady = true;
      attacksThisTurn += 1;
      raceFirstAttackReady = false;
      const piercingDamage = Math.min(card.pierce || 0, amount);
      const shieldDamage = Math.min(enemyShield, amount - piercingDamage);
      enemyShield -= shieldDamage;
      const healthDamage = piercingDamage + Math.max(0, amount - piercingDamage - shieldDamage);
      enemyHp = Math.max(0, enemyHp - healthDamage);
      let retaliated = 0;
      if (enemyHp > 0 && encounter.counter) {
        retaliated = encounter.counter;
        playerHp = Math.max(0, playerHp - retaliated);
      }
      if (card.weaken) enemyWeak = Math.max(enemyWeak, card.weaken);
      if (healthDamage || shieldDamage || retaliated) playSound('damage');
      feedback.textContent = `${card.name}造成 ${healthDamage} 点伤害${piercingDamage ? `（穿透直伤 ${piercingDamage}）` : ''}${shieldDamage ? `，击破 ${shieldDamage} 点护盾` : ''}${comboBonus ? `，含反击连携 +${comboBonus}` : ''}${retaliated ? `；敌人反击 ${retaliated}` : ''}${card.weaken ? `；敌方攻击 -${card.weaken}` : ''}。`;
      renderCards();
      if (playerHp === 0) finish(false);
      else if (enemyHp === 0) finish(true);
      return;
    }
    if (card.kind === 'block') {
      const amount = cardAmount(card);
      const guardBonus = guardComboReady ? ATTACK_GUARD_BONUS : 0;
      guardComboReady = false;
      block += amount;
      playSound('block');
      counterReady = true;
      feedback.textContent = `${card.name}获得 ${amount} 点护甲${guardBonus ? `（含攻击连携 +${guardBonus}）` : ''}；下一张攻击获得反击加成。`;
      renderCards();
      return;
    }
    if (card.kind === 'weaken') {
      enemyWeak = Math.max(enemyWeak, card.amount);
      feedback.textContent = `${card.name}令敌人下次攻击降低 ${card.amount} 点。`;
    } else if (card.kind === 'draw') {
      const drawn = drawCards(card.amount);
      feedback.textContent = `${card.name}抽到 ${drawn} 张牌。`;
    } else if (card.kind === 'heal') {
      const healed = Math.min(card.amount, playerMaxHp - playerHp);
      playerHp += healed;
      feedback.textContent = `${card.name}恢复 ${healed} 点生命。`;
    }
    renderCards();
  }

  function cleanupHand() {
    discardPile.push(...hand);
    hand = [];
  }

  function endTurn() {
    if (ended) return;
    playSound('turn');
    const intent = currentIntent();
    const weakness = enemyWeak;
    let incoming = 0;
    let piercing = 0;
    let blocked = 0;
    let damage = 0;
    if (intent.type === 'guard') {
      enemyShield += intent.shield;
      feedback.textContent = `${encounter.name}架起护盾，获得 ${intent.shield} 点护盾。`;
    } else {
      enemyWeak = 0;
      incoming = Math.max(0, intent.damage + (intent.type === 'fury' ? enemyRage : 0) - weakness);
      piercing = intent.type === 'pierce' ? Math.min(intent.pierce, incoming) : 0;
      blocked = Math.min(block, Math.max(0, incoming - piercing));
      damage = incoming - blocked;
      let prevented = 0;
      if (damage > 0 && raceWardReady) {
        prevented = Math.min(3, damage);
        damage -= prevented;
        raceWardReady = false;
      }
      playerHp = Math.max(0, playerHp - damage);
      feedback.textContent = `${encounter.name}攻击 ${incoming} 点${piercing ? `（破甲 ${piercing}）` : ''}，护甲抵消 ${blocked} 点${prevented ? `；岩裔坚韧减少 ${prevented} 点伤害` : ''}。`;
    }
    if (intent.jam) pendingActionPenalty = intent.jam;
    if (intent.type === 'fury') enemyRage += 2;
    if (playerHp <= 0) {
      playSound('damage');
      cleanupHand();
      update();
      finish(false);
      return;
    }
    const reflect = intent.type !== 'guard' && incoming > 0 && damage === 0 ? getStats().reflect : 0;
    if (damage || reflect) playSound('damage');
    else if (blocked) playSound('block');
    if (reflect) {
      enemyHp = Math.max(0, enemyHp - reflect);
      feedback.textContent += `荆棘反伤 ${reflect} 点。`;
    }
    if (enemyHp <= 0) {
      cleanupHand();
      update();
      finish(true);
      return;
    }
    cleanupHand();
    turn += 1;
    block = 0;
    counterReady = false;
    guardComboReady = false;
    attacksThisTurn = 0;
    actionPenalty = pendingActionPenalty;
    pendingActionPenalty = 0;
    actionPoints = Math.max(1, BASE_ACTION_POINTS + getStats().action - actionPenalty);
    drawPile = drawPile.length ? drawPile : [];
    drawCards(HAND_SIZE);
    used = new Set();
    renderCards();
  }

  function beginEncounter(enemyId) {
    encounter = ENEMIES[enemyId];
    enemyHp = encounter.hp;
    enemyShield = encounter.shield || 0;
    enemyRage = 0;
    block = 0;
    turn = 1;
    used = new Set();
    ended = false;
    counterReady = false;
    guardComboReady = false;
    attacksThisTurn = 0;
    enemyWeak = 0;
    actionPenalty = 0;
    pendingActionPenalty = 0;
    hand = [];
    discardPile = [];
    drawPile = shuffle(runDeck);
    actionPoints = BASE_ACTION_POINTS + getStats().action;
    drawCards(HAND_SIZE + (selectedRace === 'tinker' ? 1 : 0));
    raceWardReady = selectedRace === 'stone';
    raceFirstAttackReady = selectedRace === 'ember';
    combat.hidden = false;
    loadout.hidden = true;
    overlay.hidden = true;
    feedback.textContent = `${encounter.name}：${encounter.status}`;
    renderCards();
  }

  function startRun() {
    if (!selectedRace || !starterPlaced) return;
    playerMaxHp = STARTING_HP;
    playerHp = STARTING_HP;
    roomIndex = 0;
    nextCardUid = 1;
    upgrades = { attack: 0, block: 0, counter: 0 };
    runDeck = STARTER_CARD_IDS.map(makeCard);
    drawPile = [];
    hand = [];
    discardPile = [];
    currentEvent = null;
    currentCheck = null;
    raceWardReady = false;
    raceFirstAttackReady = false;
    const room = currentRoom();
    if (room.type === 'enemy') beginEncounter(room.enemy);
  }

  function resetLoadout() {
    currentCheck = null;
    dicePanel.hidden = true;
    board = emptyBoard();
    items = [];
    selectedStarter = null;
    selectedRace = null;
    starterPlaced = false;
    starterRotation = 0;
    pendingReward = null;
    movingItem = null;
    rewardPlaced = false;
    placementDone.hidden = true;
    currentEvent = null;
    overlay.hidden = true;
    combat.hidden = true;
    loadout.hidden = false;
    renderLoadout();
  }

  function rotateStarter() {
    if (!selectedStarter) return;
    const nextRotation = (starterRotation + 1) % 4;
    if (!starterPlaced) {
      starterRotation = nextRotation;
      renderLoadout();
      return;
    }
    const item = items[0];
    const anchor = gearAnchor(item);
    const row = Math.floor(anchor / GRID_SIZE);
    const col = anchor % GRID_SIZE;
    for (const cell of item.cells) board[cell] = null;
    const cells = placementCells(item.gearId, row, col, nextRotation);
    if (!cells) {
      for (const cell of item.cells) board[cell] = item.uid;
      loadoutInstruction.textContent = '当前位置旋转后会超出边界；移动到其他空位再试。';
      return;
    }
    item.cells = cells;
    item.rotation = nextRotation;
    starterRotation = nextRotation;
    for (const cell of cells) board[cell] = item.uid;
    renderLoadout();
  }

  function rotateRewardGear() {
    if (rewardPlaced && !movingItem) return;
    placementRotation = (placementRotation + 1) % 4;
    if (pendingReward && !movingItem) previewCell = firstValidAnchor(pendingReward.id, placementRotation);
    placementHint.textContent = previewCell < 0
      ? '当前装备没有可用位置；旋转装备或放弃奖励。'
      : `已旋转 ${placementRotation} 次；绿色格为预览，选择空位放置。`;
    renderPlacementBoard();
  }

  document.querySelectorAll('.race-option').forEach(button => {
    button.addEventListener('click', () => {
      selectedRace = button.dataset.race;
      renderLoadout();
    });
  });
  document.querySelectorAll('.starter-option').forEach(button => {
    button.addEventListener('click', () => {
      selectedStarter = button.dataset.gear;
      board = emptyBoard();
      items = [];
      starterPlaced = false;
      starterRotation = 0;
      renderLoadout();
    });
  });
  loadoutGrid.addEventListener('mouseover', event => {
    const cell = event.target.closest('.board-cell');
    if (cell && selectedStarter && !starterPlaced) showLoadoutPreview(Number(cell.dataset.index));
  });
  loadoutRotate.addEventListener('click', rotateStarter);
  startButton.addEventListener('click', startRun);
  placementRotate.addEventListener('click', rotateRewardGear);
  rollDieButton.addEventListener('click', rollAbilityCheck);
  diceContinueButton.addEventListener('click', () => {
    if (currentCheck) finishAbilityCheck();
    else {
      dicePanel.hidden = true;
      currentEvent = null;
      advanceRoom();
    }
  });
  placementSkip.addEventListener('click', () => {
    if (!pendingReward) return;
    if (movingItem) {
      for (const cell of movingItem.cells) board[cell] = movingItem.uid;
      movingItem = null;
      placementRotation = 0;
      previewCell = -1;
      placementHint.textContent = '移动已取消，装备恢复原位。';
      placementSkip.textContent = rewardPlaced ? '跳过整理' : '放弃这件装备';
      placementDone.disabled = false;
      placementRotate.disabled = rewardPlaced;
      renderPlacementBoard();
      update();
      return;
    }
    pendingReward = null;
    rewardPlaced = false;
    advanceRoom();
  });
  placementDone.addEventListener('click', finishGearPlacement);
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    try { localStorage.setItem('card-case-sound', soundEnabled ? 'on' : 'off'); } catch {}
    soundToggle.textContent = soundEnabled ? '音效：开' : '音效：关';
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    if (soundEnabled) playSound('reward');
  });
  rewardOptions.addEventListener('click', event => { if (event.target.closest('.reward-option')) playSound('reward'); });
  placementGrid.addEventListener('mouseover', event => {
    const cell = event.target.closest('.board-cell');
    if (!cell || !pendingReward || (rewardPlaced && !movingItem)) return;
    previewCell = Number(cell.dataset.index);
    showPlacementPreview(previewCell);
  });
  endTurnButton.addEventListener('click', endTurn);
  resultButton.addEventListener('click', resetLoadout);
  changeLoadout.addEventListener('click', resetLoadout);
  window.addEventListener('keydown', event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === 'r' && !loadout.hidden && selectedStarter) {
      event.preventDefault();
      rotateStarter();
      return;
    }
    if (key === 'r' && !placementPanel.hidden && pendingReward) {
      event.preventDefault();
      rotateRewardGear();
      return;
    }
    if (event.code === 'Escape' && !placementPanel.hidden && movingItem) {
      placementSkip.click();
      return;
    }
    if (event.repeat || !overlay.hidden || combat.hidden) return;
    const match = /^Digit([1-6])$/.exec(event.code);
    if (match) {
      const button = cardGrid.querySelectorAll('.play-card')[Number(match[1]) - 1];
      if (button && !button.disabled) { event.preventDefault(); button.click(); }
    }
  });

  document.querySelectorAll('.starter-option').forEach(button => {
    const icon = document.createElement('span');
    icon.className = 'starter-art-wrap';
    icon.innerHTML = art(ART_IDS[button.dataset.gear], 'starter-art');
    button.prepend(icon);
  });
  board = emptyBoard();
  items = [];
  renderLoadout();
})();
