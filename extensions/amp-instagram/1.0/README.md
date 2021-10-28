# Bento Instagram

## Usage

The Bento Instagram component allows you embed an Instagram post. It can be used as a web component [`<bento-instagram>`](#web-component), or as a Preact/React functional component [`<BentoInstagram>`](#preactreact-component).

### Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

The examples below demonstrate use of the `<bento-instagram>` web component.

#### Example: Import via npm

Install via npm:

```sh
npm install @ampproject/bento-instagram
```

```javascript
import '@ampproject/bento-instagram';
```

#### Example: Include via `<script>`

```html
<head>
  <script async src="https://cdn.ampproject.org/bento.js"></script>
  <script
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
```

#### Layout and style

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

**Container type**

The `bento-instagram` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-instagram {
  height: 500px;
  width: 100px;
}
```

#### Attributes

##### `data-shortcode`

The instagram data-shortcode is found in every instagram photo URL. For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the data-shortcode.

##### `data-captioned`

Include the Instagram caption. `bento-instagram` will attempt to resize to the correct height including the caption.

#### Styling

You may use the `bento-instagram` element selector to style the component.

### Preact/React Component

The examples below demonstrates use of the `<BentoInstagram>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

Install via npm:

```sh
npm install @ampproject/bento-instagram
```

```javascript
import React from 'react';
import {BentoInstagram} from '@ampproject/bento-instagram/react';
import '@ampproject/bento-instagram/styles.css';
function App() {
  return <BentoInstagram shortcode="CKXYAzuj7TE" captioned />;
}
```

#### Layout and style

**Container type**

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

#### Props

##### `shortcode`

The instagram shortcode is found in every instagram photo URL. For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the shortcode.

##### `captioned`

Include the Instagram caption. `bento-instagram` will attempt to resize to the correct height including the caption.
