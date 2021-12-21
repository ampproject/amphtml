# Bento Accordion

Questo componente consente di visualizzare sezioni comprimibili ed espandibili di contenuti. Esso fornisce agli spettatori un modo per dare un'occhiata alla struttura del contenuto e accedere a qualsiasi sezione. Un efficace utilizzo del componente riduce le esigenze di scorrimento sui dispositivi mobili.

-   Un componente Bento Accordion accetta uno o più elementi `<section>` come discendenti diretti.
-   Ogni elemento `<section>` deve contenere esattamente due discendenti diretti.
-   Il primo discendente in un elemento `<section>` è l'intestazione della sezione Bento Accordion in questione. Deve essere un elemento di intestazione come `<h1>-<h6>` o `<header>` .
-   Il secondo discendente in un elemento `<section>` è il contenuto espandibile/comprimibile.
    -   Può trattarsi di qualsiasi tag consentito da [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   Un clic o un tocco sull'elemento `<section>` fa espandere o comprimere la sezione.
-   Un componente Bento Accordion con `id` definito conserva lo stato compresso o espanso di ogni sezione finché l'utente rimane nel tuo dominio.

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-accordion>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Esempio: inclusione tramite `<script>`

L'esempio seguente contiene un componente `bento-accordion` con tre sezioni. L'attributo `expanded` nella terza sezione la espande al caricamento della pagina.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### Interattività e utilizzo dell'API

I componenti compatibili con Bento utilizzati in modo autonomo garantiscono una notevole interattività attraverso le loro API. L'API del componente `bento-accordion` è accessibile includendo il seguente tag dello script nel documento:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Azioni

##### toggle()

L'azione `toggle` inverte lo stato `expanded` e `collapsed` delle sezioni del componente `bento-accordion`. Quando viene chiamata senza argomenti, tale azione inverte lo stato di tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

L'azione `expand` espande le sezioni del componente `bento-accordion`. Se una sezione è già espansa, non cambia stato. Quando viene chiamata senza argomenti, tale azione espande tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

L'azione `collapse` comprime le sezioni del componente `bento-accordion`. Se una sezione è già compressa, non cambia stato. Quando viene chiamata senza argomenti, tale azione comprime tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Eventi

L'API di `bento-accordion` consente di registrarsi e rispondere ai seguenti eventi:

##### expand

Questo evento viene attivato quando una sezione della struttura è espansa e viene inviato dalla sezione espansa.

Consultare l'esempio riportato di seguito.

##### collapse

Questo evento viene attivato quando una sezione della struttura è compressa e viene inviato dalla sezione compressa.

Nell'esempio seguente, la `section 1` resta in ascolto dell'evento `expand` ed espande la `section 2` quando viene espansa. La `section 2` resta in ascolto dell'evento `collapse` e comprime la `section 1` quando viene compressa.

Consultare l'esempio riportato di seguito.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Attributi

#### animate

Includendo l'attributo `animate` in `<bento-accordion>`, è possibile aggiungere un'animazione di "apertura" della struttura quando il contenuto è espanso, e un'animazione di "chiusura" quando la struttura è compressa.

Questo attributo può essere configurato con una [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Applicando l'attributo `expanded` a una struttura `<section>` nidificata, è possibile espandere tale sezione quando la pagina viene caricata.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Consente l'espansione di una sola sezione alla volta applicando l'attributo `expand-single-section` all'elemento `<bento-accordion>`. Ciò significa che se un utente tocca una `<section>` compressa, essa si espanderà e comprimerà le altre `<section>` espanse.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Stile

Il selettore di elementi di `bento-accordion` permette di definire liberamente lo stile della struttura a soffietto.

Nel definire lo stile di una struttura amp-accordion, può essere utile tenere in considerazione i seguenti aspetti:

-   Gli elementi `bento-accordion` sono sempre di tipo `display: block`.
-   `float` non permette di applicare stili a elementi `<section>`, né a intestazioni e contenuti.
-   Una sezione espansa applica l'attributo `expanded` all'elemento `<section>`.
-   L'elemento dei contenuti è fissato con l'attributo `overflow: hidden` e quindi non può avere barre di scorrimento.
-   I margini degli elementi `<bento-accordion>`, `<section>`, intestazione e contenuti sono impostati su `0`, ma possono essere sovrascritti negli stili personalizzati.
-   Sia l'intestazione che gli elementi dei contenuti sono di tipo `position: relative`.

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoAccordion>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Interattività e utilizzo dell'API

I componenti Bento garantiscono una notevole interattività attraverso le loro API. L'API del componente `BentoAccordion` è accessibile passando un elemento `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Azioni

L'API di `BentoAccordion` consente di eseguire le seguenti azioni:

##### toggle()

L'azione `toggle` inverte lo stato `expanded` e `collapsed` delle sezioni del componente `bento-accordion`. Quando viene chiamata senza argomenti, tale azione inverte lo stato di tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

L'azione `expand` espande le sezioni del componente `bento-accordion`. Se una sezione è già espansa, non cambia stato. Quando viene chiamata senza argomenti, tale azione espande tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

L'azione `collapse` comprime le sezioni del componente `bento-accordion`. Se una sezione è già compressa, non cambia stato. Quando viene chiamata senza argomenti, tale azione comprime tutte le sezioni della struttura a soffietto. Per indicare una sezione specifica, occorre aggiungere l'argomento `section` e usare il suo <code>id</code> corrispondente come valore.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Eventi

L'API di Bento Accordion consente di rispondere ai seguenti eventi:

##### onExpandStateChange

Questo evento viene attivato su una sezione della struttura quando è espansa o compressa ed è inviato dalla sezione espansa.

Consultare l'esempio riportato di seguito.

##### onCollapse

Questo evento viene attivato su una sezione della struttura quando è compressa e viene inviato dalla sezione compressa.

Nell'esempio seguente, la `section 1` resta in ascolto dell'evento `expand` ed espande la `section 2` quando viene espansa. La `section 2` resta in ascolto dell'evento `collapse` e comprime la `section 1` quando è compressa.

Consultare l'esempio riportato di seguito.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoSoundcloud` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Oppure tramite `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Oggetti

#### BentoAccordion

##### animate

Se l'opzione è impostata su true, la struttura utilizzerà un'animazione di "apertura" / "chiusura" durante l'espansione e la compressione di ciascuna sezione. Valore predefinito: `false`

##### expandSingleSection

Se l'opzione è impostata su true, l'espansione di 1 sezione comprime automaticamente tutte le altre sezioni. Valore predefinito: `false`

#### BentoAccordionSection

##### animate

Se l'opzione è impostata su true, la struttura utilizzerà un'animazione di "apertura" / "chiusura" durante l'espansione e la compressione della sezione. Valore predefinito: `false`

##### expanded

Se l'opzione è impostata su true, espande la sezione. Valore predefinito: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Richiamata per ascoltare le modifiche allo stato di espansione. Accetta come parametro un flag booleano che indica se la sezione è stata appena espansa (`false` indica che la sezione è stata compressa)

#### BentoAccordionHeader

#### Oggetti comuni

Questo componente supporta gli [oggetti comuni](../../../docs/spec/bento-common-props.md) per i componenti React e Preact.

BentoAccordionHeader non supporta ancora oggetti personalizzati

#### BentoAccordionContent

#### Oggetti comuni

Questo componente supporta gli [oggetti comuni](../../../docs/spec/bento-common-props.md) per i componenti React e Preact.

BentoAccordionHeader non supporta ancora oggetti personalizzati
