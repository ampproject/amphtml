---
$category@: layout
formats:
  - websites
  - email
  - ads
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis.
---

# amp-carousel

A generic carousel for displaying multiple similar pieces of content along a horizontal axis; meant to be highly flexible and performant.

## Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards. For `type="slides"`, the arrows moves one item at a time. For `type="carousel"`, the arrows move one carousel's width forwards or backwards at a time.

The carousel advances between items if the user swipes or clicks an optional navigation arrow.

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

### Advancing to a specific slide

Setting a method for the `on` attribute on an element to `tap:carousel-id.goToSlide(index=N)` will, on user tap or click, advance a carousel with the "carousel-id" ID to the slide at index=N (the first slide is at index=0, the second slide is at index=1, and so on).

In the following example, we have a carousel of three images with preview buttons below the carousel. When a user clicks one of the buttons, the corresponding carousel item displays.

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

<table>
  <tr>
    <td width="40%"><strong>type</strong></td>
    <td>Specifies the display type for the carousel items, which can be:
<ul>
  <li>**`carousel`** (default): All slides are shown and are scrollable horizontally. This type supports only the following layouts: `fixed`, `fixed-height`, and `nodisplay`.</li>
  <li>**`slides`**: Shows a single slide at a time. This type supports the following layouts: `fill`, `fixed`, `fixed-height`, `flex-item`, `nodisplay`, and `responsive`.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>height (required)</strong></td>
    <td>Specifies the height of the carousel, in pixels.</td>
  </tr>
  <tr>
    <td width="40%"><strong>controls (optional)</strong></td>
    <td>Permanently displays left and right arrows for the user to navigate carousel items on mobile devices.
By default, navigational arrows disappear after a few seconds on mobile.
The visibility of arrows can also be controlled via styling, and a media query can be used to only display arrows at certain screen widths. On desktop, arrows are always displayed unless only a single child is present.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-next-button-aria-label (optional)</strong></td>
    <td>Sets the aria-label for the <code>amp-carousel-button-next</code>. If no value is given, the aria-label defaults to 'Next item in carousel'.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-prev-button-aria-label (optional)</strong></td>
    <td>Sets the aria-label for the <code>amp-carousel-button-prev</code>. If no value is given, the aria-label defaults to 'Previous item in carousel'.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-button-count-format (optional)</strong></td>
    <td>A format string that looks like <code>(%s of %s)</code>, used as a suffix to the aria-label for <code>amp-carousel-button-next</code>/<code>amp-carousel-button-prev</code>. This provides information to users using a screen reader on their progress through the carousel. If no value is given, this defaults to '(%s of %s)'.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay (optional)</strong></td>
    <td><p>Regularly advances to the next slide without user interaction. If the user manually changes slides, then autoplay is stopped.<br>
  If present without a value:</p>
<ul>
  <li>By default, advances a slide in 5000 millisecond intervals (5 seconds); this can be overridden by the `delay` attribute.</li>
  <li>Attaches the `loop` attribute to `amp-carousel` if `loop` is not already present.</li>
  <li>Requires at least 2 slides for autoplay to occur.</li>
  <li>Applies only to carousels with `type=slides`.</li>
</ul>
<p>If present with a value:</p>
<ul>
  <li>Attaches the `loop` attribute to `amp-carousel` if `loop` is not already present.</li>
  <li>Removes the `loop` attribute after the requisite number of loops are made.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>delay (optional)</strong></td>
    <td>Specifies the duration (in milliseconds) to delay advancing to the next slide when <code>autoplay</code> is enabled.  Note that the minimum allowed value for <code>delay</code> is 1000 milliseconds.The <code>delay</code> attribute is only applicable to carousels with <code>type=slides</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>loop (optional)</strong></td>
    <td><p>Allows the user to advance past the first item or the final item. There must be at least 3 slides for looping to occur. The <code>loop</code> attribute is only applicable to carousels with <code>type=slides</code>.</p>
<p><em>Example: Displays a slides carousel with controls, looping, and delayed autoplay</em></p>

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

[/example]</td>

  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Styling

-   You may use the `amp-carousel` element selector to style it freely.
-   You may use the `.amp-carousel-slide` class selector to target carousel items.
-   The visual state of an `amp-carousel` button when it's disabled is hidden.
-   By default, `.amp-carousel-button` uses an inlined SVG as the background-image of the buttons. You may override this with your own SVG or image as in the example below.

_Example: Default `.amp-carousel-button` inlined SVG_

```css
.amp-carousel-button-prev {
  left: 16px;
  background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="%23fff"%3E%3Cpath d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"/%3E%3C/svg%3E');
}
```

_Example: Overriding the default `.amp-carousel-button` inlined SVG_

```css
.amp-carousel-button-prev {
  left: 5%;
  background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="%23fff"%3E%3Cpath d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z"  /%3E%3C/svg%3E');
}
```

Note that the SVG content needs to have certain characters, including `<`, `>` and `#` encoded. This can be done using a tool like [SVGO](https://github.com/svg/svgo) or using [`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

## Supported Layouts for Slides

As noted above, the `type="slides"` designation on `amp-carousel 0.1` supports the following layouts: `fill`, `fixed`, `fixed-height`, `flex-item`, `nodisplay`, and `responsive`.

Publishers should be aware that while this mode explicitly supports `fixed` layout sizes, it also employs `display: flex;` in its styling. In other words nested elements can have `layout=fixed` sizing, though via styling it only respects absolute width up to 100%. One way to workaround this limitation is by using `flex-shrink: 0` on any fixed layout slides.

For an accessible and smooth user experience, it is generally good practice when using `type="slides"` that all children of that carousel and the carousel itself share the same dimensional ratios as well as the same layout type.

## Validation

See [amp-carousel rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-carousel/validator-amp-carousel.protoascii) in the AMP validator specification.
