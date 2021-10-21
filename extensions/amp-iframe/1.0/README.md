# Bento Iframe

## Usage

Displays an iframe.

Use Bento Iframe as a web component [`<bento-iframe>`](#web-component), or a Preact/React functional component [`<BentoIframe>`](#preactreact-component).

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

The examples below demonstrate use of the `<bento-iframe>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-iframe
```

```javascript
import '@ampproject/bento-iframe';
```

[/example]

#### Example: Include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script async custom-element="bento-iframe" src="https://cdn.ampproject.org/v0/bento-iframe-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-iframe-1.0.css">
  <style data-bento-boilerplate>
    bento-iframe {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-iframe
  id="my-iframe"
  src="https://en.wikipedia.org/wiki/Bento"
  style="width: 800px; height: 600px">
</bento-iframe>

<button id="change-source">
  Change source
</button>

<script>
  (async () => {
    const iframeEl = document.querySelector('#my-iframe');
    await customElements.whenDefined('bento-iframe');

    // Reload iframe with new src
    document.querySelector('#change-source').onclick = () => {
      iframeEl.setAttribute('src', 'https://example.com')
    }
  })();
</script>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-iframe-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-iframe {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributes

##### `src`

The URL of the page to embed.

##### `srcdoc`

Inline HTML to embed. Only one of `src` or `srcdoc` is required. If both are specified, `srcdoc` overrides `src`.

##### `height`

Height of the iframe in pixels. Note: this is applied to the parent container and the `iframe` element is set to 100% height.

##### `width`

Width of the iframe in pixels. Note: this is applied to the parent container and the `iframe` element is set to 100% width.

##### `allowfullscreen`, `allowpaymentrequest`, and `referrerpolicy` (optional)

These attributes should all behave like they do on standard iframes.

##### `sandbox` (optional) <a name="sandbox"></a>

Iframes created by `bento-iframe` always have the `sandbox` attribute defined on
them. By default, the value is empty, which means that they are "maximum
sandboxed". By setting `sandbox` values, one can opt the iframe into being less
sandboxed. All values supported by browsers are allowed. For example, setting
`sandbox="allow-scripts"` allows the iframe to run JavaScript, or
`sandbox="allow-scripts allow-same-origin"` allows the iframe to run JavaScript,
make non-CORS XHRs, and read/write cookies.

If you are iframing a document that was not specifically created with sandboxing
in mind, you will most likely need to add `allow-scripts allow-same-origin` to
the `sandbox` attribute and you might need to allow additional capabilities.

Note also, that the sandbox applies to all windows opened from a sandboxed
iframe. This includes new windows created by a link with `target=_blank` (add
`allow-popups` to allow this to happen). Adding `allow-popups-to-escape-sandbox`
to the `sandbox` attribute, makes those new windows behave like non-sandboxed
new windows. This is likely most of the time what you want and expect.

See the [docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) for further details on the `sandbox` attribute.

#### Styling

You may use the `bento-iframe` element selector to style the component.

### Preact/React Component

The examples below demonstrates use of the `<BentoIframe>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-iframe
```

```javascript
import React from 'react';
import { BentoIframe } from '@ampproject/bento-iframe/react';
import '@ampproject/bento-iframe/styles.css';

function App() {
  return (
    <BentoIframe
      src="https://en.wikipedia.org/wiki/Bento"
      width="800"
      height="600"
    />
  );
}
```

[/example]

#### Props

##### `src`

The URL of the page to embed.

##### `srcdoc`

Inline HTML to embed. Only one of `src` or `srcdoc` is required. If both are specified, `srcdoc` overrides `src`.

##### `allowFullScreen`, `allowPaymentRequest`, and `referrerPolicy` (optional)

These attributes all behave like they do on standard iframes.

##### `sandbox` (optional) <a name="sandbox"></a>

Iframes created by `<BentoIframe>` always have the `sandbox` attribute defined on
them. By default, the value is empty, which means that they are "maximum
sandboxed". By setting `sandbox` values, one can opt the iframe into being less
sandboxed. All values supported by browsers are allowed. For example, setting
`sandbox="allow-scripts"` allows the iframe to run JavaScript, or
`sandbox="allow-scripts allow-same-origin"` allows the iframe to run JavaScript,
make non-CORS XHRs, and read/write cookies.

See the [docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) for further details on the `sandbox` attribute.

##### `iframeStyle` (optional)

Styles to apply to the `iframe` element, specified as JSON.

##### `height`

Height of the iframe in pixels. Note: this is applied to the parent container and the `iframe` element is set to 100% height.

##### `width`

Width of the iframe in pixels. Note: this is applied to the parent container and the `iframe` element is set to 100% width.
