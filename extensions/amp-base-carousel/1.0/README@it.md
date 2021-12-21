# Bento Carousel

Una generica sequenza che permette la visualizzazione di più contenuti simili lungo un asse orizzontale o verticale.

Ciascuno dei discendenti diretti del componente è considerato un elemento della sequenza. Ciascuno di questi nodi può avere a sua volta discendenti.

La sequenza è costituita da un numero arbitrario di elementi, e da frecce di navigazione opzionali per andare avanti o indietro di un singolo elemento.

La sequenza avanza tra gli elementi se l'utente scorre o utilizza i pulsanti freccia personalizzabili.

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-base-carousel>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Esempio: inclusione tramite `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Interattività e utilizzo dell'API

I componenti compatibili con Bento utilizzati in modo autonomo garantiscono una notevole interattività attraverso le loro API. L'API del componente `bento-base-carousel` è accessibile includendo il seguente tag dello script nel documento:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Azioni

L'API di `bento-base-carousel` consente di eseguire le seguenti azioni:

##### next()

Sposta la sequenza in avanti di <code>advance-count</code> diapositive.

```javascript
api.next();
```

##### prev()

Sposta la sequenza indietro di <code>advance-count</code> diapositive.

```javascript
api.prev();
```

##### goToSlide(index: number)

Sposta la sequenza sulla diapositiva specificata dall'argomento `index`. Nota: l'argomento `index` sarà portato a un valore maggiore o uguale a `0` e minore del numero di diapositive fornite.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Eventi

L'API di `bento-base-carousel` consente di registrarsi e rispondere ai seguenti eventi:

##### slideChange

Questo evento viene attivato quando l'indice visualizzato dalla sequenza è cambiato. Il nuovo indice è disponibile tramite `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo di contenitore

Il componente `bento-base-carousel` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Cambio diapositiva da destra a sinistra

`<bento-base-carousel>` richiede di specificare quando è utilizzato in contesti con scrittura da destra a sinistra (rtl) (ad es. pagine in arabo, ebraico). Sebbene la sequenza funzioni normalmente anche senza questa indicazione, potrebbero verificarsi dei bug. Per indicare al componente che deve funzionare in un contesto `rtl`, procedere come segue:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Se la sequenza è usata in un contesto RTL ma occorre farla funzionare in modalità LTR, è possibile definire esplicitamente l'attributo `dir="ltr"` sulla struttura.

### Layout diapositive

Le dimensione delle diapositive è fissata automaticamente dalla sequenza quando **non** si indica l'attributo `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Le diapositive hanno un'altezza implicita durante la disposizione della struttura. Questa situazione può essere facilmente modificata tramite CSS. Quando si specifica l'altezza, la diapositiva sarà centrata verticalmente all'interno della struttura della sequenza.

Per centrare orizzontalmente il contenuto delle diapositive nella struttura, si consiglia di creare un elemento contenitore e utilizzarlo per centrare il contenuto.

### Numero di diapositive visibili

Quando si modifica il numero di diapositive visibili utilizzando l'attributo `visible-slides` in risposta a una media query, probabilmente sarà necessario modificare le dimensioni della struttura in modo che corrisponda al nuovo numero di diapositive visibili. Ad esempio, per mostrare tre diapositive alla volta con proporzioni uno a uno, servirà una proporzione tre a uno per la struttura della sequenza stessa. Allo stesso modo, per mostrate quattro diapositive alla volta servirà una proporzione quattro a uno. Inoltre, quando si modifica l'attributo `visible-slides`, sarà anche probabilmente necessario modificare l'attributo `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Attributi

#### Media Query

Gli attributi per `<bento-base-carousel>` possono essere configurati per utilizzare diverse opzioni in base a una [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Numero di diapositive visibili

##### mixed-length

Può essere `true` o `false`; il valore predefinito è `false`. Se l'opzione vale true, la struttura utilizza tutta la larghezza disponibile (o l'altezza se la sequenza è orizzontale) per ciascuna diapositiva. Ciò consente di utilizzare una sequenza di diapositive di diverse larghezze.

##### visible-count

Parametro numerico, il cui valore predefinito è `1`. Determina quante diapositive devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive. Questa opzione viene ignorata quando l'attributo `mixed-length` è `true`.

##### advance-count

Parametro numerico, il cui valore predefinito è `1`. Determina il numero di diapositive che saranno saltate quando l'utente utilizza le frecce di navigazione alla diapositiva precedente o successiva. Questa opzione è utile quando si indica l'attributo `visible-count`.

#### Avanzamento automatico

##### auto-advance

Può valere `true` o `false`; il valore predefinito è `false`. Fa avanzare automaticamente la sequenza alla diapositiva successiva dopo un ritardo predefinito. Se l'utente cambia manualmente diapositiva, l'avanzamento automatico viene interrotto. Se l'opzione `loop` non è abilitata, quando si raggiunge l'ultimo elemento, l'avanzamento automatico riparte dal primo elemento.

##### auto-advance-count

Parametro numerico, il cui valore predefinito è `1`. Determina il numero di diapositive che saranno saltate con l'avanzamento automatico della sequenza. Questa opzione è utile quando si indica l'attributo `visible-count`.

##### auto-advance-interval

Parametro numerico, il cui valore predefinito è `1000`. Specifica l'intervallo di tempo in millisecondi per gli avanzamenti automatici tra le diapositive della sequenza.

##### auto-advance-loops

Parametro numerico, il cui valore predefinito è `∞`. Indica il numero di volte in cui la sequenza deve effettuare un avanzamento completo di tutte le diapositive prima di fermarsi.

#### Snapping

##### snap

Può valere `true` o `false`; il valore predefinito è `true`. Determina se la sequenza deve effettuare o meno lo snapping delle diapositive durante lo scorrimento.

##### snap-align

Può valere `start` o `center`. Quando l'opzione è impostata per eseguire l'allineamento iniziale, l'inizio di una diapositiva (ad es. il bordo sinistro, in caso di allineamento orizzontale) è allineato con la posizione iniziale della sequenza. Quando l'opzione è impostata per eseguire l'allineamento al centro, il centro di una diapositiva è allineato con il centro della sequenza.

##### snap-by

Parametro numerico, il cui valore predefinito è `1`. Questo attributo determina la granularità dello snapping ed è utile quando si usa `visible-count`.

#### Opzioni varie

##### controls

Può valere `"always"`, `"auto"` o `"never"` e il suo valore predefinito è `"auto"`. Questo argomento determina se e quando saranno visualizzate le frecce di navigazione avanti/indietro. Nota: quando `outset-arrows` vale `true`, le frecce vengono mostrate sempre (`"always"`).

-   `always`: le frecce sono sempre visualizzate.
-   `auto`: le frecce sonio visualizzate quando l'interazione più recente dell'utente sulla sequenza è avvenuta tramite mouse, mentre non sono visualizzate quando tale interazione è avvenuta tramite tocco. Al primo caricamento su dispositivi touch, le frecce vengono visualizzate fino alla prima interazione.
-   `never`: le frecce non sono mai visualizzate.

##### diapositiva

Parametro numerico, con valore predefinito `0`. Esso determina la diapositiva iniziale mostrata nella sequenza. Tale opzione può essere modificata con `Element.setAttribute` che permette di controllare la diapositiva attualmente visualizzata.

##### loop

Può valere `true` o `false`; il valore predefinito è `false` quando l'attributo è omesso. Quando l'opzione vale true, l'utente potrà spostarsi dal primo all'ultimo elemento della sequenza e viceversa. Perché il ciclo delle diapositive possa svolgersi, il numero delle diapositive della sequenza deve essere almeno pari a tre volte il valore di `visible-count`.

##### orientation

Può valere `horizontal` o `vertical`; il valore predefinito è `horizontal`. Quando l'attributo vale `horizontal` la sequenza sarà disposta orizzontalmente e l'utente potrà scorrere le diapositive verso sinistra e verso destra. Quando il valore è `vertical`, la sequenza sarà disposta verticalmente e l'utente potrà scorrere le diapositive verso l'alto e verso il basso.

### Stile

Il selettore di elementi di `bento-base-carousel` permette di definire liberamente lo stile della sequenza.

#### Personalizzazione dei pulsanti freccia

I pulsanti freccia possono essere personalizzati usando un proprio markup. Ad esempio, è possibile ricreare lo stile predefinito con i seguenti codici HTML e CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoBaseCarousel>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Interattività e utilizzo dell'API

I componenti Bento garantiscono una notevole interattività attraverso le loro API. L'API del componente `BentoBaseCarousel` è accessibile passando un elemento `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Azioni

L'API di `BentoBaseCarousel` consente di eseguire le seguenti azioni:

##### next()

Sposta la sequenza in avanti di `advanceCount` diapositive.

```javascript
ref.current.next();
```

##### prev()

Sposta la sequenza indietro di `advanceCount` diapositive.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Sposta la sequenza sulla diapositiva specificata dall'argomento `index`. Nota: l'argomento `index` sarà portato a un valore maggiore o uguale a `0` e minore del numero di diapositive fornite.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Eventi

L'API di `BentoBaseCarousel` consente di registrarsi e rispondere ai seguenti eventi:

##### onSlideChange

Questo evento viene attivato quando l'indice visualizzato dalla sequenza è cambiato.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoBaseCarousel` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Oppure tramite `className`:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Cambio da destra a sinistra

`<BentoBaseCarousel>` richiede di specificare quando è utilizzato in contesti con scrittura da destra a sinistra (rtl) (ad es. pagine in arabo, ebraico). Sebbene la sequenza funzioni normalmente anche senza questa indicazione, potrebbero verificarsi dei bug. Per indicare al componente che deve funzionare in un contesto `rtl`, procedere come segue:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Se la sequenza è usata in un contesto RTL ma occorre farla funzionare in modalità LTR, è possibile definire esplicitamente l'attributo `dir="ltr"` sulla struttura.

### Layout diapositive

Le dimensione delle diapositive è fissata automaticamente dalla sequenza quando **non** si indica l'attributo `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Le diapositive hanno un'altezza implicita durante la disposizione della struttura. Questa situazione può essere facilmente modificata tramite CSS. Quando si specifica l'altezza, la diapositiva sarà centrata verticalmente all'interno della struttura della sequenza.

Per centrare orizzontalmente il contenuto delle diapositive nella struttura, si consiglia di creare un elemento contenitore e utilizzarlo per centrare il contenuto.

### Numero di diapositive visibili

Quando si modifica il numero di diapositive visibili utilizzando `visibleSlides` in risposta a una media query, probabilmente sarà necessario modificare le dimensioni della struttura in modo che corrisponda al nuovo numero di diapositive visibili. Ad esempio, per mostrare tre diapositive alla volta con proporzioni uno a uno, servirà una proporzione tre a uno per la struttura della sequenza stessa. Allo stesso modo, per mostrate quattro diapositive alla volta servirà una proporzione quattro a uno. Inoltre, quando si modifica l'attributo `visibleSlides`, sarà anche probabilmente necessario modificare l'attributo `advanceCount`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Oggetti

#### Numero di diapositive visibili

##### mixedLength

Può essere `true` o `false`; il valore predefinito è `false`. Se l'attributo vale true, la struttura utilizza tutta la larghezza disponibile (o l'altezza se la sequenza è orizzontale) per ciascuna diapositiva. Ciò consente di utilizzare una sequenza di diapositive di diverse larghezze.

##### visibleCount

Parametro numerico, il cui valore predefinito è `1`. Determina quante diapositive devono essere visualizzate in un determinato momento. I valori frazionari possono essere utilizzati per rendere visibile parte di una o più diapositive aggiuntive. Questa opzione viene ignorata quando `mixedLength` è `true`.

##### advanceCount

Parametro numerico, il cui valore predefinito è `1`. Determina il numero di diapositive che saranno saltate quando l'utente utilizza le frecce di navigazione alla diapositiva precedente o successiva. Questa opzione è utile quando si indica l'attributo `visibleCount`.

#### Avanzamento automatico

##### autoAdvance

Può valere `true` o `false`; il valore predefinito è `false`. Fa avanzare automaticamente la sequenza alla diapositiva successiva dopo un ritardo predefinito. Se l'utente cambia manualmente diapositiva, l'avanzamento automatico viene interrotto. Se l'opzione `loop` non è abilitata, quando si raggiunge l'ultimo elemento, l'avanzamento automatico riparte dal primo elemento.

##### autoAdvanceCount

Parametro numerico, il cui valore predefinito è `1`. Determina il numero di diapositive che saranno saltate con l'avanzamento automatico della sequenza. Questa opzione è utile quando si indica l'attributo `visible-count`.

##### autoAdvanceInterval

Parametro numerico, il cui valore predefinito è `1000`. Specifica l'intervallo di tempo in millisecondi per gli avanzamenti automatici tra le diapositive della sequenza.

##### autoAdvanceLoops

Parametro numerico, il cui valore predefinito è `∞`. Indica il numero di volte in cui la sequenza deve effettuare un avanzamento completo di tutte le diapositive prima di fermarsi.

#### Snapping

##### snap

Può valere `true` o `false`; il valore predefinito è `true`. Determina se la sequenza deve effettuare o meno lo snapping delle diapositive durante lo scorrimento.

##### snapAlign

Può valere `start` o `center`. Quando l'opzione è impostata per eseguire l'allineamento iniziale, l'inizio di una diapositiva (ad es. il bordo sinistro, in caso di allineamento orizzontale) è allineato con la posizione iniziale della sequenza. Quando l'opzione è impostata per eseguire l'allineamento al centro, il centro di una diapositiva è allineato con il centro della sequenza.

##### snapBy

Parametro numerico, il cui valore predefinito è `1`. Questo attributo determina la granularità dello snapping ed è utile quando si usa `visible-count`.

#### Opzioni varie

##### controls

Può valere `"always"`, `"auto"` o `"never"` e il suo valore predefinito è `"auto"`. Questo argomento determina se e quando saranno visualizzate le frecce di navigazione avanti/indietro. Nota: quando `outset-arrows` vale `true`, le frecce vengono mostrate sempre (`"always"`).

-   `always`: le frecce sono sempre visualizzate.
-   `auto`: le frecce sonio visualizzate quando l'interazione più recente dell'utente sulla sequenza è avvenuta tramite mouse, mentre non sono visualizzate quando tale interazione è avvenuta tramite tocco. Al primo caricamento su dispositivi touch, le frecce vengono visualizzate fino alla prima interazione.
-   `never`: le frecce non sono mai visualizzate.

##### defaultSlide

Parametro numerico, il cui valore predefinito è `0` . Questo determina la diapositiva iniziale mostrata nella sequenza.

##### loop

Può valere `true` o `false`; il valore predefinito è `false` quando l'attributo è omesso. Quando l'opzione vale true, l'utente potrà spostarsi dal primo all'ultimo elemento della sequenza e viceversa. Perché il ciclo delle diapositive possa svolgersi, il numero delle diapositive della sequenza deve essere almeno pari a tre volte il valore di `visible-count`.

##### orientation

Può valere `horizontal` o `vertical`; il valore predefinito è `horizontal`. Quando l'attributo vale `horizontal` la sequenza sarà disposta orizzontalmente e l'utente potrà scorrere le diapositive verso sinistra e verso destra. Quando il valore è `vertical`, la sequenza sarà disposta verticalmente e l'utente potrà scorrere le diapositive verso l'alto e verso il basso.

### Stile

Il selettore di elementi di `BentoBaseCarousel` permette di definire liberamente lo stile della sequenza.

#### Personalizzazione dei pulsanti freccia

I pulsanti freccia possono essere personalizzati usando un proprio markup. Ad esempio, è possibile ricreare lo stile predefinito con i seguenti codici HTML e CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
