---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis or vertical axis.
experimental: true
bento: true
---

<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-base-carousel

## Usage

A generic carousel for displaying multiple similar pieces of content along a
horizontal or vertical axis.

Each of the `amp-base-carousel` component’s immediate children is considered an
item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional
navigational arrows to go forward or backwards a single item.

The carousel advances between items if the user swipes or uses the customizable
arrow buttons.

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-base-carousel` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.css">
  <script async custom-element="amp-base-carousel" src="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.js"></script>
  <style>
    amp-base-carousel, amp-base-carousel > div {
      aspect-ratio: 4/1;
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
  </style>
</head>
<amp-base-carousel id="my-carousel">
  <div class="red-gradient"></div>
  <div class="blue-gradient"></div>
  <div class="green-gradient"></div>
</amp-base-carousel>
<div class="buttons" style="margin-top: 8px;">
  <button id='prev-button'>Go to previous slide</button>
  <button id='next-button'>Go to next slide</button>
  <button id='go-to-button'>Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('amp-base-carousel');
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

The `amp-base-carousel` component API is accessible by including the following script tag in your document:

```
await customElements.whenDefined('amp-base-carousel');
const api = await carousel.getApi();
```

##### Actions

The `amp-base-carousel` API allows you to perform the following actions:

**next()**
Moves the carousel forwards by `advance-count` slides.

```
api.next();
```

**prev()**
Moves the carousel backwards by `advance-count` slides.

```
api.prev();
```

**goToSlide(index: number)**
Moves the carousel to the slide specified by the `index` argument.
Note: `index` will be normalized to a number greater than or equal to `0` and less than the number of slides given.

```
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Events

The `amp-base-carousel` API allows you to register and respond to the following events:

**slideChange**

This event is triggered when the index displayed by the carousel has changed.
The new index is available via `event.data.index`.

```
carousel.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-base-carousel` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
amp-base-carousel {
  height: 100px;
  width: 100%;
}

amp-base-carousel > * {
  aspect-ratio: 4/1
}
```

### Behavior users should be aware of

#### RTL

`<amp-base-carousel>` currently requires that you let it know when it is in an
right-to-left (rtl) context (e.g. Arabic, Hebrew pages). While the carousel will
generally work without this, there may be a few bugs. You can let the carousel
know that it should operate as `rtl` as follows:

```html
<amp-base-carousel dir="rtl" …>
  …
</amp-base-carousel>
```

If the carousel is in a RTL context, and you want the carousel to operate as
LTR, you can explicitly set the `dir="ltr"` on the carousel.

#### Slide layout

Slides are automatically sized by the carousel when **not** specifying
`mixed-lengths`. You should give the slides `layout="flex-item"`:

```html
<amp-base-carousel …>
  <amp-img layout="flex-item" src="…"></amp-img>
</amp-base-carousel>
```

The slides have a default height of `100%` when the carousel is laid out
horizontally. This can easily be changed with CSS or by using
`layout="fixed-height"`. When specifying the height, the slide will be
vertically centered within the carousel.

If you want to horizontally center your slide content, you will want to create a
wrapping element, and use that to center the content.

#### Number of Visible Slides

When changing the number of visible slides using `visible-slides`, in response
to a media query, you will likely want to change the aspect ratio of the
carousel itself to match the new number of visible slides. For example, if you
want to show three slides at a time with a one by one aspect ratio, you would
want an aspect ratio of three by one for the carousel itself. Similiarly, with
four slides at a time you would want an aspect ratio of four by one. In
addition, when changing `visible-slides`, you likely want to change
`advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<amp-base-carousel
  layout="responsive"
  width="3"
  height="1"
  heights="(min-width: 600px) calc(100% * 4 * 3 / 2), calc(100% * 3 * 3 / 2)"
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <amp-img layout="flex-item" src="…"></amp-img>
  …
</amp-base-carousel>
```

## Attributes

### Media Queries

The attributes for `<amp-base-carousel>` can be configured to use different
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

### Configuration Options

#### Number of Visible Slides

##### mixed-length

Either `true` or `false`, defaults to `false`. When true, uses the existing
width (or height when horizontal) for each of the slides. This allows for a
carousel with slides of different widths to be used.

##### visible-count

A number, defaults to `1`. Determines how many slides should be shown at a given
time. Fractional values can be used to make part of a(n) additional slide(s)
visible. This option is ignored when `mixed-length` is `true`.

##### advance-count

A number, defaults to `1`. Determines how many slides the carousel will advance
when advancing using the previous or next arrows. This is useful when specifying
the `visible-count` attribute.

#### Auto Advance

##### auto-advance

Either `true` or `false`, defaults to `false`. Automatically advances the
carousel to the next slide based on a delay. If the user manually changes
slides, then the auto advance is stopped. Note that if `loop` is not enabled,
when reaching the last item, the auto advance will move backwards to the first
item.

##### auto-advance-count

A number, defaults to `1`. Determines how many slides the carousel will advance
when automatically advancing. This is useful when specifying the `visible-count`
attribute.

##### auto-advance-interval

A number, defaults to `1000`. Specifies the amount of time, in milliseconds,
between subsequent automatic advances of the carousel.

##### auto-advance-loops

A number, defaults to `∞`. The number of times the carousel should advance
through the slides before stopping.

#### Snapping

##### snap

Either `true` or `false`, defaults to `true`. Determines whether or not the
carousel should snap on slides when scrolling.

##### snap-align

Either `start` or `center`. When start aligning, the start of a slide (e.g. the
left edge, when horizontal aligning) is aligned with the start of a carousel.
When center aligning, the center of a slide is aligned with the center of a
carousel.

##### snap-by

A number, defaults to `1`. This determines the granularity of snapping and is
useful when using `visible-count`.

#### Miscellaneous

##### controls

Either `"always"`, `"auto"`, or `"never"`, defaults to `"auto"`. This determines if and when prev/next navigational arrows are displayed. Note: When `outset-arrows` is `true`, the arrows are shown `"always"`.

-   `always`: Arrows are always displayed.
-   `auto`: Arrows are displayed when the carousel has most recently received interaction via mouse, and not displayed when the carousel has most recently received interaction via touch. On first load for touch devices, arrows are displayed until first interaction.
-   `never`: Arrows are never displayed.

##### slide

A number, defaults to `0`. This determines the initial slide shown in the
carousel. This may be used with `amp-bind` to control which slide is currently
showing.

##### loop

Either `true` or `false`, defaults to `false` when omitted. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three times the `visible-count` of slides present for looping to occur.

##### orientation

Either `horizontal` or `vertical`, defaults to `horizontal`. When `horizontal` the carousel will lay out horizontally, with the user being able to swipe left and right. When `vertical`, the carousel lays out vertically, with the user being able to swipe up and down.

##### common attributes

This element includes
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Actions

### next

Moves the carousel forwards by `advance-count` slides.

### prev

Moves the carousel backwards by `advance-count` slides.

### goToSlide

Moves the carousel to the slide specified by the `index` argument.

## Events

### slideChange

This event is triggered when the index displayed by the carousel has changed.
The new index is available via `event.index`.

## Styling

You may use the `amp-base-carousel` element selector to style the carousel
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
<amp-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</amp-base-carousel>
```

If you want more customization for the arrow buttons, you can use the `next` and
`prev` actions. For example, if you want to place buttons under the carousel and
use the words "Previous" and "Next" instead of having them in the default
location, you can use the following HTML:

```html
  <amp-base-carousel id="carousel-1" …>
    …
    <div slot="next-arrow"></div>
    <div slot="prev-arrow"></div>
  </amp-carousel>
  <button on="tap:carousel-1.prev()">Previous</button>
  <button on="tap:carousel-1.next()">Next</button>
```

## Version notes

Unlike `0.1`, the experimental `1.0` version of `amp-base-carousel` allows configuring the carousel slide orientation via `"orientation"="horizontal"|"vertical"` attributes instead of `"horizontal"="true"|"false"` attributes.
