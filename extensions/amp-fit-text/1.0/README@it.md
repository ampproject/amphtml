# Bento Fit Text

Individua la migliore dimensione dei caratteri per adattare tutto il contenuto di un dato testo all'interno dello spazio disponibile.

Il contenuto previsto per Bento Fit Text è testo, ma il componente può ricevere anche altri contenuti, inline o meno.

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-fit-text>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Esempio: inclusione tramite `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### Contenuti in eccesso

Se il contenuto di un componente `bento-fit-text` eccede lo spazio disponibile, anche con una dimensione `min-font-size` specificata, il contenuto in eccesso viene tagliato e nascosto. I browser basati su WebKit e Blink mostrano puntini di sospensione per indicare il contenuto in eccesso nascosto.

Nell'esempio seguente, abbiamo specificato una dimensione `min-font-size` di `40` e abbiamo aggiunto contenuto in eccesso all'interno dell'elemento `bento-fit-text`. In questo modo il contenuto supera la dimensione del blocco fisso che è il suo elemento padre, quindi il testo viene troncato per adattarsi al contenitore.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo di contenitore

Il componente `bento-fit-text` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Considerazioni di accessibilità ai contenuti in eccesso

Sebbene i contenuti in eccesso siano troncati _visivamente_ per adattarsi al contenitore, essi sono ancora presenti nel documento. Non è una buona idea servirsi di tale modalità di gestione dei contenuti in eccesso come semplice soluzione per "accumulare" grandi quantità di contenuti nelle pagine. Anche se la cosa sembra funzionare dal punto di vista visivo, tuttavia può rendere le pagine troppo prolisse per gli utenti che si servono di assistive technologies (come le utilità di lettura dello schermo), dato che per questi utenti anche i contenuti troncati saranno letti/comunicati integralmente.

### Attributi

#### Media Query

Gli attributi per `<bento-fit-text>` possono essere configurati per utilizzare diverse opzioni in base a una [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

#### `min-font-size`

Indica un intero che rappresenta la dimensione minima in pixel dei caratteri utilizzabili da `bento-fit-text`.

#### `max-font-size`

Indica un intero che rappresenta la dimensione massima in pixel dei caratteri utilizzabili da `bento-fit-text`.

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoFitText>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoFitText` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Oppure tramite `className`:

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Oggetti

#### `minFontSize`

Indica un intero che rappresenta la dimensione minima in pixel dei caratteri utilizzabili da `bento-fit-text`.

#### `maxFontSize`

Indica un intero che rappresenta la dimensione massima in pixel dei caratteri utilizzabili da `bento-fit-text`.
