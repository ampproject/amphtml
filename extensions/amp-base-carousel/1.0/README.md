# Bento Carousel

A generic carousel for displaying multiple similar pieces of content along a horizontal or vertical axis. Each of the component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary children. The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item. The carousel advances between items if the user swipes or uses the customizable arrow buttons.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css" crossorigin="anonymous">
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
      href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
    ></script>
    <style>
      bento-base-carousel,
      bento-base-carousel > div {
        aspect-ratio: 4/1;
      }
      .red {
        background: darkred;
      }
      .blue {
        background: steelblue;
      }
      .green {
        background: seagreen;
      }
    </style>
  </head>
  <body>
    <bento-base-carousel id="my-carousel">
      <div class="red"></div>
      <div class="blue"></div>
      <div class="green"></div>
    </bento-base-carousel>
  </body>
</html>
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `bento-base-carousel` component API is accessible by including the following script tag in your document:

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
      href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
    ></script>
    <style>
      bento-base-carousel,
      bento-base-carousel > div {
        aspect-ratio: 4/1;
      }
      .red {
        background: darkred;
      }
      .blue {
        background: steelblue;
      }
      .green {
        background: seagreen;
      }
    </style>
  </head>
  <body>
    <bento-base-carousel id="my-carousel">
      <div class="red"></div>
      <div class="blue"></div>
      <div class="green"></div>
    </bento-base-carousel>
    <div class="buttons" style="margin-top: 8px">
      <button id="prev-button">Go to previous slide</button>
      <button id="next-button">Go to next slide</button>
      <button id="go-to-button">Go to slide with green gradient</button>
    </div>

    <script>
      (async () => {
        const carousel = document.querySelector('#my-carousel');
        await customElements.whenDefined('bento-base-carousel');
        const api = await carousel.getApi();

        // programatically advance to next slide
        api.next();

        // set up button actions
        document.querySelector('#prev-button').onclick = () => api.prev();
        document.querySelector('#next-button').onclick = () => api.next();
        document.querySelector('#go-to-button').onclick = () =>
          api.goToSlide(2);
      })();
    </script>
  </body>
</html>
```

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Actions

The `bento-base-carousel` API allows you to perform the following actions:

##### next()

Moves the carousel forwards by `advance-count` slides.

```javascript
api.next();
```

##### prev()

Moves the carousel backwards by `advance-count` slides.

```javascript
api.prev();
```

##### goToSlide(index: number)

Moves the carousel to the slide specified by the `index` argument. Note: `index` will be normalized to a number greater than or equal to `0` and less than the number of slides given.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Events

The `bento-base-carousel` API allows you to register and respond to the following events:

##### slideChange

This event is triggered when the index displayed by the carousel has changed. The new index is available via `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-base-carousel` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Right-to-left slide change

`<bento-base-carousel>` requires that you define when it is in an right-to-left (rtl) context (e.g. Arabic, Hebrew pages). While the carousel will generally work without this, there may be a few bugs. You can let the carousel know that it should operate as `rtl` as follows:

```html
<bento-base-carousel dir="rtl" …> … </bento-base-carousel>
```

If the carousel is in a RTL context, and you want the carousel to operate as LTR, you can explicitly set the `dir="ltr"` on the carousel.

### Slide layout

Slides are automatically sized by the carousel when **not** specifying `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

The slides have implicit height when the carousel is laid out. This can easily be changed with CSS. When specifying the height, the slide will be vertically centered within the carousel.

If you want to horizontally center your slide content, you will want to create a wrapping element, and use that to center the content.

### Number of visible slides

When changing the number of visible slides using `visible-slides`, in response to a media query, you will likely want to change the aspect ratio of the carousel itself to match the new number of visible slides. For example, if you want to show three slides at a time with a one by one aspect ratio, you would want an aspect ratio of three by one for the carousel itself. Similiarly, with four slides at a time you would want an aspect ratio of four by one. In addition, when changing `visible-slides`, you likely want to change `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Attributes

#### Media Queries

The attributes for `<bento-base-carousel>` can be configured to use different options based on a [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Number of visible slides

##### mixed-length

Either `true` or `false`, defaults to `false`. When true, uses the existing width (or height when horizontal) for each of the slides. This allows for a carousel with slides of different widths to be used.

##### visible-count

A number, defaults to `1`. Determines how many slides should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible. This option is ignored when `mixed-length` is `true`.

##### advance-count

A number, defaults to `1`. Determines how many slides the carousel will advance when advancing using the previous or next arrows. This is useful when specifying the `visible-count` attribute.

#### Auto advance

##### auto-advance

Either `true` or `false`, defaults to `false`. Automatically advances the carousel to the next slide based on a delay. If the user manually changes slides, then the auto advance is stopped. Note that if `loop` is not enabled, when reaching the last item, the auto advance will move backwards to the first item.

##### auto-advance-count

A number, defaults to `1`. Determines how many slides the carousel will advance when automatically advancing. This is useful when specifying the `visible-count` attribute.

##### auto-advance-interval

A number, defaults to `1000`. Specifies the amount of time, in milliseconds, between subsequent automatic advances of the carousel.

##### auto-advance-loops

A number, defaults to `∞`. The number of times the carousel should advance through the slides before stopping.

#### Snapping

##### snap

Either `true` or `false`, defaults to `true`. Determines whether or not the carousel should snap on slides when scrolling.

##### snap-align

Either `start` or `center`. When start aligning, the start of a slide (e.g. the left edge, when horizontal aligning) is aligned with the start of a carousel. When center aligning, the center of a slide is aligned with the center of a carousel.

##### snap-by

A number, defaults to `1`. This determines the granularity of snapping and is useful when using `visible-count`.

#### Miscellaneous

##### controls

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

##### slide

A number, defaults to `0`. This determines the initial slide shown in the carousel. This may be mutated with `Element.setAttribute` to control which slide is currently showing.

##### loop

Either `true` or `false`, defaults to `false` when omitted. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three times the `visible-count` of slides present for looping to occur.

##### orientation

Either `horizontal` or `vertical`, defaults to `horizontal`. When `horizontal` the carousel will lay out horizontally, with the user being able to swipe left and right. When `vertical`, the carousel lays out vertically, with the user being able to swipe up and down.

### Styling

You may use the `bento-base-carousel` element selector to style the carousel freely.

#### Customizing arrow buttons

Arrow buttons can be customized by passing in your own custom markup. For example, you can recreate the default styling with the following HTML and CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `BentoBaseCarousel` component API is accessible by passing a `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Actions

The `BentoBaseCarousel` API allows you to perform the following actions:

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

The `BentoBaseCarousel` API allows you to register and respond to the following events:

##### onSlideChange

This event is triggered when the index displayed by the carousel has changed.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Layout and style

#### Container type

The `BentoBaseCarousel` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Or via `className`:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Right-to-left slide change

`<BentoBaseCarousel>` requires that you define when it is in an right-to-left (rtl) context (e.g. Arabic, Hebrew pages). While the carousel will generally work without this, there may be a few bugs. You can let the carousel know that it should operate as `rtl` as follows:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

If the carousel is in a RTL context, and you want the carousel to operate as LTR, you can explicitly set the `dir="ltr"` on the carousel.

### Slide layout

Slides are automatically sized by the carousel when **not** specifying `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

The slides have implicit height when the carousel is laid out. This can easily be changed with CSS. When specifying the height, the slide will be vertically centered within the carousel.

If you want to horizontally center your slide content, you will want to create a wrapping element, and use that to center the content.

### Number of visible slides

When changing the number of visible slides using `visibleSlides`, in response to a media query, you will likely want to change the aspect ratio of the carousel itself to match the new number of visible slides. For example, if you want to show three slides at a time with a one by one aspect ratio, you would want an aspect ratio of three by one for the carousel itself. Similiarly, with four slides at a time you would want an aspect ratio of four by one. In addition, when changing `visibleSlides`, you likely want to change `advanceCount`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel visibleCount={count} advanceCount={count}>
  <img style={{height: '100%', width: '100%'}} src="…" />…
</BentoBaseCarousel>
```

### Props

#### Number of visible slides

##### mixedLength

Either `true` or `false`, defaults to `false`. When true, uses the existing width (or height when horizontal) for each of the slides. This allows for a carousel with slides of different widths to be used.

##### visibleCount

A number, defaults to `1`. Determines how many slides should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible. This option is ignored when `mixedLength` is `true`.

##### advanceCount

A number, defaults to `1`. Determines how many slides the carousel will advance when advancing using the previous or next arrows. This is useful when specifying the `visibleCount` attribute.

#### Auto advance

##### autoAdvance

Either `true` or `false`, defaults to `false`. Automatically advances the carousel to the next slide based on a delay. If the user manually changes slides, then the auto advance is stopped. Note that if `loop` is not enabled, when reaching the last item, the auto advance will move backwards to the first item.

##### autoAdvanceCount

A number, defaults to `1`. Determines how many slides the carousel will advance when automatically advancing. This is useful when specifying the `visible-count` attribute.

##### autoAdvanceInterval

A number, defaults to `1000`. Specifies the amount of time, in milliseconds, between subsequent automatic advances of the carousel.

##### autoAdvanceLoops

A number, defaults to `∞`. The number of times the carousel should advance through the slides before stopping.

#### Snapping

##### snap

Either `true` or `false`, defaults to `true`. Determines whether or not the carousel should snap on slides when scrolling.

##### snapAlign

Either `start` or `center`. When start aligning, the start of a slide (e.g. the left edge, when horizontal aligning) is aligned with the start of a carousel. When center aligning, the center of a slide is aligned with the center of a carousel.

##### snapBy

A number, defaults to `1`. This determines the granularity of snapping and is useful when using `visible-count`.

#### Miscellaneous

##### controls

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

##### defaultSlide

A number, defaults to `0`. This determines the initial slide shown in the carousel.

##### loop

Either `true` or `false`, defaults to `false` when omitted. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three times the `visible-count` of slides present for looping to occur.

##### orientation

Either `horizontal` or `vertical`, defaults to `horizontal`. When `horizontal` the carousel will lay out horizontally, with the user being able to swipe left and right. When `vertical`, the carousel lays out vertically, with the user being able to swipe up and down.

### Styling

You may use the `BentoBaseCarousel` element selector to style the carousel freely.

#### Customizing arrow buttons

Arrow buttons can be customized by passing in your own custom markup. For example, you can recreate the default styling with the following HTML and CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
