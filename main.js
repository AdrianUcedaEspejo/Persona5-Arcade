// ============================================================
//  PERSONA 5: ARCADE  –  main.js
//  Punto de entrada: configura Phaser y registra todas las escenas.
// ============================================================

// Estado global compartido entre escenas
const G = {
  score:        0,
  health:       100,
  molesCaught:  0,
  molesMissed:  0,
  difficulty:   'normal',
  volume:       0.6,
  dexPoints:    0,
  gameDuration: 60,
};

const W = 480;
const H = 854;

const C = {
  red:   0xec1c24,
  black: 0x0a0a0a,
  white: 0xffffff,
  gold:  0xffd700,
  gray:  0x333333,
  dark:  0x1a0000,
};

const DIFFICULTIES = {
  facil:   { label: 'FÁCIL',   spawnTime: 1800, visibleTime: 2500, maxMoles: 2 },
  normal:  { label: 'NORMAL',  spawnTime: 1200, visibleTime: 1800, maxMoles: 3 },
  dificil: { label: 'DIFÍCIL', spawnTime: 750,  visibleTime: 1000, maxMoles: 4 },
};

const MOLE_TYPES = [
  { name: 'Shadow',    key: 'topo1', points: 10, damage: 20 },
  { name: 'Kamoshida', key: 'topo2', points: 15, damage: 15 },
  { name: 'Madarame',  key: 'topo3', points: 20, damage: 25 },
  { name: 'Kaneshiro', key: 'topo4', points: 25, damage: 30 },
];

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#0a0a0a',
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  },
  scene: [BootScene,SplashScene, MenuScene, OptionsScene, DifficultyScene, GameScene, GameOverScene],
  banner: false,
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.refresh();
});