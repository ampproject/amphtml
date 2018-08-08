<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-image-slider`">amp-image-slider</a> `amp-image-slider`

This is an __EXPERIMENTAL__ component.

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A slider used to slide and compare 2 <code>amp-img</code>s, with optional labels</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-image-slider" src="https://cdn.ampproject.org/v0/amp-image-slider-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Launch Status</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, responsive, intrinsic</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-image-slider/">amp-image-slider example</a></td>
  </tr>
</table>

## Behavior

`amp-image-slider` is required to have exactly 2 `amp-img`s as its children, with the first one becoming the image displaying on the left, and the second on the right.

The slider could also take 2 optional `div`s for labels, which are used to add extra information that overlay on top of the images. The label on the left image requires the `first` attribute to be present, while the right labels requires the `second` attribute. Custom classes could be added to adjust styling and position (using `top`, `right`, `bottom`, `left` properties). Notice that by default, both labels would show at the top left corner of images.

```html
<amp-image-slider layout="responsive" width="100" height="200">
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second>This apple is red</div>
</amp-image-slider>
```

By default, once the slider is loaded, the compared images will be separated by a vertical bar, with helpful arrow hints displayed at its center. User could press mouse button down or touch to move the slider to the position of the pointer, and could then move the pointer to drag the slider bar left and right. For the left image, only part that is left to the bar is displayed; similar for the right image to only display the right portion.

If we specify `tabindex` on `amp-image-slider`, users are also allowed to move the slider using keyboard. Pressing down left and right arrow moves the slider bar one step towards the corresponding direction. Pressing Home would bring the slider to the center, PageUp and PageDown to the left and right end of the slider body.

The hints that shows at the center of the vertical bar will disappear once user starts interacting with the slider (such as clicking the mouse button, touch the slider, and pressing keys to move the slider). The hints would reappear if it then leaves the viewport and goes back in again. To stop such reappearing behavior, add the `disable-hint-reappear` attribute to the image slider.
