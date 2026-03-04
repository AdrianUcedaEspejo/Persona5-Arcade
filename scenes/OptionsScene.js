// ============================================================
//  OptionsScene.js
//  Pantalla de opciones reorganizada y legible.
// ============================================================
class OptionsScene extends Phaser.Scene {
  constructor() { super('OptionsScene'); }

  create() {
    // ── FONDO ───────────────────────────────────────────────
    this.add.image(W / 2, H / 2, 'bg_menu').setDisplaySize(W, H);

    // Franja negra superior para el título (como el HUD del juego)
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.75);
    topBar.fillRect(0, 0, W, 110);
    topBar.lineStyle(3, 0xec1c24, 1);
    topBar.strokeRect(0, 0, W, 110);

    // Acento rojo izquierdo del título
    this.add.rectangle(0, 55, 8, 110, 0xec1c24).setOrigin(0, 0.5);

    this.add.text(W / 2, 55, 'OPCIONES', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '54px', color: '#ffffff',
      stroke: '#ec1c24', strokeThickness: 4,
    }).setOrigin(0.5);

    // ── SECCIÓN VOLUMEN ─────────────────────────────────────
    this._section(165, 'VOLUMEN DE MÚSICA');

    // Fondo del slider
    const SX = 60, SW = W - 120, SY = 210;
    const slBg   = this.add.graphics();
    const slFill = this.add.graphics();

    const drawSlider = (val) => {
      slBg.clear();
      slBg.fillStyle(0x000000, 0.6);
      slBg.fillRect(SX, SY, SW, 14);
      slBg.lineStyle(1, 0xffffff, 0.3);
      slBg.strokeRect(SX, SY, SW, 14);

      slFill.clear();
      slFill.fillStyle(0xffffff, 1);
      slFill.fillRect(SX, SY, SW * val, 14);
    };
    drawSlider(G.volume);

    const knob = this.add.circle(SX + SW * G.volume, SY + 7, 16, 0xffffff)
      .setInteractive({ draggable: true, cursor: 'ew-resize' })
      .setDepth(5);
    this.add.circle(SX + SW * G.volume, SY + 7, 8, 0xec1c24)
      .setDepth(6);
    this._knobInner = this.add.circle(SX + SW * G.volume, SY + 7, 8, 0xec1c24).setDepth(6);

    this.input.setDraggable(knob);
    this.input.on('drag', (ptr, obj, x) => {
      const nx = Phaser.Math.Clamp(x, SX, SX + SW);
      obj.x = nx;
      this._knobInner.x = nx;
      G.volume = (nx - SX) / SW;
      drawSlider(G.volume);
      const m = this.sound.get('bgm_menu');
      if (m) m.setVolume(G.volume);
    });

    // Etiquetas 0 y 100%
    this.add.text(SX, SY + 24, '0%', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '13px', color: '#ffffff',
    }).setAlpha(0.5);
    this.add.text(SX + SW, SY + 24, '100%', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(1, 0).setAlpha(0.5);

    // ── SECCIÓN CÓMO JUGAR ──────────────────────────────────
    this._section(310, 'CÓMO JUGAR');

    // Panel negro para las instrucciones
    const panelY = 340;
    const panelH = 340;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.65);
    panel.fillRect(30, panelY, W - 60, panelH);
    panel.lineStyle(2, 0xffffff, 0.15);
    panel.strokeRect(30, panelY, W - 60, panelH);

    // Línea roja izquierda del panel
    this.add.rectangle(30, panelY + panelH / 2, 4, panelH, 0xec1c24).setOrigin(0, 0.5);

    // Instrucciones como filas separadas
    const instrucciones = [
      { icon: '👊', texto: 'Toca los personajes antes\nde que escapen' },
      { icon: '💀', texto: 'Si un personaje escapa\npierdes vida' },
      { icon: '💚', texto: 'Si golpeas con éxito\nrecuperas vida' },
      { icon: '☠', texto: 'Si la vida llega a 0\n¡Game Over!' },
      { icon: '⭐', texto: 'Gana Puntos de Destreza\nsegún vida y puntuación (máx. 3)' },
    ];

    instrucciones.forEach((item, i) => {
      const rowY = panelY + 30 + i * 62;

      // Icono
      this.add.text(62, rowY, item.icon, {
        fontSize: '22px',
      }).setOrigin(0.5, 0);

      // Separador vertical
      const sep = this.add.graphics();
      sep.lineStyle(1, 0xec1c24, 0.5);
      sep.strokeLineShape(new Phaser.Geom.Line(80, rowY, 80, rowY + 50));

      // Texto de la instrucción
      this.add.text(92, rowY + 2, item.texto, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px', color: '#ffffff',
        lineSpacing: 4,
      });

      // Línea divisoria entre filas (excepto la última)
      if (i < instrucciones.length - 1) {
        const div = this.add.graphics();
        div.lineStyle(1, 0xffffff, 0.08);
        div.strokeLineShape(new Phaser.Geom.Line(38, rowY + 55, W - 38, rowY + 55));
      }
    });

    // ── BOTÓN VOLVER ────────────────────────────────────────
    const btnY = H - 60;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x000000, 0.85);
    btnBg.fillRect(W / 2 - 160, btnY - 26, 320, 52);
    btnBg.lineStyle(2, 0xffffff, 0.9);
    btnBg.strokeRect(W / 2 - 160, btnY - 26, 320, 52);
    this.add.rectangle(W / 2 - 160, btnY, 6, 52, 0xec1c24).setOrigin(0, 0.5);

    const back = this.add.text(W / 2 + 6, btnY, '← VOLVER AL MENÚ', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    back.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xec1c24, 1);
      btnBg.fillRect(W / 2 - 160, btnY - 26, 320, 52);
      back.setColor('#000000');
    });
    back.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x000000, 0.85);
      btnBg.fillRect(W / 2 - 160, btnY - 26, 320, 52);
      btnBg.lineStyle(2, 0xffffff, 0.9);
      btnBg.strokeRect(W / 2 - 160, btnY - 26,320, 52);
      back.setColor('#ffffff');
    });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  // Cabecera de sección con línea roja
  _section(y, titulo) {
    this.add.text(W / 2, y, titulo, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '20px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    const line = this.add.graphics();
    line.lineStyle(2, 0xffd700, 0.6);
    line.strokeLineShape(new Phaser.Geom.Line(30, y + 22, W - 30, y + 22));
  }
}