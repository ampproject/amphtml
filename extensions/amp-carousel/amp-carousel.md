---
$category@: layout
formats:
  - websites
  - email
  - ads
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis.
---
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

# amp-carousel

A generic carousel for displaying multiple similar pieces of content along a horizontal axis; meant to be highly flexible and performant.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>
      <ul>
        <li>carousel: fixed, fixed-height, and nodisplay.</li>
        <li>slides: fill, fixed, fixed-height, flex-item, nodisplay, and responsive.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>AMP By Example's:<ul>
      <li><a href="https://ampbyexample.com/components/amp-carousel/">amp-carousel example</a></li>
      <li><a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/">Image galleries with amp-carousel</a></td>
  </tr>
</table>

## Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item.

The carousel advances between items if the user swipes, uses arrow keys, or clicks an optional navigation arrow.

<!--embedded example - displays in ampproject.org -->
<div>
  <amp-iframe height="313"
              layout="fixed-height"
              sandbox="allow-scripts allow-forms allow-same-origin"
              resizable
              src="https://ampproject-b5f4c.firebaseapp.com/examples/ampcarousel.basic.embed.html">
    <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
    <div placeholder></div>
  </amp-iframe>
</div>


### Advancing to a specific slide

Setting a method for the `on` attribute on an element to `tap:carousel-id.goToSlide(index=N)` will, on user tap or click, advance a carousel with the "carousel-id" ID  to the slide at index=N (the first slide is at index=0, the second slide is at index=1, and so on).

In the following example, we have a carousel of three images with preview buttons below the carousel. When a user clicks one of the buttons, the corresponding carousel item displays.

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="878"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampcarousel.advance-slide.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

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
    <td><p>Advances the slide to the next slide without user interaction.<br>
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
    <td>Specifies the duration (in milliseconds) to delay advancing to the next slide when <code>autoplay</code> is enabled. The <code>delay</code> attribute is only applicable to carousels with <code>type=slides</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>loop (optional)</strong></td>
    <td><p>Allows the user to advance past the first item or the final item. There must be at least 3 slides for looping to occur. The <code>loop</code> attribute is only applicable to carousels with <code>type=slides</code>.</p>
<p><em>Example: Displays a slides carousel with controls, looping, and delayed autoplay</em></p>
<!--embedded example - displays in ampproject.org -->
<div>
  <amp-iframe height="446" layout="fixed-height" sandbox="allow-scripts allow-forms allow-same-origin" resizable src="https://ampproject-b5f4c.firebaseapp.com/examples/ampcarousel.controls.embed.html">
    <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
    <div placeholder></div>
  </amp-iframe>
</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Styling
- You may use the `amp-carousel` element selector to style it freely.
- You may use the `.amp-carousel-slide` class selector to target carousel items.
- The visual state of an `amp-carousel` button when it's disabled is hidden.
- By default, `.amp-carousel-button` uses an inlined SVG as the background-image of the buttons. You may override this with your own SVG or image as in the example below.


*Example: Default `.amp-carousel-button` inlined SVG*

```css
.amp-carousel-button-prev {
  left: 16px;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z" fill="#fff" /></svg>');
}
```

*Example: Overriding the default `.amp-carousel-button` inlined SVG*

```css
.amp-carousel-button-prev {
  left: 5%;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z" fill="#fff" /></svg>');
}
```

## Validation

See [amp-carousel rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-carousel/validator-amp-carousel.protoascii) in the AMP validator specification.
