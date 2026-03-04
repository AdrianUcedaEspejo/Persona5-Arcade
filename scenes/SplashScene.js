// ============================================================
//  SplashScene.js
//  Pantalla de presentación estilo Persona 5.
//  Secuencia:
//    1. Negro total
//    2. Raya roja diagonal cruza la pantalla
//    3. "PERSONA" cae letra por letra con impacto
//    4. "5" aparece enorme con flash blanco
//    5. Bloques y líneas vuelan por todos lados
//    6. Barrido rojo final → transición al menú
//
//  Toca la pantalla en cualquier momento para saltar.
// ============================================================
class SplashScene extends Phaser.Scene {
  constructor() { super('SplashScene'); }

  create() {
    // Fondo negro
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

    // Permitir saltar tocando
    this.input.once('pointerdown', () => this._goToMenu());

    // Texto de "toca para saltar"
    const skip = this.add.text(W / 2, H - 50, 'TOCA PARA SALTAR', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '14px', color: '#555555',
    }).setOrigin(0.5).setDepth(99);
    this.tweens.add({
      targets: skip, alpha: { from: 0.2, to: 0.7 },
      yoyo: true, repeat: -1, duration: 800,
    });

    // Arrancar secuencia
    this._step1_ray();
  }

  // ── PASO 1: raya diagonal roja cruza la pantalla ──────────
  _step1_ray() {
    // Raya principal
    const ray = this.add.graphics().setDepth(10);
    ray.fillStyle(0xec1c24, 1);
    // Polígono inclinado que cruza toda la pantalla
    ray.fillPoints([
      { x: -W,       y: H * 0.45 },
      { x: W * 2,    y: H * 0.45 },
      { x: W * 2,    y: H * 0.55 },
      { x: -W,       y: H * 0.55 },
    ], true);
    ray.setAlpha(0);
    ray.setScale(0.1, 1);

    // Entra rápido desde la izquierda
    this.tweens.add({
      targets: ray,
      alpha: 1,
      scaleX: 1,
      duration: 180,
      ease: 'Quad.Out',
      onComplete: () => {
        // Vibración de cámara al impactar
        this.cameras.main.shake(120, 0.018);

        // Pequeñas rayas secundarias
        for (let i = 0; i < 5; i++) {
          const mini = this.add.graphics().setDepth(9);
          mini.fillStyle(0xec1c24, 0.5);
          const yOff = Phaser.Math.Between(-120, 120);
          mini.fillPoints([
            { x: -W,    y: H * 0.45 + yOff },
            { x: W * 2, y: H * 0.45 + yOff },
            { x: W * 2, y: H * 0.45 + yOff + Phaser.Math.Between(4, 14) },
            { x: -W,    y: H * 0.45 + yOff + Phaser.Math.Between(4, 14) },
          ], true);
          this.tweens.add({
            targets: mini, alpha: 0, duration: 400,
            delay: i * 60, onComplete: () => mini.destroy(),
          });
        }

        // La raya principal se desvanece
        this.tweens.add({
          targets: ray, alpha: 0, duration: 350, delay: 200,
          onComplete: () => this._step2_persona(),
        });
      },
    });
  }

  // ── PASO 2: "PERSONA" cae letra por letra ─────────────────
  _step2_persona() {
    const letters = 'PERSONA'.split('');
    const totalW  = letters.length * 58;
    const startX  = W / 2 - totalW / 2 + 28;
    const targetY = H / 2 - 60;

    const letterSprites = [];

    letters.forEach((char, i) => {
      const txt = this.add.text(startX + i * 58, -80, char, {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '72px',
        color: '#ffffff',
        stroke: '#ec1c24',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(20).setAlpha(0);

      letterSprites.push(txt);

      // Cada letra cae con un pequeño retraso
      this.time.delayedCall(i * 90, () => {
        txt.setAlpha(1);
        this.tweens.add({
          targets: txt,
          y: targetY,
          duration: 220,
          ease: 'Bounce.Out',
          onComplete: () => {
            // Impacto: escala breve
            this.tweens.add({
              targets: txt,
              scaleX: 1.25, scaleY: 0.75,
              duration: 60, yoyo: true,
            });
            // Partícula de impacto en el suelo
            this._impactParticle(startX + i * 58, targetY + 44);
          },
        });
      });
    });

    // Cuando termina la última letra, paso 3
    this.time.delayedCall(letters.length * 90 + 400, () => {
      this._step3_five(letterSprites);
    });
  }

  // ── PASO 3: el "5" aparece enorme con flash blanco ────────
  _step3_five(personaLetters) {
    // Flash blanco de toda la pantalla
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff)
      .setDepth(50).setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 1 },
      duration: 80,
      yoyo: true,
      onComplete: () => flash.destroy(),
    });

    // El "5" aparece grande
    const five = this.add.text(W / 2, H / 2 + 30, '5', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '200px',
      color: '#ec1c24',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(20).setScale(3).setAlpha(0);

    this.tweens.add({
      targets: five,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        this.cameras.main.shake(200, 0.022);
        this._step4_chaos(personaLetters, five);
      },
    });
  }

  // ── PASO 4: bloques y líneas vuelan por todos lados ───────
  _step4_chaos(personaLetters, five) {
    // Líneas rojas volando en diagonal
    for (let i = 0; i < 12; i++) {
      const line = this.add.graphics().setDepth(15);
      const y    = Phaser.Math.Between(50, H - 50);
      const h    = Phaser.Math.Between(3, 12);
      const dir  = Math.random() > 0.5 ? 1 : -1;
      line.fillStyle(0xec1c24, Phaser.Math.FloatBetween(0.4, 0.9));
      line.fillRect(0, y, W, h);
      line.setX(dir > 0 ? -W : W);

      this.tweens.add({
        targets: line,
        x: dir > 0 ? W * 0.5 : -W * 0.5,
        duration: Phaser.Math.Between(200, 500),
        delay: i * 50,
        ease: 'Quad.Out',
        onComplete: () => {
          this.tweens.add({
            targets: line, alpha: 0, duration: 200,
            onComplete: () => line.destroy(),
          });
        },
      });
    }

    // Bloques negros con borde rojo
    for (let i = 0; i < 6; i++) {
      const block = this.add.graphics().setDepth(16);
      const bw = Phaser.Math.Between(60, 160);
      const bh = Phaser.Math.Between(20, 50);
      const bx = Phaser.Math.Between(20, W - bw - 20);
      const by = Phaser.Math.Between(100, H - 200);
      block.fillStyle(0x0a0a0a, 1);
      block.fillRect(0, 0, bw, bh);
      block.lineStyle(2, 0xec1c24, 1);
      block.strokeRect(0, 0, bw, bh);
      block.setPosition(bx, by).setAlpha(0);

      this.tweens.add({
        targets: block,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0, to: 1 },
        duration: 150,
        delay: i * 80,
        yoyo: false,
        onComplete: () => {
          this.tweens.add({
            targets: block, alpha: 0, duration: 300, delay: 300,
            onComplete: () => block.destroy(),
          });
        },
      });
    }

    // Texto "ALL OUT ATTACK" estilo P5
    const aoa = this.add.text(W / 2, H / 2 + 130, 'ALL OUT ATTACK!!', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '28px', color: '#000000',
      backgroundColor: '#ec1c24',
      padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(25).setAlpha(0).setAngle(-3);

    this.tweens.add({
      targets: aoa,
      alpha: 1, scaleX: { from: 0.3, to: 1 }, scaleY: { from: 0.3, to: 1 },
      duration: 200, delay: 300, ease: 'Back.Out',
    });

    // Después del caos, paso 5
    this.time.delayedCall(900, () => {
      this._step5_wipe([...personaLetters, five, aoa]);
    });
  }

  // ── PASO 5: barrido rojo final → va al menú ───────────────
  _step5_wipe(elements) {
    // Desvanecer los elementos anteriores
    elements.forEach(el => {
      if (el && el.active) {
        this.tweens.add({ targets: el, alpha: 0, duration: 200 });
      }
    });

    // Gran bloque rojo barre la pantalla de izquierda a derecha
    const wipe = this.add.rectangle(-W / 2, H / 2, W, H, 0xec1c24)
      .setDepth(60);

    this.tweens.add({
      targets: wipe,
      x: W / 2,
      duration: 350,
      ease: 'Quad.In',
      onComplete: () => {
        // Segundo bloque negro encima barre también
        const wipe2 = this.add.rectangle(-W / 2, H / 2, W, H, 0x0a0a0a)
          .setDepth(61);
        this.tweens.add({
          targets: wipe2,
          x: W / 2,
          duration: 300,
          delay: 100,
          ease: 'Quad.In',
          onComplete: () => this._goToMenu(),
        });
      },
    });
  }

  // ── Partícula de impacto ───────────────────────────────────
  _impactParticle(x, y) {
    for (let i = 0; i < 5; i++) {
      const p = this.add.rectangle(
        x + Phaser.Math.Between(-20, 20),
        y,
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(3, 8),
        0xec1c24
      ).setDepth(21).setAlpha(0.8);

      this.tweens.add({
        targets: p,
        y: y + Phaser.Math.Between(10, 35),
        x: p.x + Phaser.Math.Between(-15, 15),
        alpha: 0,
        duration: Phaser.Math.Between(200, 400),
        onComplete: () => p.destroy(),
      });
    }
  }

  // ── Ir al menú ────────────────────────────────────────────
  _goToMenu() {
    // Evitar llamadas múltiples
    if (this._going) return;
    this._going = true;
    this.scene.start('MenuScene');
  }
}