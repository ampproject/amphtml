---
$category@: layout
formats:
  - websites
teaser:
  text: A slider to compare two images.
---
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

# amp-image-slider

A slider to compare two images.

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-image-slider" src="https://cdn.ampproject.org/v0/amp-image-slider-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed, responsive, intrinsic</td>
  </tr>
</table>

## Behavior

The `amp-image-slider` component requires exactly two `amp-img` elements as its children. The first child image displays on the left, the second child image displays on the right.

The `amp-image-slider` component can also contain two `<div>` elements to use as labels for the images. The labels are overlaid on top of the images. The label on the left image requires the `first` attribute, while the right labels requires the `second` attribute. By default, the labels display at the top left corner of the image.

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

## Attributes

### `disable-hint-reappear`

The hints that shows at the center of the vertical bar will disappear once user starts interacting with the slider (such as clicking the mouse button, touch the slider, and pressing keys to move the slider). The hints would reappear if it then leaves the viewport and goes back in again. To stop such reappearing behavior, add the `disable-hint-reappear` attribute to the image slider.

*Example: Displays an image slider without reappearing hints*

```html
<amp-image-slider layout="responsive" width="100" height="200" disable-hint-reappear>
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second>This apple is red</div>
</amp-image-slider>
```

### `initial-slider-position`

The vertical slider bar sits at the center of the slider body by default. To move the initial slider position to a different place, set `initial-slider-position` to a value between 0 and 1, corresponding to 0% to 100% from the left slider edge.

*Example: Displays an image slider with initial slider position on the left*

```html
<amp-image-slider layout="responsive" width="100" height="200" initial-slider-position="0">
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second>This apple is red</div>
</amp-image-slider>
```

### `step-size`

When focusing on the slider, left and right keyboard buttons move the slider bar by 10% each press. To use a different step size, set `step-size` to a value between 0 and 1, corresponding to moving 0% to moving 100% each key press.

*Example: Displays an image slider with step size of 25%*

```html
<amp-image-slider layout="responsive" width="100" height="200" step-size="0.25">
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second>This apple is red</div>
</amp-image-slider>
```

## Actions

### `seekTo`

`slider-id.seekTo(percent=[0,1])` move the corresponding slider's bar to the given percentage from left.

## Customizations

### Labels

You can customize your labels by providing customized CSS classes. You can use `top/right/bottom/left` and `transform: translate(...)` rules to control their positioning. Other rules, such as `border`, `background-color`, etc., could be used for customizing the style of your labels.

*Example: Displays an image slider with left label on top left, right label on top right*
```html
<!-- head -->
<style amp-custom>
  .top-right {
    top: 0;
    right: 0;
  }
</style>

<!-- body -->
<amp-image-slider layout="responsive" width="100" height="200">
  <amp-img src="/green-apple.jpg" alt="A green apple"></amp-img>
  <amp-img src="/red-apple.jpg" alt="A red apple"></amp-img>
  <div first>This apple is green</div>
  <div second class="top-right">This apple is red</div>
</amp-image-slider>
```

### Hints

By default, the hints are a pair of white arrows with drop shadow. To customize the left and right hints, you can override `.amp-image-slider-hint-left` and `.amp-image-slider-hint-right` classes. To replace the arrows with customized images, overwrite `background-image`. To remove drop shadow, set `filter: none;`.

*Example: Replace arrows with triangles*

```css
.amp-image-slider-hint-left {
  width: 10px;
  height: 20px;
  background-size: 10px 20px;
  margin-right: 10px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='10,0 0,10 10,20' style='fill:white;stroke:black;stroke-width:1' /%3e%3c/svg%3e");
}

.amp-image-slider-hint-right {
  width: 10px;
  height: 20px;
  background-size: 10px 20px;
  margin-left: 10px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='0,0 10,10 0,20' style='fill:white;stroke:black;stroke-width:1' /%3e%3c/svg%3e");
}
```
