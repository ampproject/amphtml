---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content at a time along a horizontal axis, for features like related products or articles.
experimental: true
bento: true
---

<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# amp-stream-gallery

## Usage

A stream gallery for displaying multiple similar pieces of content at a time along a
horizontal axis. To implement a more customized UX, see
[`amp-base-carousel`](https://amp.dev/documentation/components/amp-base-carousel/).

_Example:_

In the following example, we use `amp-stream-gallery` to display its content
in a responsive container, showing a varying amount of its children at a time
according to the viewport size.

```html
<amp-stream-gallery width="7.5" height="2" layout="responsive">
  <amp-img src="img1.png" layout="flex-item"></amp-img>
  <amp-img src="img2.png" layout="flex-item"></amp-img>
  <amp-img src="img3.png" layout="flex-item"></amp-img>
  <amp-img src="img4.png" layout="flex-item"></amp-img>
  <amp-img src="img5.png" layout="flex-item"></amp-img>
  <amp-img src="img6.png" layout="flex-item"></amp-img>
  <amp-img src="img7.png" layout="flex-item"></amp-img>
</amp-stream-gallery>
```

Each of the `amp-stream-gallery` component’s immediate children is considered an
item in the gallery. Each of these nodes may also have arbitrary HTML children.

The gallery consists of an arbitrary number of items, as well as optional
navigational arrows to go forward or backwards by a given number of items.

The gallery advances between items if the user swipes or uses the customizable
arrow buttons.

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-stream-gallery` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-stream-gallery-1.0.css">
  <script async custom-element="amp-stream-gallery" src="https://cdn.ampproject.org/v0/amp-stream-gallery-1.0.js"></script>
  <style>
    amp-stream-gallery {
      aspect-ratio: 3/1;
    }
    amp-stream-gallery > div {
      aspect-ratio: 1/1;
    }
    .red-gradient {
      background: brown;
      background: linear-gradient(90deg, brown 50%, lightsalmon 90%, wheat 100%);
    }
    .blue-gradient {
      background: steelblue;
      background: linear-gradient(90deg, steelblue 50%, plum 90%, lavender 100%);
    }
    .green-gradient {
      background: seagreen;
      background: linear-gradient(90deg, seagreen 50%, mediumturquoise 90%, turquoise 100%);
    }
    .pink-gradient {
      background: pink;
      background: linear-gradient(90deg, pink 50%, lightsalmon 90%, wheat 100%);
    }
    .yellow-gradient {
      background: gold;
      background: linear-gradient(90deg, gold 50%, goldenrod 90%, darkgoldenrod 100%);
    }
    .orange-gradient {
      background: peru;
      background: linear-gradient(90deg, peru 50%, chocolate 90%, saddlebrown 100%);
    }
    .seafoam-gradient {
      background: darkseagreen;
      background: linear-gradient(90deg, darkseagreen 50%, lightseagreen 90%, MediumAquaMarine 100%);
    }
    .purple-gradient {
      background: rebeccapurple;
      background: linear-gradient(90deg, rebeccapurple 50%, mediumpurple 90%, mediumslateblue 100%);
    }
    .cyan-gradient {
      background: darkcyan;
      background: linear-gradient(90deg, darkcyan 50%, lightcyan 90%, white 100%);
    }
  </style>
</head>
<amp-stream-gallery id="my-carousel" max-visible-count="3">
  <div class="red-gradient"></div>
  <div class="blue-gradient"></div>
  <div class="green-gradient"></div>

  <div class="pink-gradient"></div>
  <div class="yellow-gradient"></div>
  <div class="orange-gradient"></div>

  <div class="seafoam-gradient"></div>
  <div class="purple-gradient"></div>
  <div class="cyan-gradient"></div>
</amp-stream-gallery>
<div class="buttons" style="margin-top: 8px;">
  <button id='prev-button'>Go to previous page of slides</button>
  <button id='next-button'>Go to next page of slides</button>
  <button id='go-to-button'>Go to slide with green gradient</button>
</div>
<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('amp-stream-gallery');
    const api = await carousel.getApi();
    // programatically advance to next slide
    api.next();
    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-stream-gallery` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined('amp-stream-gallery');
const api = await carousel.getApi();
```

##### Actions

The `amp-stream-gallery` API allows you to perform the following actions:

**next()**
Moves the carousel forwards by `advance-count` slides.

```js
api.next();
```

**prev()**
Moves the carousel backwards by `advance-count` slides.

```js
api.prev();
```

**goToSlide(index: number)**
Moves the carousel to the slide specified by the `index` argument.
Note: `index` will be normalized to a number greater than or equal to `0` and less than the number of slides given.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Events

The `amp-stream-gallery` API allows you to register and respond to the following events:

**slideChange**

This event is triggered when the index displayed by the carousel has changed.
The new index is available via `event.data.index`.

```js
carousel.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-stream-gallery-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-stream-gallery` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
amp-stream-gallery {
  height: 100px;
  width: 100%;
}
amp-stream-gallery > * {
  aspect-ratio: 4/1
}
```

### Behavior users should be aware of

#### Slide layout

Slides are automatically sized by the carousel. You should give the slides `layout="flex-item"`:

```html
<amp-stream-gallery …>
  <amp-img layout="flex-item" src="…"></amp-img>
</amp-stream-gallery>
```

The slides have a default height of `100%` when the carousel is laid out
horizontally. This can easily be changed with CSS or by using
`layout="fixed-height"`. When specifying the height, the slide will be
vertically centered within the carousel.

If you want to horizontally center your slide content, you will want to create a
wrapping element, and use that to center the content.

## Attributes

### Media Queries

The attributes for `<amp-stream-gallery>` can be configured to use different
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

### Behavior

#### controls

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

#### extra-space

Either `"around"` or undefined. This determines how extra space is allocated after displaying the calculated number of visible slides in the carousel. If `"around"`, white space is evenly distributed around the carousel with `justify-content: center`; otherwise, space is allocated to the right of the carousel for LTR documents and to the left for RTL documents.

#### loop

Either `true` or `false`, defaults to `true`. When true, the carousel will allow
the user to move from the first item back to the last item and visa versa. There
must be at least three slides present for looping to occur.

#### outset-arrows

Either `true` or `false`, defaults to `false`. When true, the carousel will display its arrows outset and on either side of the slides. Note that with outset arrows, the slide container will have an effective length of 100px less than the allotted space for its given container - 50px per arrow on either side. When false, the carousel will display its arrows inset and overlayed on top of the left and right edges of the slides.

#### peek

A number, defaults to `0`. This determines how much of an additional slide to show (on one or both sides of the current slide) as an affordance to the user indicating the carousel is swipeable.

#### common attributes

This element includes
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

### Gallery slide visibility

#### min-visible-count

A number, defaults to `1`. Determines the minimum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s)
visible.

#### max-visible-count

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum number of slides that should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible.

#### min-item-width

A number, defaults to `1`. Determines the minimum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

#### max-item-width

A number, defaults to [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Determines the maximum width of each item, used to resolve how many whole items can be shown at once within the overall width of the gallery.

### Slide snapping

#### slide-align

Either `start` or `center`. When start aligning, the start of a slide (e.g. the
left edge, when horizontal aligning) is aligned with the start of a carousel.
When center aligning, the center of a slide is aligned with the center of a
carousel.

#### snap

Either `true` or `false`, defaults to `true`. Determines whether or not the
carousel should snap on slides when scrolling.

## Actions

### next

Moves the carousel forwards by the calculated number of visible slides.

### prev

Moves the carousel backwards by the calculated number of visible slides.

### goToSlide

Moves the carousel to the slide specified by the `index` argument.

## Events

### slideChange

This event is triggered when the index displayed by the carousel has changed.
The new index is available via `event.index`.

## Styling

You may use the `amp-stream-gallery` element selector to style the carousel
freely.

### Customizing Arrow Buttons

Arrow buttons can be customized by passing in your own custom markup. For
example, you can recreate the default styling with the following HTML and CSS:

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
<amp-stream-gallery …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</amp-stream-gallery>
```

If you want more customization for the arrow buttons, you can use the `next` and
`prev` actions. For example, if you want to place buttons under the carousel and
use the words "Previous" and "Next" instead of having them in the default
location, you can use the following HTML:

```html
  <amp-stream-gallery id="carousel-1" …>
    …
    <div slot="next-arrow"></div>
    <div slot="prev-arrow"></div>
  </amp-stream-gallery>
  <button on="tap:carousel-1.prev()">Previous</button>
  <button on="tap:carousel-1.next()">Next</button>
```
