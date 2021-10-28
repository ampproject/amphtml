# Bento Lightbox Gallery

# Usage

The Bento Lightbox Gallery component provides a "lightbox" experience for other components (e.g., HTML images, Bento carousel). When the user interacts with the element, a UI component expands to fill the viewport until it is closed by the user. Currently, only images are supported.

Use Bento Lightbox Gallery as a web component [`<bento-lightbox-gallery>`](#web-component), or a Preact/React functional component [`<BentoLightboxGallery>`](#preact/react-Component).

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. As a web component

The examples below demonstrate use of the `<bento-lightbox-gallery>` web component.

### Example: Import via npm

Install via npm:

```sh
npm install @ampproject/bento-lightbox-gallery
```

```javascript
import '@ampproject/bento-lightbox-gallery';
```

### Example: Import via `<script>`

```html
<head>
  <script async src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-lightbox-gallery[hidden] {
      display: none !important;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.js"
  ></script>
</head>

<figure>
  <img
    id="my-img"
    width="360"
    height="240"
    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
    lightbox
  />
  <figcaption>dog wearing yellow shirt.</figcaption>
</figure>
<div class="buttons" style="margin-top: 8px">
  <button id="change-img">change image</button>
</div>

<script>
  (async () => {
    const img = document.queryselector('#my-img');
    await customelements.whendefined('img');
    // set up button actions
    document.queryselector('#change-img').onclick = () => {
      img.setattribute(
        'src',
        'https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80'
      );
    };
  })();
</script>
```

### Usage

To use `bento-liightbox-gallery`, ensure the required script is included in your `<head>` section,
then add the `lightbox` attribute on an `<img>` or `<bento-carousel>` element.

#### Add Captions

Optionally, you can specify a caption for each element in the lightbox. these
fields are automatically read and displayed by the `<bento-lightbox-gallery>` in
the following order of priority:

-   `figcaption` (if the lightboxed element is the child of a figure)
-   `aria-describedby`
-   `alt`
-   `aria-label`
-   `aria-labelledby`

In the following example, `<bento-lightbox-gallery>` displays the `figcaption`
value as its description, showing "toront's cn tower was ....".

```html
<figure>
  <img
    id="hero-img"
    lightbox="toronto"
    src="https://picsum.photos/1600/900?image=1075"
    layout="responsive"
    width="1600"
    height="900"
    alt="picture of cn tower."
  />
  <figcaption class="image">
    toronto's cn tower was built in 1976 and was the tallest free-standing
    structure until 2007.
  </figcaption>
</figure>
```

In the following example, `<bento-lightbox-gallery>` displays the `alt` value as
its description, showing "picture of cn tower".

```html
<img
  id="hero-img"
  lightbox="toronto"
  src="https://picsum.photos/1600/900?image=1075"
  layout="responsive"
  width="1600"
  height="900"
  alt="picture of cn tower"
/>
```

### Interactivity and API usage

Bento enabled components used as a standalone web component are highly interactive through their API. The `bento-lightbox-gallery` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-lightbox-gallery');
const api = await lightboxGallery.getApi();
```

### Actions

The `bento-lightbox-gallery` API allows you to perform the following action:

### `open`

Opens the lightbox gallery.

```javascript
api.open();
```

### Layout And Style

Each bento component has a small css library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.css"
/>
```

## Preact/React Component

The preact/react version of the bentolightboxgallery functions differently than the web component version. The following example will demonstrate the use of `<BentoLightboxGallery>` as a functional component.

### Example: Import Via npm

```sh
npm install @ampproject/bento-lightbox-gallery
```

```javascript
import React from 'react';
import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from '@ampproject/bento-lightbox-gallery/react';

function App() {
  return (
    <BentoLightboxGalleryProvider>
      <WithBentoLightboxGallery>
        <img src="https://images.unsplash.com/photo-1562907550-096d3bf9b25c" />
      </WithBentoLightboxGallery>
    </BentoLightboxGalleryProvider>
  );
}
```

#### Example Using BentoBaseCarousel

`<BentoLightboxGallery>` can be used with a `<BentoBaseCarousel>` child in order to lightbox all of the carousel's children. As you navigate throught the carousel items in the lightbox, the original carousel slides are synchronised so that when the lightbox is closed, the user ends up on the same slide as they were originally on.

```javascript
import React from 'react';
import {BentoBaseCarousel} from '../../../bento-base-carousel/1.0/component';
import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from '@ampproject/bento-lightbox-gallery/react';

function App() {
  return (
    <BentoLightboxGalleryProvider>
      <BentoBaseCarousel lightbox style={{width: 240, height: 160}}>
        <img
          src="https://images.unsplash.com/photo-1562907550-096d3bf9b25c"
          thumbnailSrc="https://images.unsplash.com/photo-1562907550-096d3bf9b25c"
        />
      </BentoBaseCarousel>
    </BentoLightboxGalleryProvider>
  );
}
```

For further examples of how to use the BentoLightboxGallery please check the storybook example found in (Basic.js)[./storybook/Basic.js].

### Props for BentoLightboxGalleryProvider

#### **onBeforeOpen**

A prop which takes a function which is executed before the lightbox is opened.

#### **onAfterOpen**

A prop which takes a function which is executed after the lightbox is opened.

#### **onAfterClose**

A prop which takes a function which is executed after the lightbox is closed.

##### **onViewGrid**

A prop which takes a function which is executed when the user enters the grid view.

#### **onToggleCaption**

A prop which takes a function which is executed when the captions are toggled.

### Props for WithBentoLightboxGallery

#### **enableActivation**

A boolean prop which defaults to true which lets the child image activate the lightbox experience.

#### **onClick**

A prop which takes a functhion which is executed when the image is clicked.
