---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content at a time along a horizontal axis, for features like related products or articles.
experimental: true
bento: true
---

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

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-stream-gallery`, see [**`bento-stream-gallery`**](./1.0/README.md).

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
options based on a [media query](./../../docs/spec/amp-html-responsive-attributes.md).

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
