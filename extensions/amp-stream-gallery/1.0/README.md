# Bento Stream Gallery

The Bento Stream Gallery is for displaying multiple similar pieces of content at a time along a horizontal axis.

It is a specialization of Bento Base Carousel and uses [ResizeObservers](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to adjust dynamically adjust the size and number of displayed slides displayed based on the width of the container. To implement a more customized UX, see [`<bento-base-carousel>`](../../amp-base-carousel/1.0/README.md).

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/stream-gallery
```

```javascript
import {defineElement as defineBentoStreamGallery} from '@bentoproject/stream-gallery';
defineBentoStreamGallery();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.css"
    />
  </head>
  <body>
    <bento-stream-gallery id="my-stream-gallery" style="height: 150px;" min-item-width="75" max-item-width="100">
      <div style="height: 100px; background: red;">A</div>
      <div style="height: 100px; background: green;">B</div>
      <div style="height: 100px; background: blue;">C</div>
      <div style="height: 100px; background: yellow;">D</div>
      <div style="height: 100px; background: purple;">E</div>
      <div style="height: 100px; background: orange;">F</div>
      <div style="height: 100px; background: fuchsia;">G</div>
    </bento-stream-gallery>
  </body>
</html>
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `bento-stream-gallery` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

#### Actions

##### next()

Moves the carousel forwards by number of slides visible.

```js
api.next();
```

##### prev()

Moves the carousel backwards by number of slides visible.

```js
api.prev();
```

##### goToSlide(index: number)

Moves the carousel to the slide specified by the `index` argument.

Note: `index` will be normalized to a number greater than or equal to `0` and less than the number of slides given.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Events

The Bento Stream Gallery component allows you to register and respond to the following events:

##### slideChange

This event is triggered when the index displayed by the carousel has changed. The new index is available via `event.data.index`.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### API Example

This example demonstrates how to programmatically switch to the next/previous slide and jump to specific slides.

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
      src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.css"
    />
  </head>
  <body>
    <bento-stream-gallery id="my-stream-gallery" style="height: 150px;" min-item-width="75" max-item-width="100">
      <div style="height: 100px; background: red;">A</div>
      <div style="height: 100px; background: green;">B</div>
      <div style="height: 100px; background: blue;">C</div>
      <div style="height: 100px; background: yellow;">D</div>
      <div style="height: 100px; background: purple;">E</div>
      <div style="height: 100px; background: orange;">F</div>
      <div style="height: 100px; background: fuchsia;">G</div>
    </bento-stream-gallery>
    <script>
      (async () => {
        const streamGallery = document.querySelector('#my-stream-gallery');
        await customElements.whenDefined('bento-stream-gallery');
        const api = await streamGallery.getApi();

        // programatically go to next slide
        api.next();
        // programatically go to prev slide
        api.prev();
        // programatically go to slide
        api.goToSlide(4);
      })();
    </script>
  </body>
</html>
```

### Attributes

#### Behavior

##### `controls`

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

##### `extra-space`

Either `"around"` or undefined. This determines how extra space is allocated after displaying the calculated number of visible slides in the carousel. If `"around"`, white space is evenly distributed around the carousel with `justify-content: center`; otherwise, space is allocated to the right of the carousel for LTR documents and to the left for RTL documents.

##### `loop`

Either `true` or `false`, defaults to `true`. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three slides present for looping to occur.

##### `outset-arrows`

Either `true` or `false`, defaults to `false`. When true, the carousel will display its arrows outset and on either side of the slides. Note that with outset arrows, the slide container will have an effective length of 100px less than the allotted space for its given container - 50px per arrow on either side. When false, the carousel will display its arrows inset and overlayed on top of the left and right edges of the slides.

##### `peek`

A number, defaults to `0`. This determines how much of an additional slide to show (on one or both sides of the current slide) as an affordance to the user indicating the carousel is swipeable.

#### Gallery slide visibility

##### `min-visible-count`

A number, defaults to `1`. Determines the minimum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible.

##### `max-visible-count`

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible.

##### `min-item-width`

A number, defaults to `1`. Determines the minimum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

##### `max-item-width`

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

#### Slide snapping

##### `slide-align`

Either `start` or `center`. When start aligning, the start of a slide (e.g. the left edge, when horizontal aligning) is aligned with the start of a carousel. When center aligning, the center of a slide is aligned with the center of a carousel.

##### `snap`

Either `true` or `false`, defaults to `true`. Determines whether or not the carousel should snap on slides when scrolling.

### Styling

You may use the `bento-stream-gallery` element selector to style the streamGallery freely.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/stream-gallery
```

```javascript
import React from 'react';
import {BentoStreamGallery} from '@bentoproject/stream-gallery/react';
import '@bentoproject/stream-gallery/styles.css';

function App() {
  return (
    <BentoStreamGallery style={{height: 150}} minItemWidth="75" maxItemWidth="100">
      <img src="img1.png" />
      <img src="img2.png" />
      <img src="img3.png" />
      <img src="img4.png" />
      <img src="img5.png" />
      <img src="img6.png" />
      <img src="img7.png" />
    </BentoStreamGallery>
  );
}
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `BentoStreamGallery` component API is accessible by passing a `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoStreamGallery ref={ref}>
      <img src="img1.png" />
      <img src="img2.png" />
      <img src="img3.png" />
      <img src="img4.png" />
      <img src="img5.png" />
      <img src="img6.png" />
      <img src="img7.png" />
    </BentoStreamGallery>
  );
}
```

#### Actions

The `BentoStreamGallery` API allows you to perform the following actions:

##### next()

Moves the carousel forwards by `advanceCount` slides.

```javascript
ref.current.next();
```

##### prev()

Moves the carousel backwards by `advanceCount` slides.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Moves the carousel to the slide specified by the `index` argument. Note: `index` will be normalized to a number greater than or equal to `0` and less than the number of slides given.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Events

##### onSlideChange

This event is triggered when the index displayed by the carousel has changed.

```jsx
<BentoStreamGallery style={{height: 150}} onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

### Layout and style

#### Container type

The `BentoStreamGallery` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `width`). These can be applied inline:

```jsx
<BentoStreamGallery style={{width: 300}}>...</BentoStreamGallery>
```

Or via `className`:

```jsx
<BentoStreamGallery className="custom-styles">...</BentoStreamGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

### Props

#### Common props

This component supports the [common props](../../../docs/spec/bento-common-props.md) for React and Preact components.

#### Behavior

##### `controls`

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

##### `extraSpace`

Either `"around"` or undefined. This determines how extra space is allocated after displaying the calculated number of visible slides in the carousel. If `"around"`, white space is evenly distributed around the carousel with `justify-content: center`; otherwise, space is allocated to the right of the carousel for LTR documents and to the left for RTL documents.

##### `loop`

Either `true` or `false`, defaults to `true`. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three slides present for looping to occur.

##### `outsetArrows`

Either `true` or `false`, defaults to `false`. When true, the carousel will display its arrows outset and on either side of the slides. Note that with outset arrows, the slide container will have an effective length of 100px less than the allotted space for its given container - 50px per arrow on either side. When false, the carousel will display its arrows inset and overlayed on top of the left and right edges of the slides.

##### `peek`

A number, defaults to `0`. This determines how much of an additional slide to show (on one or both sides of the current slide) as an affordance to the user indicating the carousel is swipeable.

#### Gallery slide visibility

##### `minVisibleCount`

A number, defaults to `1`. Determines the minimum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible.

##### `maxVisibleCount`

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible.

##### `minItemWidth`

A number, defaults to `1`. Determines the minimum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

##### `maxItemWidth`

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

#### Slide snapping

##### `slideAlign`

Either `start` or `center`. When start aligning, the start of a slide (e.g. the left edge, when horizontal aligning) is aligned with the start of a carousel. When center aligning, the center of a slide is aligned with the center of a carousel.

##### `snap`

Either `true` or `false`, defaults to `true`. Determines whether or not the carousel should snap on slides when scrolling.
