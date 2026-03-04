# Persona 5: Arcade

Minijuego de cazatopos (whack-a-mole) ambientado en el universo de Persona 5, desarrollado con Phaser 3 y compatible con Android mediante Capacitor.

---

## Estructura del proyecto

```
Persona5Arcade/
├── index.html
├── main.js
├── scenes/
│   ├── BootScene.js
│   ├── SplashScene.js
│   ├── MenuScene.js
│   ├── OptionsScene.js
│   ├── DifficultyScene.js
│   ├── GameScene.js
│   └── GameOverScene.js
└── assets/
    ├── images/
    │   ├── joker.png
    │   ├── topo1.png
    │   ├── topo2.png
    │   ├── topo3.png
    │   └── topo4.png
    └── audio/
        ├── menu_music.mp3
        └── lastsurprise.mp3
```

---

## Cómo ejecutar en el navegador

El juego requiere un servidor local para cargar correctamente las imágenes y el audio. No funciona abriéndolo con doble clic.

**Opción 1 — Python (recomendado):**
```bash
cd Persona5Arcade
python -m http.server 8080
```
Abrir el navegador en `http://localhost:8080`

**Opción 2 — VS Code Live Server:**
1. Instalar la extensión Live Server en VS Code
2. Clic derecho en `index.html`
3. Seleccionar `Open with Live Server`

---

## Cómo generar el APK para Android

### Requisitos previos
- Node.js → https://nodejs.org
- Android Studio → https://developer.android.com/studio

### Primera vez
```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
```
Durante `cap init` introducir:
- Nombre de la app: `Persona 5 Arcade`
- Package ID: `com.tunombre.persona5arcade`

Mover los archivos del juego a la carpeta `www/` y asegurarse de que `capacitor.config.json` contiene:
```json
{
  "webDir": "www"
}
```

### Compilar y abrir en Android Studio
```bash
npx cap add android
npx cap sync
npx cap open android
```

### Generar el APK
Dentro de Android Studio:
- **Debug (para pruebas):** `Build → Build Bundle(s) / APK(s) → Build APK(s)`
  - Salida: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release (para distribuir):** `Build → Generate Signed Bundle / APK`
  - Requiere un keystore propio

### Instalar en el móvil sin Play Store
1. Activar `Ajustes → Seguridad → Fuentes desconocidas` en el dispositivo Android
2. Transferir el APK por USB, WhatsApp o Google Drive
3. Abrir el archivo desde el móvil e instalar

---

## Mecánicas del juego

| Elemento | Descripción |
|---|---|
| Vida | El jugador empieza con 100 HP |
| Topo escapado | Resta entre 15 y 30 HP según el tipo |
| Golpe acertado | Recupera HP según la racha de fallos acumulada |
| Game Over | Si la vida llega a 0 la partida termina |
| Duración | 60 segundos por partida |
| Cuadrícula | 9 hoyos en formato 3×3 |

### Puntos de Destreza (0–3)
Al terminar la partida se calculan según dos factores:

- **Vida final:** ≥ 80% → +1.5 pts · ≥ 50% → +1 pt · < 50% → +0.5 pts
- **Topos cazados:** ≥ 30 → +1.5 pts · ≥ 15 → +1 pt · < 15 → +0.5 pts

El total se redondea y se limita a 3.

### Dificultades

| Dificultad | Tiempo de spawn | Tiempo visible | Máx. simultáneos |
|---|---|---|---|
| Fácil | 1800 ms | 2500 ms | 2 |
| Normal | 1200 ms | 1800 ms | 3 |
| Difícil | 750 ms | 1000 ms | 4 |

---

## Escenas

| Escena | Función |
|---|---|
| `BootScene` | Carga todos los assets (imágenes y audio) y genera texturas procedurales |
| `SplashScene` | Pantalla de presentación animada al estilo Persona 5, se puede saltar |
| `MenuScene` | Menú principal con música y botones de navegación |
| `OptionsScene` | Slider de volumen e instrucciones del juego |
| `DifficultyScene` | Selector de dificultad antes de empezar la partida |
| `GameScene` | Lógica completa de la partida |
| `GameOverScene` | Resultados, estrellas de destreza y opciones de rejugar |

---

## Tecnologías utilizadas

- **Phaser 3.60** — motor del juego
- **Capacitor** — exportación a Android
- **Web Audio API** — efectos de sonido procedurales
- **HTML/CSS/JS** — animaciones de los bordes laterales

---

## Personalización

### Añadir nuevos tipos de topo
En `main.js`, añadir una entrada al array `MOLE_TYPES`:
```javascript
{ name: 'NuevoVillano', key: 'topo5', points: 30, damage: 35 }
```
Y colocar la imagen `topo5.png` en `assets/images/`.

### Cambiar la música
Sustituir los archivos en `assets/audio/` y actualizar las referencias en `BootScene.js`:
```javascript
this.load.audio('bgm_menu', 'assets/audio/tu_musica_menu.mp3');
this.load.audio('bgm_game', 'assets/audio/tu_musica_juego.mp3');
```

### Ajustar la duración de la partida
En `main.js`:
```javascript
gameDuration: 60  // segundos
```
