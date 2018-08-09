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

# <a name="amp-image-slider"></a> `amp-image-slider`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A slider to compare two images.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-image-slider" src="https://cdn.ampproject.org/v0/amp-image-slider-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, responsive, intrinsic</td>
  </tr>
</table>

## Behavior

The `amp-image-slider` component requires exactly two `amp-img` elements as its children. The first child image displays on the left, the second child image displays on the right.

The `amp-image-slider` component can also contain two `<div>` elements to use as labels for the images. The labels are overlayed on top of the images. The label on the left image requires the `first` attribute, while the right labels requires the `second` attribute. To adjust the styling and positioning (using `top`, `right`, `bottom`, `left` properties) of the labels, you can apply custom classes. By default, the labels display at the top left corner of the image.

*Example: Displays an image slider with labeled images*

```html
<amp-image-slider layout="responsive" width="100" height="200">
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second>This apple is red</div>
</amp-image-slider>
```

Once the slider is loaded, the compared images are separated by a vertical bar, with helpful arrow hints displayed at the slider's center.

Users can mouse down or touch to move the slider to the position of the pointer, and can then move the pointer to drag the slider bar left or right. For the left image, only the part that is left to the bar is displayed; similarly for the right image, to only display the right portion.

If you specify `tabindex` on the `amp-image-slider` element, users can navigate the slider with their keyboards. Pressing the  down, left, or right arrow moves the slider bar one step towards the corresponding direction. Pressing the Home key brings the slider to the center. Pressing the PageUp or PageDown keys moves to the left or right end of the slider body.

The hints that shows at the center of the vertical bar will disappear once user starts interacting with the slider (such as clicking the mouse button, touch the slider, and pressing keys to move the slider). The hints would reappear if it then leaves the viewport and goes back in again. To stop such reappearing behavior, add the `disable-hint-reappear` attribute to the image slider.
