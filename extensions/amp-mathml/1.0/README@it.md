# Bento MathML

Effettua il rendering di una formula MathML in un iframe.

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-mathml>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/mathml
```

```javascript
import {defineElement as defineBentoMathml} from '@bentoproject/mathml';
defineBentoMathml();
```

### Esempio: inclusione tramite `<script>`

L'esempio seguente contiene un componente `bento-mathml` con tre sezioni. L'attributo `expanded` nella terza sezione la espande al caricamento della pagina.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-mathml-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
  />
</head>
<body>
  <h2>The Quadratic Formula</h2>
  <bento-mathml
    style="height: 40px"
    data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
  ></bento-mathml>

  <h2>Cauchy's Integral Formula</h2>
  <bento-mathml
    style="height: 41px"
    data-formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"
  ></bento-mathml>

  <h2>Double angle formula for Cosines</h2>
  <bento-mathml
    style="height: 19px"
    data-formula="\[cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ)\]"
  ></bento-mathml>

  <h2>Inline formula</h2>
  <p>
    This is an example of a formula of
    <bento-mathml
      style="height: 11px; width: 8px"
      inline
      data-formula="`x`"
    ></bento-mathml
    >,
    <bento-mathml
      style="height: 40px; width: 147px"
      inline
      data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
    ></bento-mathml>
    placed inline in the middle of a block of text.
    <bento-mathml
      style="height: 19px; width: 72px"
      inline
      data-formula="\( \cos(θ+φ) \)"
    ></bento-mathml>
    This shows how the formula will fit inside a block of text and can be styled
    with CSS.
  </p>
</body>
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-mathml {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributi

#### `data-formula` (obbligatorio)

Specifica la formula di cui eseguire il rendering.

#### `inline` (opzionale)

Se l'attributo è indicato, il componente esegue il rendering inline (`inline-block` in CSS).

#### `title` (opzionale)

Permette di definire un attributo `title` per il componente da propagare all'elemento `<iframe>` sottostante. Il valore predefinito è `"MathML formula"`.

### Stile

Il selettore di elementi `bento-mathml` permette di definire liberamente lo stile della struttura a soffietto.

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoMathml>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/mathml
```

```javascript
import React from 'react';
import {BentoMathml} from '@bentoproject/mathml/react';
import '@bentoproject/mathml/styles.css';

function App() {
  return (
    <>
      <h2>The Quadratic Formula</h2>
      <BentoMathml
        style={{height: 40}}
        formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
      ></BentoMathml>

      <h2>Cauchy's Integral Formula</h2>
      <BentoMathml
        style={{height: 41}}
        formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"
      ></BentoMathml>

      <h2>Double angle formula for Cosines</h2>
      <BentoMathml
        style={{height: 19}}
        formula="\[cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ)\]"
      ></BentoMathml>

      <h2>Inline formula</h2>
      <p>
        This is an example of a formula of{' '}
        <BentoMathml
          style={{height: 11, width: 8}}
          inline
          formula="`x`"
        ></BentoMathml>
        ,{' '}
        <BentoMathml
          style={{height: 40, width: 147}}
          inline
          formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
        ></BentoMathml>{' '}
        placed inline in the middle of a block of text.{' '}
        <BentoMathml
          style={{height: 19, width: 72}}
          inline
          formula="\( \cos(θ+φ) \)"
        ></BentoMathml>{' '}
        This shows how the formula will fit inside a block of text and can be
        styled with CSS.
      </p>
    </>
  );
}
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoMathml` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Oppure tramite `className`:

```jsx
<BentoMathml className="custom-styles">...</BentoMathml>
```

```css
.custom-styles {
  background-color: red;
  height: 40px;
  width: 147px;
}
```

### Oggetti

#### `formula` (obbligatorio)

Specifica la formula di cui eseguire il rendering.

#### `inline` (opzionale)

Se l'attributo è indicato, il componente esegue il rendering inline (`inline-block` in CSS).

#### title (opzionale)

Permette di definire un attributo `title` per il componente da propagare all'elemento `<iframe>` sottostante. Il valore predefinito è `"MathML formula"`.
