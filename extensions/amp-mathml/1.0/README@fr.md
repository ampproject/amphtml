# Bento MathML

Restitue une formule MathML dans un iframe.

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-mathml>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/mathml
```

```javascript
import {defineElement as defineBentoMathml} from '@bentoproject/mathml';
defineBentoMathml();
```

### Exemple: inclusion via `<script>`

L'exemple ci-dessous contient un `bento-mathml` à trois sections. L'attribut `expanded` de la troisième section l'étend au chargement de la page.

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

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-mathml {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributs

#### `data-formula` (requis)

Spécifie la formule à restituer.

#### `inline` (facultatif)

Si spécifié, le composant restitué est intégré (`inline-block` dans le CSS).

#### `title` (facultatif)

Définissez un attribut `title` pour que le composant se propage à l'élément `<iframe>` sous-jacent. La valeur par défaut est `"MathML formula"`.

### Styles

Vous pouvez utiliser l'élément `bento-mathml` pour ajouter librement des styles à l'accordéon.

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoMathml>` tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

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

### Mise en page et style

#### Type de conteneur

Le composant `BentoMathml` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Ou via `className`:

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

### Propriétés

#### `formula` (requis)

Spécifie la formule à restituer.

#### `inline` (facultatif)

Si spécifié, le composant restitué est intégré (`inline-block` dans le CSS).

#### `title` (facultatif)

Définissez un attribut `title` pour que le composant se propage à l'élément `<iframe>` sous-jacent. La valeur par défaut est `"MathML formula"`.
