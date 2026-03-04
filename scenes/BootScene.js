// ============================================================
//  BootScene.js
//  Carga TODOS los assets (imágenes y audio) antes de empezar.
//  También genera las texturas procedurales que no tienen imagen
//  propia (hoyo, martillo, fondo).
// ============================================================
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(60, H / 2 - 10, W - 120, 20);

    const bar = this.add.graphics();
    this.add.text(W / 2, H / 2 - 40, 'CARGANDO...', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '28px', color: '#ec1c24',
    }).setOrigin(0.5);

    this.load.on('progress', v => {
      bar.clear();
      bar.fillStyle(0xec1c24, 1);
      bar.fillRect(60, H / 2 - 10, (W - 120) * v, 20);
    });

    this.load.image('joker', 'assets/images/joker.png');
    this.load.image('topo1', 'assets/images/topo1.png');
    this.load.image('topo2', 'assets/images/topo2.png');
    this.load.image('topo3', 'assets/images/topo3.png');
    this.load.image('topo4', 'assets/images/topo4.png');

    this.load.audio('bgm_menu', 'assets/audio/menu_music.mp3');
    // Música del juego (Last Surprise - Persona 5)
    this.load.audio('bgm_game', 'assets/audio/lastsurprise.mp3');
  }

  create() {
    this._genHole();
    this._genHammer();
    this._genBgMenu();
    this._genBgGame();
    this._genMask();   // genera la textura de la máscara P5
    this.scene.start('SplashScene');
  }

  _genHole() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x050505, 1);
    g.fillEllipse(56, 22, 112, 40);
    g.fillStyle(0x1a0000, 1);
    g.fillEllipse(56, 20, 96, 30);
    g.generateTexture('hole', 112, 44);
    g.destroy();
  }

  _genHammer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x8B4513, 1); g.fillRect(18, 32, 8, 50);
    g.fillStyle(0xbbbbbb, 1); g.fillRect(6,  10, 32, 24);
    g.fillStyle(0xec1c24, 1); g.fillRect(6,  10, 32, 7);
    g.generateTexture('hammer', 44, 84);
    g.destroy();
  }

  _genBgMenu() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0a0a0a, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0xec1c24, 1); g.fillTriangle(0, 0, W, 0, W * 0.55, H);
    g.generateTexture('bg_menu', W, H);
    g.destroy();
  }

  _genBgGame() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x1a0e06, 1); g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 55) {
      g.fillStyle(0x2a1a0a, 0.4); g.fillRect(0, y, W, 2);
    }
    g.generateTexture('bg_game', W, H);
    g.destroy();
  }

  // Genera la máscara de Joker (Phantom Thief) dibujada a mano
  _genMask() {
    const s = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Forma exterior de la máscara
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(s / 2, s / 2, s - 4, s * 0.72);

    // Agujeros de los ojos (alargados, estilo Joker)
    g.fillStyle(0x0a0a0a, 1);
    g.fillEllipse(s / 2 - 16, s / 2 - 4, 22, 10);
    g.fillEllipse(s / 2 + 16, s / 2 - 4, 22, 10);

    // Borde rojo fino
    g.lineStyle(2, 0xec1c24, 1);
    g.strokeEllipse(s / 2, s / 2, s - 4, s * 0.72);

    // Detalle nariz
    g.fillStyle(0xec1c24, 1);
    g.fillTriangle(s / 2, s / 2 + 6, s / 2 - 4, s / 2 + 14, s / 2 + 4, s / 2 + 14);

    g.generateTexture('p5mask', s, s);
    g.destroy();
  }
}