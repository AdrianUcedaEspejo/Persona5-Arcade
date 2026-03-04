// ============================================================
//  GameOverScene.js
//  Muestra los resultados de la partida y los Puntos de Destreza.
//
//  PUNTOS DE DESTREZA (0-3 estrellas):
//    Factor vida:       ≥80% → 1.5 | ≥50% → 1.0 | <50% → 0.5
//    Factor puntuación: ≥30  → 1.5 | ≥15  → 1.0 | <15  → 0.5
//    Total = suma redondeada, máximo 3.
// ============================================================
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    this.add.image(W / 2, H / 2, 'bg_menu').setDisplaySize(W, H);

    const panel = this.add.graphics();
    panel.fillStyle(0x0a0a0a, 0.90); panel.fillRect(28, 75, W - 56, H - 150);
    panel.lineStyle(3, 0xec1c24, 1); panel.strokeRect(28, 75, W - 56, H - 150);
    panel.fillStyle(0xec1c24, 1);    panel.fillRect(28, 75, W - 56, 7);

    const perdio = G.health <= 0;
    this.add.text(W / 2, 125, perdio ? 'GAME OVER' : 'RESULTADO', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '50px', color: perdio ? '#ec1c24' : '#ffd700',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    const stats = [
      { label: 'PUNTUACIÓN',    value: G.score },
      { label: 'TOPOS CAZADOS', value: G.molesCaught },
      { label: 'TOPOS PERDIDOS',value: G.molesMissed },
      { label: 'VIDA FINAL',    value: Math.round(G.health) + '%' },
      { label: 'DIFICULTAD',    value: DIFFICULTIES[G.difficulty].label },
    ];

    stats.forEach((s, i) => {
      const y = 225 + i * 68;
      this.add.text(68, y, s.label, {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '17px', color: '#aaaaaa',
      });
      this.add.text(W - 68, y, String(s.value), {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '21px', color: '#ffffff',
      }).setOrigin(1, 0);
      const ln = this.add.graphics();
      ln.lineStyle(1, 0x333333, 0.7);
      ln.strokeLineShape(new Phaser.Geom.Line(58, y + 34, W - 58, y + 34));
    });

    this.add.text(W / 2, 600, 'PUNTOS DE DESTREZA', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '20px', color: '#ffd700',
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const star = this.add.text(W / 2 + (i - 1) * 66, 655, '★', {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '50px',
        color: i < G.dexPoints ? '#ffd700' : '#2a2a2a',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5);
      if (i < G.dexPoints) {
        this.tweens.add({ targets: star, scaleX: 1.35, scaleY: 1.35,
          yoyo: true, duration: 380, delay: i * 200 });
      }
    }

    this.add.text(W / 2, 710, G.dexPoints + ' / 3 pts', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    const v = G.health >= 80 ? 'Vida alta (+1.5)' : G.health >= 50 ? 'Buena vida (+1)' : 'Vida baja (+0.5)';
    const p = G.molesCaught >= 30 ? 'Gran caza (+1.5)' : G.molesCaught >= 15 ? 'Buena caza (+1)' : 'Poca caza (+0.5)';
    this.add.text(W / 2, 742, v + '  ·  ' + p, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px', color: '#666666', align: 'center',
    }).setOrigin(0.5);

    this._btn(W / 2, H - 130, '▶  JUGAR DE NUEVO', () => this.scene.start('DifficultyScene'));
    this._btn(W / 2, H - 62,  '⌂  MENÚ PRINCIPAL',  () => this.scene.start('MenuScene'));
  }

  _btn(x, y, txt, cb) {
    const g = this.add.graphics();
    g.fillStyle(0xec1c24, 1); g.fillRect(x - 165, y - 22, 330, 44);
    g.lineStyle(2, 0xffd700, 1); g.strokeRect(x - 165, y - 22, 330, 44);
    const label = this.add.text(x, y, txt, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '21px', color: '#000000',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    label.on('pointerover', () => label.setColor('#ffffff'));
    label.on('pointerout',  () => label.setColor('#000000'));
    label.on('pointerdown', cb);
  }
}