// ============================================================
//  DifficultyScene.js
//  Selector de dificultad antes de empezar la partida.
// ============================================================
class DifficultyScene extends Phaser.Scene {
  constructor() { super('DifficultyScene'); }

  create() {
    this.add.image(W / 2, H / 2, 'bg_menu').setDisplaySize(W, H);

    this.add.text(W / 2, 110, 'DIFICULTAD', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '54px', color: '#ffffff',
      stroke: '#ec1c24', strokeThickness: 6,
    }).setOrigin(0.5);

    const opts = [
      { key: 'facil',   y: 310, desc: 'Topos lentos · Más tiempo · Para comenzar' },
      { key: 'normal',  y: 460, desc: 'Velocidad moderada · Equilibrado' },
      { key: 'dificil', y: 610, desc: 'Topos rápidos · Poco tiempo · Para pros' },
    ];

    opts.forEach(o => {
      const cfg = DIFFICULTIES[o.key];
      const sel = G.difficulty === o.key;

      const box = this.add.graphics();
      box.fillStyle(sel ? 0xec1c24 : 0x0a0a0a, sel ? 1 : 0.88);
      box.fillRect(W / 2 - 185, o.y - 55, 370, 106);
      box.lineStyle(2, sel ? 0xffd700 : 0xec1c24, 1);
      box.strokeRect(W / 2 - 185, o.y - 55, 370, 106);

      const acc = this.add.graphics();
      acc.fillStyle(sel ? 0xffd700 : 0xec1c24, 1);
      acc.fillRect(W / 2 - 185, o.y - 55, 8, 106);

      this.add.text(W / 2, o.y - 18, cfg.label, {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '32px', color: sel ? '#000000' : '#ec1c24',
      }).setOrigin(0.5);

      this.add.text(W / 2, o.y + 24, o.desc, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px', color: sel ? '#111111' : '#aaaaaa',
        align: 'center',
      }).setOrigin(0.5);

      this.add.zone(W / 2, o.y, 370, 106)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => {
          G.difficulty = o.key;
          this.scene.start('GameScene');
        });
    });

    const back = this.add.text(W / 2, H - 70, '← VOLVER', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '26px', color: '#ec1c24',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    back.on('pointerover', () => back.setColor('#ffd700'));
    back.on('pointerout',  () => back.setColor('#ec1c24'));
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}