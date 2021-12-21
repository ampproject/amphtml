# Bento Sidebar

Bento Sidebar può essere utilizzato come componente web [`<bento-sidebar>`](#web-component) o come componente funzionale Preact/React [`<BentoSidebar>`](#preactreact-component).

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-sidebar>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Esempio: inclusione tramite `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### Bento Toolbar

Si può creare un elemento Bento Toolbar che sarà visualizzato nella sezione `<body>` indicando l'attributo `toolbar` con una media query e un attributo `toolbar-target` con un ID elemento su un elemento `<nav>` che sia discendente diretto di `<bento-sidebar>`. L'elemento `toolbar` duplica l'elemento `<nav>` e i suoi discendenti e lo aggiunge all'elemento `toolbar-target`.

#### Comportamento

- La barra laterale può contenere barre di strumenti aggiungendo elementi nav con gli attributi `toolbar` e `toolbar-target`.
- L'elemento nav deve essere discendente di `<bento-sidebar>` e seguire questo formato: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    - Il seguente esempio rappresenta un utilizzo valido della barra degli strumenti: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
- Il comportamento della barra degli strumenti viene applicato solo mentre la media query dell'attributo `toolbar` è valida. Inoltre, nella pagina deve esistere un elemento con l'id attributo `toolbar-target` per poter applicare la barra degli strumenti.

##### Esempio: barra degli strumenti di base

Nell'esempio seguente, la pagina mostra una `toolbar` se la larghezza della finestra è minore o uguale a 767px. La `toolbar` contiene un elemento per input di ricerca. L'elemento `toolbar` sarà aggiunto all'elemento `<div id="target-element">`.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### Interattività e utilizzo dell'API

I componenti compatibili con Bento utilizzati in modo autonomo garantiscono una notevole interattività attraverso le loro API. L'API del componente `bento-sidebar` è accessibile includendo il seguente tag dello script nel documento:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Azioni

L'API di `bento-sidebar` consente di eseguire le seguenti azioni:

##### open()

Apre la barra laterale.

```javascript
api.open();
```

##### close()

Chiude la barra laterale.

```javascript
api.close();
```

##### toggle()

Inverte lo stato di apertura della barra laterale.

```javascript
api.toggle(0);
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Stili personalizzati

Lo stile del componente `bento-sidebar` può essere definito utilizzando CSS standard.

- L'attributo `width` di `bento-sidebar` può essere impostato per regolare la larghezza a un valore diverso da quello predefinito di 45px.
- Impostando l'altezza del componente `bento-sidebar` è possibile regolare l'altezza della barra laterale, se necessario. Se l'altezza supera 100vw, la barra laterale presenterà una barra di scorrimento verticale. L'altezza predefinita della barra laterale è 100vw e può essere ridotta sovrascrivendola con un elemento CSS.
- Lo stato corrente della barra laterale è indicato tramite l'attributo `open` che è impostato sul tag `bento-sidebar` quando la barra laterale è aperta sulla pagina.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### Considerazioni sull'esperienza utente

Utilizzando il componente `<bento-sidebar>`, occorre considerare che gli utenti visualizzeranno spesso la pagina su dispositivi mobili, che di solito mostrano un'intestazione in posizione fissa. Inoltre, i browser spesso visualizzano la propria intestazione fissa nella parte superiore della pagina. L'aggiunta di un altro elemento in posizione fissa nella parte superiore dello schermo potrebbe occupare la maggior parte dello spazio sullo schermo dei dispositivi mobili, mentre i contenuti potrebbero esserne penalizzati e non fornire all'utente nuove informazioni.

Per questo motivo, suggeriamo di non inserire gli inviti per l'apertura delle barre laterali in un'intestazione fissa a larghezza intera.

- La barra laterale può apparire solo sul lato sinistro o destro di una pagina.
- L'altezza massima di una barra laterale è 100vh, e se l'altezza supera i 100vh viene visualizzata una barra di scorrimento verticale. L'altezza predefinita è impostata su 100 vh è può essere sovrascritta in CSS.
- La larghezza della barra laterale può essere impostata e variata tramite CSS.
- Si <em>consiglia di utilizzare</em> il componente <code>&lt;bento-sidebar&gt;</code> come discendente diretto della sezione `<body>` per preservare l'ordine logico del DOM a scopo di accessibilità e per evitare che il suo comportamento sia alterato da un elemento contenitore. Nota: se un elemento antenato di `bento-sidebar` ha un attributo `z-index` impostato, la barra laterale potrebbe apparire sotto altri elementi (come le intestazioni), interrompendone la funzionalità.

### Attributi

#### side

Indica da quale lato della pagina deve aprirsi la barra laterale, `left` o `right`. Se l'attributo `side` non è indicato, il valore di `side` sarà ereditato dall'attributo `dir` del tag `body` ( `ltr` =&gt; `left` , `rtl` =&gt; `right`); se non ci sono attributi `dir`, il valore predefinito per `side` sarà `left`.

#### open

Questo attributo è presente quando la barra laterale è aperta.

#### toolbar

Questo attributo è presente sugli elementi discendenti `<nav toolbar="(media-query)" toolbar-target="elementID">` e accetta una media query che indica quando mostrare una barra degli strumenti. Consultare la sezione [Barra degli strumenti](#bento-toolbar) per ulteriori informazioni sull'utilizzo di tali elementi.

#### toolbar-target

Questo attributo è presente sull'elemento discendente `<nav toolbar="(media-query)" toolbar-target="elementID">` e accetta l'id di un elemento nella pagina. L'attributo `toolbar-target` collocherà la barra degli strumenti nell'id dell'elemento specificato sulla pagina, senza lo stile predefinito della barra degli strumenti. Consultare la sezione <a>Barra degli strumenti</a> per ulteriori informazioni sull'utilizzo di tali elementi.

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoSidebar>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### Bento Toolbar

Si può creare un elemento Bento Toolbar che sarà visualizzato nella sezione `<body>` indicando l'oggetto `toolbar` con una media query e un attributo `toolbarTarget` con un ID elemento su un componente `<BentoSidebarToolbar>` che sia discendente diretto di `<BentoSidebar>`. L'elemento `toolbar` duplica l'elemento `<BentoSidebarToolbar>` e i suoi discendenti e lo aggiunge all'elemento `toolbarTarget`.

#### Comportamento

- La barra laterale può contenere barre di strumenti aggiungendo elementi nav con gli oggetti `toolbar` e `toolbarTarget`.
- L'elemento nav deve essere discendente di `<BentoSidebar>` e seguire questo formato: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    - Il seguente esempio rappresenta un utilizzo valido della barra degli strumenti: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
- Il comportamento della barra degli strumenti viene applicato solo mentre la media query dell'oggetto `toolbar` è valida. Inoltre, nella pagina deve esistere un elemento con id oggetto `toolbarTarget` per poter applicare la barra degli strumenti.

##### Esempio: barra degli strumenti di base

Nell'esempio seguente, la pagina mostra una `toolbar` se la larghezza della finestra è minore o uguale a 767px. La `toolbar` contiene un elemento per input di ricerca. L'elemento `toolbar` sarà aggiunto all'elemento `<div id="target-element">`.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### Interattività e utilizzo dell'API

I componenti Bento garantiscono una notevole interattività attraverso le loro API. L'API del componente `BentoSidebar` è accessibile passando un elemento `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### Azioni

L'API di `BentoSidebar` consente di eseguire le seguenti azioni:

##### open()

Apre la barra laterale.

```javascript
ref.current.open();
```

##### close()

Chiude la barra laterale.

```javascript
ref.current.close();
```

##### toggle()

Inverte lo stato di apertura della barra laterale.

```javascript
ref.current.toggle(0);
```

### Layout e stile

Lo stile del componente `BentoSidebar` può essere definito utilizzando CSS standard.

- L'attributo `width` di `bento-sidebar` può essere impostato per regolare la larghezza a un valore diverso da quello predefinito di 45px.
- Impostando l'altezza del componente `bento-sidebar` è possibile regolare l'altezza della barra laterale, se necessario. Se l'altezza supera 100vw, la barra laterale presenterà una barra di scorrimento verticale. L'altezza predefinita della barra laterale è 100vw e può essere ridotta sovrascrivendola con un elemento CSS.

Per assicurarsi che il rendering del componente sia eseguito correttamente, occorre applicare una dimensione al componente. I relativi stili possono essere applicati inline:

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

Oppure tramite `className`:

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### Considerazioni sull'esperienza utente

Utilizzando il componente `<BentoSidebar>`, occorre considerare che gli utenti visualizzeranno spesso la pagina su dispositivi mobili, che di solito mostrano un'intestazione in posizione fissa. Inoltre, i browser spesso visualizzano la propria intestazione fissa nella parte superiore della pagina. L'aggiunta di un altro elemento in posizione fissa nella parte superiore dello schermo potrebbe occupare la maggior parte dello spazio sullo schermo dei dispositivi mobili, mentre i contenuti potrebbero esserne penalizzati e non fornire all'utente nuove informazioni.

Per questo motivo, suggeriamo di non inserire gli inviti per l'apertura delle barre laterali in un'intestazione fissa a larghezza intera.

- La barra laterale può apparire solo sul lato sinistro o destro di una pagina.
- L'altezza massima di una barra laterale è 100vh, e se l'altezza supera i 100vh viene visualizzata una barra di scorrimento verticale. L'altezza predefinita è impostata su 100 vh è può essere sovrascritta in CSS.
- La larghezza della barra laterale può essere impostata e variata tramite CSS.
- Si <em>consiglia di utilizzare</em> il componente <code>&lt;BentoSidebar&gt;</code> come discendente diretto della sezione `<body>` per preservare l'ordine logico del DOM a scopo di accessibilità e per evitare che il suo comportamento sia alterato da un elemento contenitore. Nota: se un elemento antenato di `BentoSidebar` ha un attributo `z-index` impostato, la barra laterale potrebbe apparire sotto altri elementi (come le intestazioni), interrompendone la funzionalità.

### Oggetti

#### side

Indica da quale lato della pagina deve aprirsi la barra laterale, `left` o `right`. Se l'attributo `side` non è indicato, il valore di `side` sarà ereditato dall'attributo `dir` del tag `body` ( `ltr` =&gt; `left` , `rtl` =&gt; `right`); se non ci sono attributi `dir`, il valore predefinito per `side` sarà `left`.

#### toolbar

Questo oggetto è presente sugli elementi discendenti `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` e accetta una media query che indica quando mostrare una barra degli strumenti. Consultare la sezione [Barra degli strumenti](#bento-toolbar) per ulteriori informazioni sull'utilizzo di tali elementi.

#### toolbarTarget

Questo attributo è presente sull'elemento discendente `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` e accetta l'id di un elemento nella pagina. L'oggetto `toolbarTarget` collocherà la barra degli strumenti nell'id dell'elemento specificato sulla pagina, senza lo stile predefinito della barra degli strumenti. Consultare la sezione [Barra degli strumenti](#bento-toolbar) per ulteriori informazioni sull'utilizzo di tali elementi.
