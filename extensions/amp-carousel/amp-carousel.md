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

### <a name="amp-carousel"></a> `amp-carousel`

A generic carousel for displaying multiple similar pieces of content along a horizontal axis. It is meant to be highly flexible and performant.

#### Behavior

The `amp-carousel` component comprises an arbitrary number of children, as well as optional navigational arrows to go forward or backward one item at a time. Each child is considered an *item* in the carousel and may also have arbitrary HTML children.

The carousel advances between items if the user swipes, uses arrow keys, or clicks an optional navigation arrow.
```html
<amp-carousel width=300 height=400>
  <amp-img src="my-img1.png" width=300 height=400></amp-img>
  <amp-img src="my-img2.png" width=300 height=400></amp-img>
  <amp-img src="my-img3.png" width=300 height=400></amp-img>
</amp-carousel>
```

Note that while this example shows a carousel of images, `amp-carousel` supports arbitrary HTML elements as children.

#### Attributes

**controls**

If present, displays left and right arrows for navigation on mobile devices. The visibility of these arrows can be controlled via styling, and a media query can be used to only display arrows at certain screen widths. On desktop, arrows are always displayed unless the carousel has only one child.

**type**

 - `carousel` (default): All slides are shown and are scrollable horizontally. Be aware that `type=carousel` does not currently support `layout=responsive`.
 - `slides`: Shows a single slide at a time.

**loop** (`type=slides` only)

If present, the user may navigate forward from the last item to the first, or backward from the first item to the last.

**autoplay** (`type=slides` only)

If present, advances to the next slide without user interaction. By default, slides advance in 5000ms (5 second) intervals, but can use the value of the `autoplay` attribute if present (minimum of 1000ms). The value of `autoplay` must be in milliseconds, e.g., `autoplay=5000`. If `autoplay` is present it also attaches the `loop` attribute to the carousel if `loop` is not already present.

#### Styling
 - You may use the `amp-carousel` element selector to style the carousel via CSS.
 - The `.amp-carousel-button` uses an inlined SVG as the default background-image. You may override this with your own SVG or image.

**default SVG**
```css
.amp-carousel-button-prev {
  left: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z" fill="#fff" /></svg>');
}
```

**override SVG**
```css
.amp-carousel-button-prev {
  left: 5%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z" fill="#fff" /></svg>');
}
```
 - The default visual state of a disabled `amp-carousel-button` is `hidden`. You can explicitly set the `visibility` attribute to override this.

```css
.amp-carousel-button.amp-disabled {
  /* make sure we make it visible */
  visibility: visible;
  /* choose our own background styling, red'ish */
  background-color: rgba(255, 0, 0, .5);
}
```
