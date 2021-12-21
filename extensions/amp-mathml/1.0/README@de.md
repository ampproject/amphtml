# Bento MathML

Rendert eine MathML Formel in einem iframe.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-mathml>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/mathml
```

```javascript
import {defineElement as defineBentoMathml} from '@bentoproject/mathml';
defineBentoMathml();
```

### Beispiel: Einbinden via `<script>`

Das folgende Beispiel enthält ein `bento-mathml` mit drei Abschnitten. Das Attribut `expanded` im dritten Abschnitt erweitert das Akkordeon beim Laden der Seite.

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

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-mathml {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attribute

#### `data-formula` (erforderlich)

Gibt die zu rendernde Formel an.

#### `inline` (optional)

Falls angegeben, rendert die Komponente inline (`inline-block` in CSS).

#### `title` (optional)

Definiere für die Komponente das Attribut `title`, das an das `<iframe>` Element weitergegeben wird. Der Standardwert ist `"MathML formula"`.

### Styling

Du kannst den Selektor für `bento-mathml` verwenden, um das Akkordeon frei zu gestalten.

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoMathml>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

### Layout und Style

#### Containertyp

Die Komponente `BentoMathml` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Oder via `className`:

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

### Eigenschaften

#### `formula` (erforderlich)

Gibt die zu rendernde Formel an.

#### `inline` (optional)

Falls angegeben, rendert die Komponente inline (`inline-block` in CSS).

#### `title` (optional)

Definiere für die Komponente das Attribut `title`, das an das `<iframe>` Element weitergegeben wird. Der Standardwert ist `"MathML formula"`.
