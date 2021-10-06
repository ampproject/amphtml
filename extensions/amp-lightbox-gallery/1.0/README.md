# Bento Lightbox Gallery

## Usage

The Bento Lightbox Gallery component provides a "lightbox" experience for other components (e.g., HTML images, Bento carousel). When the user interacts with the element, a UI component expands to fill the viewport until it is closed by the user. Currently, only images are supported.

Use Bento Lightbox Gallery as a web component [`<bento-lightbox-gallery>`](#web-component), or a Preact/React functional component [`<BentoLightboxGallery>`](#preact/react-Component).

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. As a web component

The examples below demonstrate use of the `<bento-lightbox-gallery>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-lightbox-gallery
```

```javascript
import '@ampproject/bento-lightbox-gallery';
```

[/example]

#### Example: Import via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
    <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
    <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
    <style data-bento-boilerplate>
    </style>
    <script async src="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.js"></script>
    <style>
      bento-lightbox-gallery {
        width: 360px;
        height: 240px;
      }
    </style>
  </head>

  <figure>
     <img
       id="my-img"
       width="360"
       height="240"
       src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
       lightbox
     />
     <figcaption>Dog wearing yellow shirt.</figcaption>
    </figure>
  <div class="buttons" style="margin-top: 8px;">
    <button id="change-img">
      Change image
    </button>
  </div>

  <script>
    (async () => {
      const img = document.querySelector('#my-img');
      await customElements.whenDefined('img');
      // set up button actions
      document.querySelector('#change-img').onclick = () => {
        img.setAttribute('src', 'https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80')
      }
    })();
  </script>
```

[/example]

#### Usage

To use `bento-liightbox-gallery`, ensure the required script is included in your `<head>` section,
then add the `lightbox` attribute on an `<img>` or `<bento-carousel>` element.

[tip type="read-on"]

To display other types of elements in a lightbox, use [`<bento-lightbox>`](../../amp-lightbox/1.0/README.md).

[/tip]

##### Add Captions

Optionally, you can specify a caption for each element in the lightbox. These
fields are automatically read and displayed by the `<bento-lightbox-gallery>` in
the following order of priority:

-   `figcaption` (if the lightboxed element is the child of a figure)
-   `aria-describedby`
-   `alt`
-   `aria-label`
-   `aria-labelledby`

In the following example, `<bento-lightbox-gallery>` displays the `figcaption`
value as its description, showing "Toront's CN tower was ....".

```html
<figure>
  <img
    id="hero-img"
    lightbox="toronto"
    src="https://picsum.photos/1600/900?image=1075"
    layout="responsive"
    width="1600"
    height="900"
    alt="Picture of CN tower."
  >
  <figcaption class="image">
    Toronto's CN tower was built in 1976 and was the tallest free-standing
    structure until 2007.
  </figcaption>
</figure>
```

In the following example, `<bento-lightbox-gallery>` displays the `alt` value as
its description, showing "Picture of CN tower".

```html
<img
  id="hero-img"
  lightbox="toronto"
  src="https://picsum.photos/1600/900?image=1075"
  layout="responsive"
  width="1600"
  height="900"
  alt="Picture of CN tower"
>
```

##### Implement thumbnail previews

Lightboxed items have a thumbnail gallery view. You can optionally specify a
thumbnail item for your lightboxed element via the attribute
`lightbox-thumbnail-id` that references the `id` of an `<img>` element with
`layout="nodisplay"`.

```html
<bento-youtube
  width="480"
  height="270"
  layout="responsive"
  data-videoid="lBTCB7yLs8Y"
  lightbox-thumbnail-id="my-thumbnail-img"
>
</bento-youtube>

<img
  id="my-thumbnail-img"
  width="200"
  height="200"
  layout="nodisplay"
  src="https://picsum.photos/200/200?image=1074"
>
```

If no thumbnail is specified, `<amp-img>` elements will be cropped per
`object-fit: cover`, `<amp-video>` will use the image `src` specified in its
`poster` attribute, and placeholder images will be used for lightboxed elements
that have one.

#### Attributes

#### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-lightbox-gallery-1.0.css">
```

### Preact/React Component

#### Example: Import via npm

#### Props
