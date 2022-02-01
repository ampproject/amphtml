# Bento Lightbox Gallery

Provides a modal "lightbox" experience for images.

When the user interacts with the element, a modal expands to fill the viewport until it is closed by the user.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. As a web component

### Import via npm

```sh
npm install @bentoproject/lightbox-gallery
```

```javascript
import {defineElement as defineBentoLightboxGallery} from '@bentoproject/lightbox-gallery';
defineBentoLightboxGallery();
```

### Import via `<script>`

```html
<script type="module" async src="https://cdn.ampproject.org/bento.mjs"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.css"
>
<script type="module" async src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.mjs"></script>
<script nomodule async src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.js"></script>
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
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.js"
    ></script>
  </head>
  <body>
    <bento-lightbox-gallery></bento-lightbox-gallery>
    <figure>
      <img id="my-img" src="img1.jpwg" lightbox />
      <figcaption>dog wearing yellow shirt.</figcaption>
    </figure>
    <figure>
      <img src="img2.jpeg" lightbox/>
    </figure>
    <figure>
      <img src="img2.jpeg" lightbox/>
    </figure>
  </body>
</html>
```

To use `bento-liightbox-gallery`, ensure the required script is included in your `<head>` section, then add the `lightbox` attribute on an `<img>` or `<bento-carousel>` element.

### Add Captions

Optionally, you can specify a caption for each element in the lightbox. these fields are automatically read and displayed by the `<bento-lightbox-gallery>` in the following order of priority:

-   `figcaption` (if the lightboxed element is the child of a figure)
-   `aria-describedby`
-   `alt`
-   `aria-label`
-   `aria-labelledby`

In the following example, `<bento-lightbox-gallery>` displays the `figcaption` value as its description, showing "toront's cn tower was ....".

```html
<figure>
  <img
    id="hero-img"
    lightbox="toronto"
    src="https://picsum.photos/1600/900?image=1075"
    alt="picture of cn tower."
  />
  <figcaption class="image">
    toronto's cn tower was built in 1976 and was the tallest free-standing
    structure until 2007.
  </figcaption>
</figure>
```

In the following example, `<bento-lightbox-gallery>` displays the `alt` value as its description, showing "picture of cn tower".

```html
<img
  id="hero-img"
  lightbox="toronto"
  src="https://picsum.photos/1600/900?image=1075"
  alt="picture of cn tower"
/>
```

## Interactivity and API usage

Bento components are highly interactive through their API. The `bento-lightbox-gallery` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-lightbox-gallery');
const api = await lightboxGallery.getApi();
```

### Actions

The `bento-lightbox-gallery` API allows you to perform the following action:

#### `open`

Opens the lightbox gallery.

```javascript
api.open();
```

You can open a specific lightbox gallery group to a specific slide by passing in extra arguments:

```javascript
api.open(1, 'toronto') // opens gallery with images in the "toronto" group to the 2nd image
api.open(null, 'toronto') // opens gallery with images in the "toronto" group to the 1st image
```

### Attributes

#### lightbox

Set `lightbox` attribute to an id to assign different images to different groups. For example, in the example below, clicking any of the `group1` images will only show `img1.jpeg`, `img3.jpeg`, and `img5.jpeg` and clicking any of the `group2` images will only show `img2.jpeg`, `img4.jpeg`, `img6.jpeg`

```html
<img src="img1.jpeg" lightbox="group1">
<img src="img2.jpeg" lightbox="group2">
<img src="img3.jpeg" lightbox="group1">
<img src="img4.jpeg" lightbox="group2">
<img src="img5.jpeg" lightbox="group1">
<img src="img6.jpeg" lightbox="group2">
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

---

## Preact/React Component

The preact/react version of the bentolightboxgallery functions differently than the web component version. The following example will demonstrate the use of `<BentoLightboxGallery>` as a functional component.

### Import via npm

```sh
npm install @bentoproject/lightbox-gallery
```

```javascript
import React from 'react';
import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from '@bentoproject/lightbox-gallery/react';

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

### Example Using BentoBaseCarousel

`<BentoLightboxGallery>` can be used with a `<BentoBaseCarousel>` child in order to lightbox all of the carousel's children. As you navigate throught the carousel items in the lightbox, the original carousel slides are synchronised so that when the lightbox is closed, the user ends up on the same slide as they were originally on.

```javascript
import React from 'react';
import {BentoBaseCarousel} from '../../../bento-base-carousel/1.0/component';
import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from '@bentoproject/lightbox-gallery/react';

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

### Props for `BentoLightboxGalleryProvider`

#### onBeforeOpen

A prop which takes a function which is executed before the lightbox is opened.

#### onAfterOpen

A prop which takes a function which is executed after the lightbox is opened.

#### onAfterClose

A prop which takes a function which is executed after the lightbox is closed.

##### onViewGrid

A prop which takes a function which is executed when the user enters the grid view.

#### onToggleCaption

A prop which takes a function which is executed when the captions are toggled.

### Props for `WithBentoLightboxGallery`

#### enableActivation

A boolean prop which defaults to true which lets the child image activate the lightbox experience.

#### onClick

A prop which takes a functhion which is executed when the image is clicked.
