# Bento Lightbox

## Usage

The Bento Lightbox component displays elements in a full-viewport "lightbox" modal. It can be used as a web component [`<bento-lightbox>`](#web-component), or as a Preact/React functional component [`<BentoLightbox>`](#preactreact-component).

### Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

The examples below demonstrate use of the `<bento-lightbox>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-lightbox
```

```javascript
import '@ampproject/bento-lightbox';
```

[/example]

#### Example: Import via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-lightbox-1.0.css">
  <script async custom-element="bento-lightbox" src="https://cdn.ampproject.org/v0/bento-lightbox-1.0.js"></script>
</head>
<bento-lightbox id="my-lightbox">
  Lightboxed content
  <button id="close-button">Close lightbox</button>
</bento-lightbox>
<button id="open-button">Open lightbox</button>
<script>
  (async () => {
    const lightbox = document.querySelector('#my-lightbox');
    await customElements.whenDefined('bento-lightbox');
    const api = await lightbox.getApi();

    // set up button actions
    document.querySelector('#open-button').onclick = () => api.open();
    document.querySelector('#close-button').onclick = () => api.close();
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API.

The `bento-lightbox` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined('amp-lightbox');
const api = await lightbox.getApi();
```

##### Actions

The `amp-lightbox` API allows you to perform the following actions:

**open()**
Opens the lightbox.

```js
api.open();
```

**close()**
Closes the lightbox.

```js
api.close();
```

##### Events

The `amp-lightbox` API allows you to register and respond to the following events:

**open**

This event is triggered when the lightbox is opened.

```js
lightbox.addEventListener('open', (e) => console.log(e))
```

**close**

This event is triggered when the lightbox is closed.

```js
lightbox.addEventListener('close', (e) => console.log(e))
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-lightbox-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-lightbox {
    display: none !important;
  }
</style>
```

#### Attributes

##### `id`

A unique identifier for the lightbox.

##### `hidden`

Must be present when the lightbox is closed and the contents should not be displayed, such as on first layout.

##### `animation`

Defines the style of animation for opening the lightbox. By default, this will
be set to `fade-in`. Valid values are `fade-in`, `fly-in-bottom`, and
`fly-in-top`.

##### `scrollable`

When the `scrollable` attribute is present, the content of the lightbox can
scroll when overflowing the height of the lightbox.

### Preact/React Component

The examples below demonstrates use of the `<BentoLightbox>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-lightbox
```

```javascript
import React from 'react';
import { BentoLightbox } from '@ampproject/bento-lightbox/react';
import '@ampproject/bento-lightbox/styles.css';
function App() {
  return (
      <BentoLightbox
        id="lightbox"
        closeButtonAs={(props) => (
          <button {...props} aria-label="Close my fancy lightbox">
            Close!
          </button>
        )}
      >
        <p>Hello World</p>
      </BentoLightbox>
  );
}
```

[/example]

#### Layout and style

**Container type**

The `BentoLightbox` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoLightbox style={{width: '300px', height: '200px'}}>
</BentoLightbox>
```

Or via `className`:

```jsx
<BentoLightbox className='custom-styles'>
</BentoLightbox>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Props

##### **animation**

Animation used to display the lightbox. Options are `fade-in`, `fly-in-top` or `fly-in-bottom`, Default is `fade-in`.

##### **children**

The content to show within this lightbox.

##### **closeButtonAs**

A prop which takes a function (as a render prop) to specify a custom close button.

##### **onBeforeOpen**

A prop which takes a function which is executed before the lightbox is opened.

##### **onAfterOpen**

A prop which takes a function which is executed after the lightbox is opened.

##### **onAfterClose**

A prop which takes a function which is executed after the lightbox is closed.
