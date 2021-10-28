# Bento MathML

## Usage

Renders a MathML formula in an iframe.

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

The examples below demonstrate use of the `<bento-mathml>` web component.

#### Example: Import via npm

Install via npm:

```sh
npm install @ampproject/bento-mathml
```

```javascript
import '@ampproject/bento-mathml';
```

#### Example: Include via `<script>`

The example below contains an `bento-mathml` with three sections. The
`expanded` attribute on the third section expands it on page load.

```html
<head>
  <script async src="https://cdn.ampproject.org/bento.js"></script>
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

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-mathml {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributes

##### `data-formula` (required)

Specifies the formula to render.

##### `inline` (optional)

If specified, the component renders inline (`inline-block` in CSS).

##### `title` (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"MathML formula"`.

#### Styling

You may use the `bento-mathml` element selector to style the accordion freely.

### Preact/React Component

The examples below demonstrates use of the `<BentoMathml>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

Install via npm:

```sh
npm install @ampproject/bento-mathml
```

```javascript
import React from 'react';
import {BentoMathml} from '@ampproject/bento-mathml/react';
import '@ampproject/bento-mathml/styles.css';

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

#### Layout and style

**Container type**

The `BentoMathml` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Or via `className`:

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

#### Props

##### `formula` (required)

Specifies the formula to render.

##### `inline` (optional)

If specified, the component renders inline (`inline-block` in CSS).

##### `title` (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"MathML formula"`.
