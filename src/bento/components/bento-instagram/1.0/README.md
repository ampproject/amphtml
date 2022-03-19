# Bento Instagram

Embeds an Instagram post.

## Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/instagram
```

```javascript
import {defineElement as defineBentoInstagram} from '@bentoproject/instagram';
defineBentoInstagram();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-instagram-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-instagram-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-instagram-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-instagram-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-instagram-1.0.js"
    ></script>
    <style>
      bento-instagram {
        display: block;
        overflow: hidden;
        position: relative;
      }
    </style>
  </head>
  <body>
    <bento-instagram
      id="my-instagram"
      data-shortcode="CKXYAzuj7TE"
      data-captioned
      style="height: 800px; width: 400px"
    >
    </bento-instagram>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-instagram-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-instagram {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-instagram` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-instagram {
  height: 500px;
  width: 100px;
}
```

### Attributes

#### `data-shortcode`

The instagram data-shortcode is found in every instagram photo URL. For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the data-shortcode.

#### `data-captioned`

Include the Instagram caption. `bento-instagram` will attempt to resize to the correct height including the caption.

#### API Example

By programmatically changing the `data-shortcode` attribute value, you can dynamically switch to a different post:

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
      src="https://cdn.ampproject.org/v0/bento-instagram-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-instagram-1.0.js"
    ></script>
    <style>
      bento-instagram {
        display: block;
        overflow: hidden;
        position: relative;
      }
    </style>
  </head>
  <body>
    <bento-instagram
      id="my-instagram"
      data-shortcode="CKXYAzuj7TE"
      data-captioned
      style="height: 800px; width: 400px"
    >
    </bento-instagram>
    <button id="change-shortcode">Change shortcode</button>

    <script>
      (async () => {
        const instagram = document.querySelector('#my-instagram');
        await customElements.whenDefined('bento-instagram');

        // set up button actions
        document.querySelector('#change-shortcode').onclick = () => {
          instagram.dataset.shortcode = '1totVhIFXl';
        };
      })();
    </script>
  </body>
</html>
```

### Styling

You may use the `bento-instagram` element selector to style the component.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/instagram
```

```javascript
import React from 'react';
import {BentoInstagram} from '@bentoproject/instagram/react';
import '@bentoproject/instagram/styles.css';
function App() {
  return <BentoInstagram shortcode="CKXYAzuj7TE" captioned />;
}
```

### Layout and style

#### Container type

The `BentoInstagram` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoInstagram
  style={{width: 300, height: 200}}
  shortcode="CKXYAzuj7TE"
></BentoInstagram>
```

Or via `className`:

```jsx
<BentoInstagram
  className="custom-styles"
  shortcode="CKXYAzuj7TE"
></BentoInstagram>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Props

#### `shortcode`

The instagram shortcode is found in every instagram photo URL. For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the shortcode.

#### `captioned`

Include the Instagram caption. `bento-instagram` will attempt to resize to the correct height including the caption.
