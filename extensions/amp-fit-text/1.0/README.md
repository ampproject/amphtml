---
$category@: presentation
formats:
  - websites
teaser:
  text: Expands or shrinks font size to fit the content within the space given.
---

# Bento Fit Text

## Usage

Expands or shrinks its font size to fit the content within the space given to it. Use Bento Fit Text as a web component [`<bento-fit-text>`](#web-component), or a Preact/React functional component [`<BentoFitText>`](#preact/react-Component).

The Bento Fit Text component allows you to manage the size and fit of text within a specified area. For content contained in a Bento Fit Text component, it determines the best font size to fit all of the content within the available space. The expected content for Bento Fit Text is text or other inline content, but it can also contain non-inline content.

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

The examples below demonstrate use of the `<bento-fit-text>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-fit-text
```

```javascript
import '@ampproject/bento-fit-text';
```

[/example]

#### Example: Include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <script async custom-element="bento-fit-text" src="https://cdn.ampproject.org/v0/bento-fit-text-1.0.js"></script>
  <style data-bento-boilerplate>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px;">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () => fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () => fitText.textContent = 'new content';
  })();
</script>
```

[/example]

#### Overflowing content

If the content of the `bento-fit-text` overflows the available space, even with a
`min-font-size` specified, the overflowing content is cut off and hidden. WebKit and Blink-based browsers show ellipsis for overflowing content.

In the following example, we specified a `min-font-size` of `40`, and added more content inside the `bento-fit-text` element. This causes the content to exceed the size of its fixed block parent, so the text is truncated to fit the container.

[example preview="inline" playground="true" imports="bento-fit-text:1.0"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-fit-text-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Container type**

The `bento-fit-text` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

#### Accessibility considerations of overflowing content

While overflowing content is _visually_ truncated to fit the container, note that it's still present in the document. Do not rely on the overflow behaviour to simply "stuff" large amounts of content in your pages - while visually it may look appropriate, it may lead to the page becoming overly verbose to users of assistive technologies (such as screen readers), as for these users all the truncated content will still be read/announced in full.

#### Attributes

##### Media Queries

The attributes for `<bento-fit-text>` can be configured to use different
options based on a [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

##### `min-font-size`

Specifies the minimum font size as an integer that the `bento-fit-text` can use.

##### `max-font-size`

Specifies the maximum font size as an integer that the `bento-fit-text` can use.

### Preact/React Component

The examples below demonstrate use of the `<BentoFitText>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@ampproject/bento-fit-text/react';
import '@ampproject/bento-fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

[/example]

#### Layout and style

**Container type**

The `BentoFitText` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Or via `className`:

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Props

##### `minFontSize`

Specifies the minimum font size as an integer that the `bento-fit-text` can use.

##### `maxFontSize`

Specifies the maximum font size as an integer that the `bento-fit-text` can use.
