# Bento Gist

Creates an iframe and displays a [GitHub Gist](https://docs.github.com/en/github/writing-on-github/creating-gists).

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/gist
```

```javascript
import {defineElement as defineBentoGist} from '@bentoproject/gist';
defineBentoGist();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-gist-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-gist-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-gist-1.0.css" crossorigin="anonymous">
```

### Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-gist-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-gist-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-gist-1.0.css"
    />
    <style>
      bento-gist {
        width: 300px;
        height: 300px;
      }
    </style>
  </head>
  <body>
    <bento-gist
      id="my-track"
      data-gistid="a19e811dcd7df10c4da0931641538497"
    ></bento-gist>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-gist-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-gist {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-gist` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-gist {
  height: 100px;
  width: 100%;
}
```

### Attributes

##### data-gistid

The ID of the gist to embed.

##### data-file (optional)

If specified, display only one file in a gist.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Github Gist"`.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/gist
```

```javascript
import React from 'react';
import {BentoGist} from '@bentoproject/gist/react';
import '@bentoproject/gist/styles.css';

function App() {
  return <BentoGist gistId="a19e811dcd7df10c4da0931641538497"></BentoGist>;
}
```

### Layout and style

#### Container type

The `BentoGist` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoGist
  style={{height: 500}}
  gistId="a19e811dcd7df10c4da0931641538497"
  file="index.js"
></BentoGist>
```

Or via `className`:

```jsx
<BentoGist
  className="custom-styles"
  gistId="a19e811dcd7df10c4da0931641538497"
  file="index.js"
></BentoGist>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Props

##### gistId

The ID of the gist to embed.

##### file (optional)

If specified, display only one file in a gist.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Github Gist"`.
