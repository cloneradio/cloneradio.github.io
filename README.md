# Clone Radio — música para programar, sin ruido

Una página mínima que abre una ventana a la radio que no duerme. Pequeña, directa y honesta: presionas play y dejas que el flujo te lleve mientras escribes código. Sin pestañas extra, sin menús innecesarios, solo tú, el teclado y una corriente continua de música pensada para entrar en foco.

- En vivo: https://neils.lat
- Inspirado por: freeCodeCamp Code Radio, https://coderadio.freecodecamp.org/

## ¿Qué es esto?
Un reproductor web que se conecta al stream oficial de Code Radio y muestra lo esencial:

- Play/Pause con botón o tecla espacio.
- Volumen con slider, teclas ↑/↓ y mute al tocar el ícono.
- “Now Playing”: título, artista y carátula del álbum.
- Progreso y tiempo estimado de la pista actual.
- Conteo de oyentes en tiempo real.
- Fondo sobrio en video: `assets/videos/teclear.mp4`.

Todo en HTML, CSS y JavaScript puro. Sin frameworks. Sin build.

## Cómo usarlo
- Abre `index.html` directamente en tu navegador, o
- Sirve la carpeta con tu servidor estático favorito (Live Server, http-server, nginx, etc.).

## Personalización rápida
- Fondo: reemplaza `assets/videos/teclear.mp4` por un video con el mismo nombre, o edita `script.js` (const `availableMedia`) si quieres alternar otros fondos.
- Colores y estilo: ajusta variables en `style.css` (`:root`).
- Iconos/pwa: favicons en `assets/favicon/` y `manifest.json` ya enlazados en `index.html`.

## Estructura
```
CNAME
index.html
README.md
script.js
style.css
assets/
	favicon/
		... (icons y manifest)
	videos/
		teclear.mp4
```

## Tecnología y fuentes
- Stream: `https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3`
- Now Playing API: `https://coderadio-admin-v2.freecodecamp.org/api/nowplaying/coderadio`

## Créditos
Todo el crédito por la música y el stream es de freeCodeCamp y sus creadores. Este proyecto es un homenaje y una interfaz alternativa minimalista para escuchar mientras programas.

## Nota
El sitio se publica con GitHub Pages y dominio personalizado (`neils.lat`). Si te ayuda a entrar en flow, misión cumplida.

