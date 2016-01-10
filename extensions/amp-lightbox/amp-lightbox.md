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

### <a name="amp-lightbox"></a> `amp-lightbox`

The `amp-lightbox` component allows for a “lightbox” or similar experience - where upon user interaction a component expands to fill the viewport, until it is closed again by the user.

#### Behavior

The `amp-lightbox` component defines the child elements that will be displayed in a full-viewport overlay. It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute that targets `amp-lightbox` element’s `id`.

#####Closing the lightbox
Pressing the escape key on the keyboard will close the lightbox.
Alternatively setting the `on` attribute on one or more elements within the lightbox and setting it's method to `close` will close the lightbox when the element is tapped or clicked.

Example:
```html
<button on="tap:my-lightbox">Open lightbox</button>

<amp-lightbox id="my-lightbox" layout="nodisplay">
  <div class="lightbox">
    <amp-img src="my-full-image.jpg" width=300 height=800 on="tap:my-lightbox.close">
  </div>
</amp-lightbox>
```

#### Styling

The `amp-lightbox` component can be styled with standard CSS.
