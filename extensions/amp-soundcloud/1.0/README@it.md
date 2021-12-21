# Bento Soundcloud

Permette di incorporare una clip [Soundcloud](https://soundcloud.com).

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-soundcloud>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Esempio: inclusione tramite `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo di contenitore

Il componente `bento-soundcloud` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Attributi

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Questo attributo è obbligatorio se <code>data-playlistid</code> non è definito.<br> Il valore di questo attributo è l'Identificativo di una traccia, un numero intero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Questo attributo è obbligatorio se <code>data-trackid</code> non è definito. Il valore di questo attributo è l'Identificativo di una playlist, un numero intero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (opzionale)</strong></td>
    <td>Il token segreto della traccia, se è privata.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (opzionale)</strong></td>
    <td>Se l'opzione è impostata su <code>true</code>, la visualizzazione è in modalità "Visual" alla massima larghezza; in caso contrario, la visualizzazione è in modalità "Classic". Il valore predefinito è <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (opzionale)</strong></td>
    <td>Questo attributo permette di sovrascrivere il colore personalizzato della modalità "Classic". L'attributo viene ignorato in modalità "Visual". Il colore può essere indicato con un valore esadecimale, senza il # iniziale (ad esempio, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoSoundcloud>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoSoundcloud` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Oppure tramite `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Oggetti

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Questo attributo è obbligatorio se <code>data-playlistid</code> non è definito.<br> Il valore di questo attributo è l'Identificativo di una traccia, un numero intero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Questo attributo è obbligatorio se <code>data-trackid</code> non è definito. Il valore di questo attributo è l'Identificativo di una playlist, un numero intero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (opzionale)</strong></td>
    <td>Il token segreto della traccia, se è privata.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (opzionale)</strong></td>
    <td>Se l'opzione è impostata su <code>true</code>, la visualizzazione è in modalità "Visual" alla massima larghezza; in caso contrario, la visualizzazione è in modalità "Classic". Il valore predefinito è <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (opzionale)</strong></td>
    <td>Questo attributo permette di sovrascrivere il colore personalizzato della modalità "Classic". L'attributo viene ignorato in modalità "Visual". Il colore può essere indicato con un valore esadecimale, senza il # iniziale (ad esempio, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
