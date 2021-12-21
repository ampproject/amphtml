# Bento Stream Gallery

## Utilizzo

Il componente Bento Stream Gallery serve per visualizzare più contenuti simili contemporaneamente lungo un asse orizzontale. Per implementare un'interfaccia utente più personalizzata, consultare l'elemento [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md).

 Bento Stream Gallery può essere utilizzato come componente web ([`<bento-stream-gallery>`](#web-component)) o come componente funzionale Preact/React ([`<BentoStreamGallery>`](#preactreact-component)).

### Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-stream-gallery>`.

#### Esempio: importazione tramite npm

[example preview="top-frame" playground="false"]

Eseguire l'installazione tramite npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### Esempio: inclusione tramite `<script>`

L'esempio seguente contiene un componente `bento-stream-gallery` con tre sezioni. L'attributo `expanded` nella terza sezione la espande al caricamento della pagina.

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <script async src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">

</head>
<body>
  <bento-stream-gallery>
    <img src="img1.png">
    <img src="img2.png">
    <img src="img3.png">
    <img src="img4.png">
    <img src="img5.png">
    <img src="img6.png">
    <img src="img7.png">
  </bento-stream-gallery>
  <script>
    (async () => {
      const streamGallery = document.querySelector('#my-stream-gallery');
      await customElements.whenDefined('bento-stream-gallery');
      const api = await streamGallery.getApi();

      // programatically expand all sections
      api.next();
      // programatically collapse all sections
      api.prev();
      // programatically go to slide
      api.goToSlide(4);
    })();
  </script>
</body>
```

[/example]

#### Interattività e utilizzo dell'API

I componenti compatibili con Bento utilizzati in modo autonomo garantiscono una notevole interattività attraverso le loro API. L'API del componente `bento-stream-gallery` è accessibile includendo il seguente tag dello script nel documento:

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### Azioni

**next()**

Sposta in avanti la sequenza in base al numero di diapositive visibili.

```js
api.next();
```

**prev()**

Sposta indietro la sequenza in base al numero di diapositive visibili.

```js
api.prev();
```

**goToSlide(index: number)**

Sposta la sequenza sulla diapositiva specificata dall'argomento `index`. Nota: l'argomento `index` sarà portato a un valore maggiore o uguale a <code>0</code> e minore del numero di diapositive fornite.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Eventi

L'API del componente Bento Stream Gallery consente di registrarsi e rispondere ai seguenti eventi:

**slideChange**

Questo evento viene attivato quando l'indice visualizzato dalla sequenza è cambiato. Il nuovo indice è disponibile tramite `event.data.index`.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributi

##### Comportamento

###### `controls`

Può valere `"always"`, `"auto"` o `"never"` e il suo valore predefinito è `"auto"`. Questo argomento determina se e quando saranno visualizzate le frecce di navigazione avanti/indietro. Nota: quando `outset-arrows` vale `true`, le frecce vengono mostrate sempre (`"always"`).

- `always`: le frecce sono sempre visualizzate.
- `auto`: le frecce sono visualizzate quando l'interazione più recente dell'utente sulla sequenza è avvenuta tramite mouse, mentre non sono visualizzate quando tale interazione è avvenuta tramite tocco. Al primo caricamento su dispositivi touch, le frecce vengono visualizzate fino alla prima interazione.
- `never`: le frecce non sono mai visualizzate.

###### `extra-space`

Può valere `"around"` o essere indefinito. Questo attributo determina come viene allocato lo spazio extra dopo aver visualizzato il numero calcolato di diapositive visibili nella struttura. Se è impostato il valore `"around"`, lo spazio bianco è distribuito uniformemente attorno alla sequenza con `justify-content: center`; in caso contrario, lo spazio viene allocato a destra della struttura per i documenti LTR  (da sinistra a destra) e a sinistra per i documenti RTL (da destra a sinistra).

###### `loop`

Può valere `true` o `false`; il valore predefinito è `false`. Quando l'opzione vale true, l'utente potrà spostarsi dal primo all'ultimo elemento della sequenza e viceversa. Perché il ciclo delle diapositive possa svolgersi, devono esserci almeno tre diapositive.

###### `outset-arrows`

Può valere `true` o `false`; il valore predefinito è `false`. Quando l'opzione vale true, la sequenza visualizzerà le sue frecce all'inizio e su entrambi i lati delle diapositive. Nota: con le frecce visualizzate, il contenitore delle diapositive avrà una lunghezza effettiva di 100 px in meno dello spazio assegnato al contenitore, 50 px per freccia su entrambi i lati. Se l'opzione valse false, la sequenza visualizzerà le sue frecce sovrapposte sopra i bordi sinistro e destro delle diapositive.

###### `peek`

Argomento numerico, il cui valore predefinito è `0`. Esso determina la porzione di diapositiva aggiuntiva da mostrare (su uno o entrambi i lati della diapositiva corrente) per indicare all'utente che la sequenza è scorrevole.

##### Visibilità delle diapositive della raccolta

###### `min-visible-count`

Parametro numerico, il cui valore predefinito è `1`. Determina il numero minimo di diapositive che devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive.

###### `max-visible-count`

Parametro numerico, il cui valore predefinito è [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determina il numero massimo di diapositive che devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive.

###### `min-item-width`

Parametro numerico, il cui valore predefinito è `1`. Determina la larghezza minima di ciascun elemento, utilizzata per definire quanti elementi interi possono essere visualizzati contemporaneamente all'interno della larghezza complessiva della raccolta.

###### `max-item-width`

Parametro numerico, il cui valore predefinito è [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determina la larghezza massima di ciascun elemento, utilizzata per definire quanti elementi interi possono essere visualizzati contemporaneamente all'interno della larghezza complessiva della raccolta.

##### Snapping delle diapositive

###### `slide-align`

Può valere `start` o `center`. Quando l'opzione è impostata per eseguire l'allineamento iniziale, l'inizio di una diapositiva (ad es. il bordo sinistro, in caso di allineamento orizzontale) è allineato con la posizione iniziale della sequenza. Quando l'opzione è impostata per eseguire l'allineamento al centro, il centro di una diapositiva è allineato con il centro della sequenza.

###### `snap`

Può valere `true` o `false`; il valore predefinito è `true`. Determina se la sequenza deve effettuare o meno lo snapping delle diapositive durante lo scorrimento.

#### Stile

Il selettore di elementi di `bento-stream-gallery` permette di definire liberamente lo stile della struttura streamGallery.

### Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoStreamGallery>` come componente funzionale utilizzabile con le librerie Preact o React.

#### Esempio: importazione tramite npm

[example preview="top-frame" playground="false"]

Eseguire l'installazione tramite npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import React from 'react';
import { BentoStreamGallery } from '@ampproject/bento-stream-gallery/react';
import '@ampproject/bento-stream-gallery/styles.css';

function App() {
  return (
    <BentoStreamGallery>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

[/example]

#### Interattività e utilizzo dell'API

I componenti Bento garantiscono una notevole interattività attraverso le loro API. L'API del componente `BentoStreamGallery` è accessibile passando un elemento `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoStreamGallery ref={ref}>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

##### Azioni

L'API di `BentoStreamGallery` consente di eseguire le seguenti azioni:

**next()**

Sposta la sequenza in avanti di <code>advanceCount</code> diapositive.

```javascript
ref.current.next();
```

**prev()**

Sposta la sequenza indietro di <code>advanceCount</code> diapositive.

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

Sposta la sequenza sulla diapositiva specificata dall'argomento `index`. Nota: l'argomento `index` sarà portato a un valore maggiore o uguale a `0` e minore del numero di diapositive fornite.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### Eventi

**onSlideChange**

Questo evento viene attivato quando l'indice visualizzato dalla sequenza è cambiato.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### Layout e stile

**Tipo di contenitore**

Il componente `BentoStreamGallery` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti tramite un layout CSS opportuno (come quelli definiti con le proprietà <code>width</code>). Essi sono applicabili inline:

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

Oppure tramite `className`:

```jsx
<BentoStreamGallery className='custom-styles'>
  ...
</BentoStreamGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

#### Oggetti

##### Oggetti comuni

Questo componente supporta gli [oggetti comuni](../../../docs/spec/bento-common-props.md) per i componenti React e Preact.

##### Comportamento

###### `controls`

Può valere `"always"`, `"auto"` o `"never"` e il suo valore predefinito è `"auto"`. Questo argomento determina se e quando saranno visualizzate le frecce di navigazione avanti/indietro. Nota: quando `outset-arrows` vale `true`, le frecce vengono mostrate sempre (`"always"`).

- `always`: le frecce sono sempre visualizzate.
- `auto`: le frecce sonio visualizzate quando l'interazione più recente dell'utente sulla sequenza è avvenuta tramite mouse, mentre non sono visualizzate quando tale interazione è avvenuta tramite tocco. Al primo caricamento su dispositivi touch, le frecce vengono visualizzate fino alla prima interazione.
- `never`: le frecce non sono mai visualizzate.

###### `extraSpace`

Può valere `"around"` o essere indefinito. Questo attributo determina come viene allocato lo spazio extra dopo aver visualizzato il numero calcolato di diapositive visibili nella struttura. Se è impostato il valore `"around"`, lo spazio bianco è distribuito uniformemente attorno alla sequenza con `justify-content: center`; in caso contrario, lo spazio viene allocato a destra della struttura per i documenti LTR  (da sinistra a destra) e a sinistra per i documenti RTL (da destra a sinistra).

###### `loop`

Può valere `true` o `false`; il valore predefinito è `false`. Quando l'opzione vale true, l'utente potrà spostarsi dal primo all'ultimo elemento della sequenza e viceversa. Perché il ciclo delle diapositive possa svolgersi, devono esserci almeno tre diapositive.

###### `outsetArrows`

Può valere `true` o `false`; il valore predefinito è `false`. Quando l'opzione vale true, la sequenza visualizzerà le sue frecce all'inizio e su entrambi i lati delle diapositive. Nota: con le frecce visualizzate, il contenitore delle diapositive avrà una lunghezza effettiva di 100 px in meno dello spazio assegnato al contenitore, 50 px per freccia su entrambi i lati. Se l'opzione valse false, la sequenza visualizzerà le sue frecce sovrapposte sopra i bordi sinistro e destro delle diapositive.

###### `peek`

Argomento numerico, il cui valore predefinito è `0`. Esso determina la porzione di diapositiva aggiuntiva da mostrare (su uno o entrambi i lati della diapositiva corrente) per indicare all'utente che la sequenza è scorrevole.

##### Visibilità delle diapositive della raccolta

###### `minVisibleCount`

Parametro numerico, il cui valore predefinito è `1`. Determina il numero minimo di diapositive che devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive.

###### `maxVisibleCount`

Parametro numerico, il cui valore predefinito è [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determina il numero massimo di diapositive che devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive.

###### `minItemWidth`

Parametro numerico, il cui valore predefinito è `1`. Determina la larghezza minima di ciascun elemento, utilizzata per definire quanti elementi interi possono essere visualizzati contemporaneamente all'interno della larghezza complessiva della raccolta.

###### `maxItemWidth`

Parametro numerico, il cui valore predefinito è [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determina la larghezza massima di ciascun elemento, utilizzata per definire quanti elementi interi possono essere visualizzati contemporaneamente all'interno della larghezza complessiva della raccolta.

##### Snapping delle diapositive

###### `slideAlign`

Può valere `start` o `center`. Quando l'opzione è impostata per eseguire l'allineamento iniziale, l'inizio di una diapositiva (ad es. il bordo sinistro, in caso di allineamento orizzontale) è allineato con la posizione iniziale della sequenza. Quando l'opzione è impostata per eseguire l'allineamento al centro, il centro di una diapositiva è allineato con il centro della sequenza.

###### `snap`

Può valere `true` o `false`; il valore predefinito è `true`. Determina se la sequenza deve effettuare o meno lo snapping delle diapositive durante lo scorrimento.
