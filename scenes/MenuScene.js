// ============================================================
//  MenuScene.js
//  Menú principal con estética Persona 5.
//  Botones: Comenzar Partida, Opciones, Salir.
// ============================================================
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.add.image(W / 2, H / 2, 'bg_menu').setDisplaySize(W, H);

    for (let i = 0; i < 7; i++) {
      const l = this.add.graphics();
      l.lineStyle(1.5, 0xffffff, 0.07);
      l.strokeLineShape(new Phaser.Geom.Line(-W, i * 130, W * 2, i * 130 - 220));
      this.tweens.add({ targets: l, alpha: { from: 0.03, to: 0.13 }, yoyo: true, repeat: -1, duration: 900 + i * 150 });
    }

    const title = this.add.text(W / 2, 155, 'PERSONA 5', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '70px', color: '#ffffff',
      stroke: '#ec1c24', strokeThickness: 7,
    }).setOrigin(0.5).setScale(0.5);
    this.tweens.add({ targets: title, scaleX: 1, scaleY: 1, duration: 550, ease: 'Back.Out' });

    this.add.text(W / 2, 232, 'ARCADE', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '42px', color: '#ec1c24',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.image(W / 2, 490, 'joker').setDisplaySize(200, 228).setAlpha(0.25);

    this._makeBtn(W / 2, 560, '▶  COMENZAR PARTIDA', () => this.scene.start('DifficultyScene'));
    this._makeBtn(W / 2, 645, '⚙  OPCIONES',         () => this.scene.start('OptionsScene'));
    this._makeBtn(W / 2, 730, '✕  SALIR',             () => {
      if (window.Capacitor) window.Capacitor.Plugins.App.exitApp();
      else alert('¡Hasta la próxima, Phantom Thief!');
    });

    const sub = this.add.text(W / 2, H - 38, 'STEAL THEIR HEARTS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '15px', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.35);
    this.tweens.add({ targets: sub, alpha: { from: 0.2, to: 0.75 }, yoyo: true, repeat: -1, duration: 950 });

    if (!this.sound.get('bgm_menu') || !this.sound.get('bgm_menu').isPlaying) {
      this.music = this.sound.add('bgm_menu', { loop: true, volume: G.volume });
      this.music.play();
    }
    this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
  }

  _makeBtn(x, y, text, cb) {
    const cont = this.add.container(x, y);
    const bg = this.add.graphics();
    const accent = this.add.graphics();
    accent.fillStyle(0xec1c24, 1);
    accent.fillRect(-172, -24, 8, 48);

    const drawBg = (hover) => {
      bg.clear();
      bg.fillStyle(hover ? 0xec1c24 : 0x0a0a0a, hover ? 1 : 0.88);
      bg.fillRect(-164, -24, 328, 48);
      bg.lineStyle(2, hover ? 0xffd700 : 0xec1c24, 1);
      bg.strokeRect(-164, -24, 328, 48);
    };
    drawBg(false);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    cont.add([bg, accent, label]);
    cont.setSize(328, 48).setInteractive({ cursor: 'pointer' });
    cont.on('pointerover',  () => { drawBg(true);  label.setColor('#000000'); this.tweens.add({ targets: cont, x: x + 7, duration: 90 }); });
    cont.on('pointerout',   () => { drawBg(false); label.setColor('#ffffff'); this.tweens.add({ targets: cont, x: x,     duration: 90 }); });
    cont.on('pointerdown',  () => { this._click(); cb(); });
    return cont;
  }

  _click() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = 'square';
      g.gain.setValueAtTime(G.volume * 0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      o.start(); o.stop(ctx.currentTime + 0.09);
    } catch(e) {}
  }
}