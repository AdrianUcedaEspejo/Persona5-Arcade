// ============================================================
//  GameScene.js  –  El juego principal
//
//  SISTEMA DE VIDA:
//    - health va de 0 a 100.
//    - Cada topo que escapa resta `damage` HP (definido en MOLE_TYPES).
//    - Si health llega a 0 → Game Over inmediato.
//    - Al golpear un topo con éxito el jugador recupera:
//        heal = missedInRow × 2, máximo 10 HP por golpe.
//      Esto compensa parcialmente los topos perdidos seguidos.
//
//  POSICIÓN Y TIPO DE TOPO:
//    - Hay 9 hoyos en cuadrícula 3×3.
//    - Se elige un hoyo libre al azar con Phaser.Utils.Array.GetRandom.
//    - El tipo de topo se elige al azar entre MOLE_TYPES.
//    - Máximo `diff.maxMoles` topos activos simultáneamente.
//
//  PUNTOS DE DESTREZA (calculados en GameOverScene):
//    - Dependen de vida final + puntuación total (máx. 3).
// ============================================================
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    G.score       = 0;
    G.health      = 100;
    G.molesCaught = 0;
    G.molesMissed = 0;

    const diff = DIFFICULTIES[G.difficulty];

    this.add.image(W / 2, H / 2, 'bg_game').setDisplaySize(W, H);

    const deco = this.add.graphics();
    deco.lineStyle(1, 0xec1c24, 0.12);
    for (let i = 0; i < 8; i++)
      deco.strokeLineShape(new Phaser.Geom.Line(0, 95 + i * 90, W, 95 + i * 90 - 35));

    this.holes = this._createHoles();

    this.add.image(W - 55, H - 90, 'joker')
      .setDisplaySize(130, 148).setAlpha(0.9).setDepth(5);

    // ── MÁSCARAS EN LAS ESQUINAS ───────────────────────────
    // Posiciones: fuera del área de juego, una en cada esquina
    this._spawnCornerMasks();

    this.hammer = this.add.image(W / 2, H / 2, 'hammer')
      .setScale(1.15).setDepth(15).setAlpha(0.85);
    this.input.on('pointermove', p => this.hammer.setPosition(p.x, p.y));
    this.input.on('pointerdown', () => {
      this.tweens.add({ targets: this.hammer, scaleX: 1.5, scaleY: 0.7, duration: 75, yoyo: true });
    });
    this.input.setDefaultCursor('none');

    this._createHUD();

    this.activeMoles = 0;
    this.missedInRow = 0;

    this.timeLeft = G.gameDuration;
    this.timeEvent = this.time.addEvent({
      delay: 1000, repeat: G.gameDuration - 1,
      callback: () => {
        this.timeLeft--;
        this._updateHUD();
        if (this.timeLeft <= 0) this._endGame();
      },
    });

    this.spawnTimer = this.time.addEvent({
      delay: diff.spawnTime, loop: true,
      callback: () => this._spawnMole(diff),
    });

    // ── MÚSICA DEL JUEGO ───────────────────────────────────
    this.music = this.sound.add('bgm_game', { loop: true, volume: G.volume });
    this.music.play();
    // Parar la música al salir de la escena
    this.events.on('shutdown', () => { if (this.music) this.music.stop(); });

    try { this._actx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { this._actx = null; }
  }

  // ── MÁSCARAS ANIMADAS EN LAS 4 ESQUINAS ───────────────────
  _spawnCornerMasks() {
    // Coordenadas de las 4 esquinas (ligeramente dentro para que se vean)
    const corners = [
      { x: 28,     y: 100,      angle: -25, depth: 0 },   // esquina superior izquierda
      { x: W - 28, y: 100,      angle:  25, depth: 0 },   // esquina superior derecha
      { x: 28,     y: H - 140,  angle:  20, depth: 6 },   // esquina inferior izquierda
      { x: W - 28, y: H - 140,  angle: -20, depth: 6 },   // esquina inferior derecha
    ];

    corners.forEach((c, i) => {
      const mask = this.add.image(c.x, c.y, 'p5mask')
        .setScale(0.7)
        .setAlpha(0.18)
        .setAngle(c.angle)
        .setDepth(c.depth)
        .setTint(0xec1c24);  // tinte rojo Persona 5

      // Animación 1: pulso de opacidad lento y continuo
      this.tweens.add({
        targets: mask,
        alpha: { from: 0.10, to: 0.30 },
        duration: 1800 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });

      // Animación 2: rotación lenta continua
      this.tweens.add({
        targets: mask,
        angle: c.angle + (i % 2 === 0 ? 12 : -12),
        duration: 3000 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });

      // Animación 3: escala con pulso suave (latido)
      this.tweens.add({
        targets: mask,
        scaleX: { from: 0.68, to: 0.76 },
        scaleY: { from: 0.68, to: 0.76 },
        duration: 900 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.InOut',
      });

      // Destello rojo ocasional cada ciertos segundos
      this.time.addEvent({
        delay: 3500 + i * 800,
        loop: true,
        callback: () => {
          this.tweens.add({
            targets: mask,
            alpha: 0.7,
            scaleX: 0.9,
            scaleY: 0.9,
            tint: 0xffffff,   // destello blanco
            duration: 120,
            yoyo: true,
            onComplete: () => mask.setTint(0xec1c24),
          });
        },
      });
    });
  }

  _createHoles() {
    const cols = 3, rows = 3;
    const xStart = 90, xStep = (W - 180) / (cols - 1);
    const yStart = 265, yStep = 145;
    const holes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        holes.push({
          x: xStart + c * xStep,
          y: yStart + r * yStep,
          mole: null,
          occupied: false,
        });
      }
    }
    holes.forEach(h => {
      this.add.image(h.x, h.y + 18, 'hole').setDepth(2);
    });
    return holes;
  }

  _spawnMole(diff) {
    if (this.activeMoles >= diff.maxMoles) return;
    if (this.timeLeft <= 0) return;

    const free = this.holes.filter(h => !h.occupied);
    if (!free.length) return;
    const hole = Phaser.Utils.Array.GetRandom(free);
    const type = Phaser.Utils.Array.GetRandom(MOLE_TYPES);

    hole.occupied = true;
    this.activeMoles++;

    const mole = this.add.image(hole.x, hole.y + 50, type.key)
      .setDisplaySize(72, 72).setDepth(3).setInteractive({ cursor: 'pointer' });

    mole.moleType = type;
    mole.alive    = true;
    hole.mole     = mole;

    this.tweens.add({ targets: mole, y: hole.y - 18, duration: 220, ease: 'Back.Out' });

    this.time.delayedCall(diff.visibleTime, () => {
      if (mole.alive) this._moleMissed(hole, mole);
    });

    mole.on('pointerdown', () => {
      if (!mole.alive) return;
      this._moleCaught(hole, mole, type);
    });
  }

  _moleCaught(hole, mole, type) {
    mole.alive = false;
    this.activeMoles = Math.max(0, this.activeMoles - 1);
    G.score++;
    G.molesCaught++;

    const heal = Math.min(this.missedInRow * 2, 10);
    if (heal > 0) {
      G.health = Math.min(100, G.health + heal);
      this._float('+' + heal + ' HP', hole.x, hole.y - 55, '#00ff88');
    }
    this.missedInRow = 0;

    const flash = this.add.circle(hole.x, hole.y - 18, 38, 0xec1c24, 0.75).setDepth(8);
    this.tweens.add({ targets: flash, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: 280,
      onComplete: () => flash.destroy() });

    this._float('+' + type.points + ' pts', hole.x, hole.y - 38, '#ffd700');
    this._playTone(660, 'square', 0.12, 0.35);
    this._retreat(hole, mole);
    this._updateHUD();
  }

  _moleMissed(hole, mole) {
    mole.alive = false;
    this.activeMoles = Math.max(0, this.activeMoles - 1);
    G.molesMissed++;
    this.missedInRow++;

    G.health = Math.max(0, G.health - mole.moleType.damage);
    this._float('-' + mole.moleType.damage + ' HP', hole.x, hole.y - 38, '#ec1c24');
    this.cameras.main.shake(180, 0.007);
    this._playTone(110, 'sine', 0.22, 0.2);

    this._retreat(hole, mole);
    this._updateHUD();

    if (G.health <= 0) this.time.delayedCall(350, () => this._endGame());
  }

  _retreat(hole, mole) {
    this.tweens.add({
      targets: mole, y: hole.y + 55, duration: 190, ease: 'Quad.In',
      onComplete: () => {
        mole.destroy();
        hole.mole = null;
        hole.occupied = false;
      },
    });
  }

  _createHUD() {
    const hud = this.add.graphics().setDepth(20);
    hud.fillStyle(0x0a0a0a, 0.93); hud.fillRect(0, 0, W, 92);
    hud.lineStyle(2, 0xec1c24, 1); hud.strokeRect(0, 0, W, 92);

    this.scoreTxt = this.add.text(14, 8, 'SCORE: 0', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px', color: '#ffd700',
    }).setDepth(21);

    this.molesTxt = this.add.text(14, 38, 'CAZADOS: 0', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '15px', color: '#ffffff',
    }).setDepth(21);

    this.timeTxt = this.add.text(W - 14, 8, '1:00', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '28px', color: '#ec1c24', align: 'right',
    }).setOrigin(1, 0).setDepth(21);

    this.add.text(W - 14, 48, DIFFICULTIES[G.difficulty].label, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '13px', color: '#888888', align: 'right',
    }).setOrigin(1, 0).setDepth(21);

    this.add.text(W / 2, 7, 'VIDA', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(21);

    this._hpBg  = this.add.graphics().setDepth(21);
    this._hpBar = this.add.graphics().setDepth(22);
    this._hpTxt = null;
    this._drawHP();
  }

  _drawHP() {
    const bx = W / 2 - 90, by = 26, bw = 180, bh = 18;
    this._hpBg.clear();
    this._hpBg.fillStyle(0x333333, 1); this._hpBg.fillRect(bx, by, bw, bh);

    const pct = G.health / 100;
    const col = pct > 0.5 ? 0x00cc44 : pct > 0.25 ? 0xffaa00 : 0xec1c24;
    this._hpBar.clear();
    this._hpBar.fillStyle(col, 1); this._hpBar.fillRect(bx, by, bw * pct, bh);

    if (this._hpTxt) this._hpTxt.destroy();
    this._hpTxt = this.add.text(W / 2, by + bh / 2, Math.round(G.health) + '%', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '13px', color: '#fff',
    }).setOrigin(0.5, 0.5).setDepth(23);
  }

  _updateHUD() {
    this.scoreTxt.setText('SCORE: ' + G.score);
    this.molesTxt.setText('CAZADOS: ' + G.molesCaught);
    const m = Math.floor(this.timeLeft / 60);
    const s = String(this.timeLeft % 60).padStart(2, '0');
    this.timeTxt.setText(m + ':' + s);
    this._drawHP();
  }

  _float(text, x, y, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '24px', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y - 65, alpha: 0, duration: 850, ease: 'Quad.Out',
      onComplete: () => t.destroy() });
  }

  _playTone(freq, type, dur, vol) {
    if (!this._actx) return;
    const o = this._actx.createOscillator(), g = this._actx.createGain();
    o.connect(g); g.connect(this._actx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(G.volume * vol, this._actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this._actx.currentTime + dur);
    o.start(); o.stop(this._actx.currentTime + dur);
  }

  _endGame() {
    if (this._ended) return;
    this._ended = true;
    this.spawnTimer.remove();
    this.timeEvent.remove();

    let dex = 0;
    dex += G.health >= 80 ? 1.5 : G.health >= 50 ? 1.0 : 0.5;
    dex += G.molesCaught >= 30 ? 1.5 : G.molesCaught >= 15 ? 1.0 : 0.5;
    G.dexPoints = Math.min(3, Math.round(dex));

    this.time.delayedCall(500, () => this.scene.start('GameOverScene'));
  }
}