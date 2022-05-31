---
$category@: layout
formats:
  - websites
  - ads
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis.
---

# amp-carousel

## Usage

A generic carousel for displaying multiple similar pieces of content along a
horizontal axis; meant to be flexible and performant.

Each of the `amp-carousel` component’s immediate children is considered an item
in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional
navigational arrows to go forward or backwards. For `type="slides"`, the arrows
moves one item at a time. For `type="carousel"`, the arrows move one carousel's
width forwards or backwards at a time.

The carousel advances between items if the user swipes or clicks an optional
navigation arrow.

[example preview="inline" playground="true" imports="amp-carousel"]

```html
<amp-carousel
  width="450"
  height="300"
  layout="responsive"
  type="slides"
  role="region"
  aria-label="Basic carousel"
>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
    width="450"
    height="300"
  ></amp-img>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image2.jpg"
    width="450"
    height="300"
  ></amp-img>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image3.jpg"
    width="450"
    height="300"
  ></amp-img>
</amp-carousel>
```

[/example]

### Differences from `<amp-carousel>` 0.1

-   `autoplay` is allowed on `type="carousel"`
-   `loop` is allowed on `type="carousel"`

#### Migration Notes

-   Update the required script from `amp-carousel-0.1` to `amp-carousel-0.2`.
-   Ensure any CSS for positioning next/previous arrows is still valid. See the
    [styling](#styling) for more information on arrow positioning.
-   Ensure any CSS used to style the carousel is still valid. The internal DOM
    structure of `<amp-carousel>` 0.2 differs from 0.1, effecting CSS selectors
    targeting internal elements such as `amp-carousel > div`. Any selectors using
    the `.amp-class-name` format should still work.
-   **NOTE**: Support for `amp-carousel-0.1` is limited, with the intent to
    deprecate in the future.

### Advancing to a specific slide

Setting a method for the `on` attribute on an element to
`tap:carousel-id.goToSlide(index=N)` will, on user tap or click, advance a
carousel with the "carousel-id" ID to the slide at index=N (the first slide is
at index=0, the second slide is at index=1, and so on).

In the following example, we have a carousel of three images with preview
buttons below the carousel. When a user clicks one of the buttons, the
corresponding carousel item displays.

[example preview="inline" playground="true" imports="amp-carousel"]

```html
<amp-carousel
  id="carousel-with-preview"
  width="450"
  height="300"
  layout="responsive"
  type="slides"
  role="region"
  aria-label="Carousel with slide previews"
>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
    width="450"
    height="300"
    layout="responsive"
    alt="apples"
  ></amp-img>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image2.jpg"
    width="450"
    height="300"
    layout="responsive"
    alt="lemons"
  ></amp-img>
  <amp-img
    src="{{server_for_email}}/static/inline-examples/images/image3.jpg"
    width="450"
    height="300"
    layout="responsive"
    alt="blueberries"
  ></amp-img>
</amp-carousel>
<div class="carousel-preview">
  <button on="tap:carousel-with-preview.goToSlide(index=0)">
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
      width="60"
      height="40"
      alt="apples"
    ></amp-img>
  </button>
  <button on="tap:carousel-with-preview.goToSlide(index=1)">
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image2.jpg"
      width="60"
      height="40"
      alt="lemons"
    ></amp-img>
  </button>
  <button on="tap:carousel-with-preview.goToSlide(index=2)">
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image3.jpg"
      width="60"
      height="40"
      alt="blueberries"
    ></amp-img>
  </button>
</div>
```

[/example]

### Accessibility considerations for `amp-carousel`

Autoplaying, and particularly infinitely looping, carousels can be very distracting and confusing for users - especially for users with cognitive impairments. In general, we recommend avoiding autoplaying carousels. While autoplaying carousels stop once the user has interacted with the carousel, consider also adding an explicit "Play/Pause" control.

By default, the `<amp-carousel>` is programmatically identified as a list when rendered (using `role="list"` on the container element, and `role="listitem"` on each item). However, for `<amp-carousel type="slides">`, no specific `role` is currently provided. As a result, it will not be obvious for assistive technology users reading/navigating through a page when they reach a carousel. We recommend including an explicit `role="region"` and a descriptive `aria-label` (either a generic `aria-label="Carousel"` or a more descriptive label such as `aria-label="Latest news items"`) to `<amp-carousel>`.

Currently, an `<amp-carousel type="slides">` carousel is declared as an ARIA live region (using `aria-live="polite"`), meaning that every time a new slide is shown, the entire content of the slide is announced by assistive technologies (such as screen readers). Due to the way carousels are initially rendered, this can also result in the carousel's content being announced in its entirety when a page is loaded. This also means that pages that contain an `autoplay` carousel will continuously announce whenever a slide auto-advances. There is currently no work-around for this issue.

## Attributes

### type

Specifies the display type for the carousel items, which can be:

-   carousel (default): All slides are shown and are scrollable horizontally. Each
    slide may specify a different width using CSS.
-   slides: Shows a single slide at a time, with each slide snapping into place as
    the user swipes.

### controls (optional)

Permanently displays left and right arrows for the user to navigate carousel
items on mobile devices. By default, navigational arrows disappear after the
user swipes to another slide on mobile.

The visibility of arrows can also be controlled via styling, and a media query
can be used to only display arrows at certain screen widths. On desktop, arrows
are always displayed unless only a single child is present.

### data-next-button-aria-label (optional)

Sets the aria-label for the `amp-carousel-button-next`. If no value is given,
the aria-label defaults to 'Next item in carousel'.

### data-prev-button-aria-label (optional)

Sets the aria-label for the `amp-carousel-button-prev`. If no value is given,
the aria-label defaults to 'Previous item in carousel'.

### data-button-count-format (optional)

A format string that looks like `(%s of %s)`, used as a suffix to the aria-label
for `amp-carousel-button-next`/`amp-carousel-button-prev`. This provides
information to users using a screen reader on their progress through the
carousel. If no value is given, this defaults to `(%s of %s)`.

### autoplay (optional)

Regularly advances to the next slide without user interaction. If the user
manually changes slides, then autoplay is stopped.

If present without a value:

-   By default, advances a slide in 5000 millisecond intervals (5 seconds); this
    can be overridden by the `delay` attribute.
-   Requires at least 2 slides for autoplay to occur.

If present with a value:

-   Stops autoplaying after the requisite number of loops are made.

### delay (optional)

Specifies the duration (in milliseconds) to delay advancing to the next slide
when `autoplay` is enabled. Note that the minimum allowed value for delay is
1000 milliseconds.

### loop (optional)

Allows the user to advance past the first item or the final item. There must be
at least 3 slides for looping to occur.

The example below displays a slide carousel with controls, looping, and delayed
autoplay.

[example preview="inline" playground="true" imports="amp-carousel"]

```html
<amp-carousel type="slides"
  width="450"
  height="300"
  controls
  loop
  {% if not format=='email'%}  autoplay
  delay="3000"{% endif %}
  data-next-button-aria-label="Go to next slide"
  data-previous-button-aria-label="Go to previous slide"
  role="region"
  aria-label="Looping carousel">
  <amp-img src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
    width="450"
    height="300"></amp-img>
  <amp-img src="{{server_for_email}}/static/inline-examples/images/image2.jpg"
    width="450"
    height="300"></amp-img>
  <amp-img src="{{server_for_email}}/static/inline-examples/images/image3.jpg"
    width="450"
    height="300"></amp-img>
</amp-carousel>
```

[/example]

### slide (optional)

Specifies what index should be shown when the carousel is first rendered. This
can be updated with
[`amp-bind`](../amp-bind/amp-bind.md) to change which
index is shown.

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Actions

### goToSlide(index=INTEGER)

Advances the carousel to a specified slide index.

### toggleAutoplay(toggleOn=true|false)

Toggle the carousel's autoplay status. `toggleOn` is optional.

## Events

### slideChange

Fired when the carousel's current slide changes.

```
// Slide number.
Event.index
```

## Styling

[filter formats="websites, ads"]

-   You may use the `amp-carousel` element selector to style it freely.
-   You may use the `.amp-carousel-slide` class selector to target carousel items.
-   The visual state of an `amp-carousel` button when it's disabled is hidden.
-   By default, `.amp-carousel-button` uses an inlined SVG as the background-image of the buttons. You may override this with your own SVG or image as in the example below.

_Example: Default `.amp-carousel-button` inlined SVG_

```css
.amp-carousel-button-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="%23fff"%3E%3Cpath d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"/%3E%3C/svg%3E');
}
```

_Example: Overriding the default `.amp-carousel-button` inlined SVG_

```css
.amp-carousel-button-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="%23fff"%3E%3Cpath d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z"  /%3E%3C/svg%3E');
}
```

Note that the SVG content needs to have certain characters, including `<`, `>` and `#` encoded. This can be done using a tool like [SVGO](https://github.com/svg/svgo) or using [`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

-   You can position the carousel buttons using align-self and/or relative positioning. Note that the carousel arrows are automatically flipped in RTL, so you should not change their flex order.

```css
.amp-carousel-button-prev {
  position: relative;
  bottom: 20px;
  align-self: flex-end;
}
```

[/filter]<!-- formats="websites, ads" -->

[filter formats="email"]

-   You may use the `amp-carousel` element selector to style it freely.
-   You may use the `.amp-carousel-slide` class selector to target carousel items.
-   The visual state of an `amp-carousel` button when it's disabled is hidden.
-   By default, `.amp-carousel-button` uses an inlined SVG as the background-image of the buttons. You may override this with your own image. Some email clients may not support SVG.

_Example: Overriding the default `.amp-carousel-button` inlined SVG_

```css
.amp-carousel-button-prev {
  background-image: url('http://example.com/arrow.png');
}
```

You can position the carousel buttons using align-self and/or relative positioning. Note that the carousel arrows are automatically flipped in RTL, so you should not change their flex order.

```css
.amp-carousel-button-prev {
  position: relative;
  bottom: 20px;
  align-self: flex-end;
}
```

[/filter]<!-- formats="email" -->

## Validation

See [amp-carousel rules](validator-amp-carousel.protoascii) in the AMP validator specification.
