<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-carousel"></a> `amp-carousel`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A generic carousel for displaying multiple similar pieces of content along a horizontal axis; meant to be highly flexible and performant.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-carousel/">Annotated code example for amp-carousel.html</a><br /><a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/">Annotated code example for Image Galleries with amp-carousel</a></td>
  </tr>
</table>

## Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item.

The carousel advances between items if the user swipes, uses arrow keys, or clicks an optional navigation arrow.

**Example**: While the example shows a carousel of images, `amp-carousel` supports arbitrary HTML children.

```html
<amp-carousel width=300 height=400>
  <amp-img src="my-img1.png" width=300 height=400></amp-img>
  <amp-img src="my-img2.png" width=300 height=400></amp-img>
  <amp-img src="my-img3.png" width=300 height=400></amp-img>
</amp-carousel>
```

### Advancing `amp-carousel[type="slides"]` to a specific slide
Setting a method for the `on` attribute on an element to `tap:carousel-id.goToSlide(index=N)` will, on user tap or click, advance a carousel with the ID "carousel-id" to the slide at index=N (the first slide is at index=0, the second slide is at index=1, and so on)

Example:
```html
<amp-carousel id="carousel-with-preview"
    width="400"
    height="300"
    layout="responsive"
    type="slides">
  <amp-img src="https://example.com/path/to?image=10"
      width="400"
      height="300"
      layout="responsive"
      alt="a sample image"></amp-img>
  <amp-img src="https://example.com/path/to?image=11"
      width="400"
      height="300"
      layout="responsive"
      alt="a sample image"></amp-img>
</amp-carousel>
<div class="carousel-preview">
  <button on="tap:carousel-with-preview.goToSlide(index=0)">
    <amp-img src="https://example.com/path/to?image=10"
        width="60"
        height="40"
        layout="responsive"
        alt="a sample image"></amp-img>
  </button>
  <button on="tap:carousel-with-preview.goToSlide(index=1)">
    <amp-img src="https://example.com/path/to?image=11"
        width="60"
        height="40"
        layout="responsive"
        alt="a sample image"></amp-img>
  </button>
</div>
```


## Attributes

**controls**

If present, displays left and right arrows for the user to use in navigation on mobile.
Visibility of arrows can also be controlled via styling, and a media query can be used to
only display arrows at certain screen widths. On desktop, arrows will always be displayed
unless only a single child is present.

Usage example:

```html
<amp-carousel width="100" height="100" data-next-button-aria-label="Go to next slide" data-previous-button-aria-label="Go to previous slide" controls layout="responsive" type="slides">
```

**type**

- `carousel` (default): All slides are shown and are scrollable horizontally.
  The `carousel` type only supports the following layouts: `fixed`, `fixed-height`, and `nodisplay`.
- `slides`: Shows a single slide at a time. It supports the following layouts: `fill`, `fixed`, `fixed-height`, `flex-item`, `nodisplay`, and `responsive`.

**loop** (type=slides only)

If present, the user may advance past the first item or the final item.

**autoplay** (type=slides only)

If present:

- Advances the slide to the next slide without user interaction.
By default, `autoplay` advances a slide in 5000 millisecond intervals (5 seconds); this can be overridden by the `delay` attribute.
- Attaches the `loop` attribute to `amp-carousel` if `loop` is not already present.

**delay** (type=slides only)

By default, a slide will advance in 5000 millisecond intervals (5 seconds)
when `autoplay` is specified and will use the value of the `delay`
attribute if present (minimum of 1000 ms; an error will be thrown if it's any lower). The value of `delay` must be a number of milliseconds, e.g. `delay=5000`.

**height** (required)

The height of the carousel, in pixels.

**data-next-button-aria-label**  (optional)
- sets the aria-label for the amp-carousel-button-next
- if no value is given, aria-label will default to 'Next item in carousel'

**data-prev-button-aria-label**  (optional)
- sets the aria-label for the amp-carousel-button-prev
- if no value is given, aria-label will default to 'Previous item in carousel'

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Styling
- You may use the `amp-carousel` element selector to style it freely.
- You may use the `.amp-carousel-slide` class selector to target carousel items.
- The visual state of an `amp-carousel` button when it's disabled is hidden.
- By default, `.amp-carousel-button` uses an inlined SVG as the background-image of the buttons. You may override this with your own SVG or image as in the example below.


**Example**: Default `.amp-carousel-button` inlined SVG

```css
.amp-carousel-button-prev {
  left: 16px;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z" fill="#fff" /></svg>');
}
```

**Example**: Overriding the default `.amp-carousel-button` inlined SVG

```css
.amp-carousel-button-prev {
  left: 5%;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z" fill="#fff" /></svg>');
}
```

## Validation

See [amp-carousel rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-carousel/0.1/validator-amp-carousel.protoascii) in the AMP validator specification.
