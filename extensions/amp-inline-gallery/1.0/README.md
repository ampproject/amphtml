---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis, with optional pagination dots and thumbnails.
experimental: true
bento: true
---

# Bento Inline Gallery

## Usage

The Bento Inline Gallery component uses a Bento Carousel component to display slides, with optional pagination dots and thumbnails. Both components must be properly installed for the environment (Web Component vs Preact).

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

The examples below demonstrate use of the `<bento-inline-gallery>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-inline-gallery
```

```javascript
import '@ampproject/bento-inline-gallery';
```

[/example]

#### Example: Include via `<script>`

The example below contains a `bento-inline-gallery` consisting of three slides with thumbnails and a pagination indicator.

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <script async src="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-inline-gallery-1.0.css">
</head>
<body>

  <bento-inline-gallery id="inline-gallery">
    <bento-inline-gallery-thumbnails aspect-ratio="1.5" loop></bento-inline-gallery-thumbnails>
    <bento-base-carousel snap-align="center" visible-count="1.2" loop>
      <img src="server.com/static/inline-examples/images/image1.jpg">
      <img src="server.com/static/inline-examples/images/image2.jpg">
      <img src="server.com/static/inline-examples/images/image3.jpg">
    </bento-base-carousel>
    <bento-inline-gallery-pagination inset></bento-inline-gallery-pagination>
  </bento-inline-gallery>

</body>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-inline-gallery-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  amp-inline-gallery,
  amp-inline-gallery-pagination,
  amp-inline-gallery-thumbnails {
    display: block;
  }
  amp-inline-gallery {
    contain: layout;
  }
  amp-inline-gallery-pagination,
  amp-inline-gallery-thumbnails {
    overflow: hidden;
    position: relative;
  }
  amp-inline-gallery-pagination:not(.i-amphtml-built) > :not([placeholder]):not(.i-amphtml-svc),
  amp-inline-gallery-thumbnails:not(.i-amphtml-built) > :not([placeholder]):not(.i-amphtml-svc) {
    display: none;
    content-visibility: hidden;
  }
</style>
```

#### Attributes

##### `<bento-inline-gallery-pagination>`

###### `inset`

Default: `false`

Boolean attribute indicating whether to display the pagination indicator as inset (overlaying the carousel itself)

##### `<bento-inline-gallery-thumbnails>`

###### `aspect-ratio`

Optional

Number: ratio of width to height that slides should be displayed in.

###### `loop`

Default: `false`

Boolean attribute indicating whether thumbnails should loop.

#### Styling

You may use the `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails`, and `bento-base-carousel` element selectors to style the pagination indicator, thumbnails, and carousel freely.

### Preact/React Component

The examples below demonstrates use of the `<BentoInlineGallery>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-inline-gallery
```

```javascript
import React from 'react';
import { BentoInlineGallery } from '@ampproject/bento-inline-gallery/react';
import '@ampproject/bento-inline-gallery/styles.css';

function App() {
  return (
    <BentoInlineGallery id="inline-gallery">
      <BentoInlineGalleryThumbnails aspect-ratio="1.5" loop></BentoInlineGalleryThumbnails>
      <BentoBaseCarousel snap-align="center" visible-count="1.2" loop>
        <img src="server.com/static/inline-examples/images/image1.jpg">
        <img src="server.com/static/inline-examples/images/image2.jpg">
        <img src="server.com/static/inline-examples/images/image3.jpg">
      </BentoBaseCarousel>
      <BentoInlineGallery-pagination inset></BentoInlineGallery-pagination>
    </BentoInlineGallery>
  }
```

[/example]

#### Layout and style

**Container type**

The `BentoInlineGallery` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `width`). These can be applied inline:

```jsx
<BentoInlineGallery style={{width: '300px'}}>
  ...
</BentoInlineGallery>
```

Or via `className`:

```jsx
<BentoInlineGallery className='custom-styles'>
  ...
</BentoInlineGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

#### Props

##### BentoInlineGallery

##### BentoInlineGalleryPagination

In addition to the [common props](../../../docs/spec/bento-common-props.md), BentoInlineGalleryPagination supports the props below:

###### `inset`

Default: `false`

Boolean attribute indicating whether to display the pagination indicator as inset (overlaying the carousel itself)

##### BentoInlineGalleryThumbnails

In addition to the [common props](../../../docs/spec/bento-common-props.md), BentoInlineGalleryThumbnails supports the props below:

###### `aspectRatio`

Optional

Number: ratio of width to height that slides should be displayed in.

###### `loop`

Default: `false`

Boolean attribute indicating whether thumbnails should loop.
