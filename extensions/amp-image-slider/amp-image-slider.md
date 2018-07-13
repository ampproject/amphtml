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

# <a name="`amp-image-slider`"></a> `amp-image-slider`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A slider used to slide and compare 2 <code>amp-img</code>s, with optional labels</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-image-slider-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive, TODO</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TODO</td>
  </tr>
</table>

## Behavior

`<amp-image-slider>` consists of 2 partially displayed images and a central splitting bar. Moving the bar would result in more or less part of the 2 images displayed.  

Currently, it supports 2 types of image compare sliders:  
1. Drag slider (default): allows user to drag the bar (either mouse down or touch), while also allowing clicking/tapping on the images to move the bar to position.  
```html
<amp-image-slider layout="responsive" width="1024" height="600">
  <!-- (required) amp-img left to bar -->
  <amp-img before src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
  <!-- (required) amp-img right to bar -->
  <amp-img after src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
  <!-- (optional) add a label to the left center of left amp-img. If present, MUST be a div -->
  <div before style="color: red; border: 1px solid red; padding: 1em;">BEFORE</div>
  <!-- (optional) add a label to the right center of left amp-img. If present, MUST be a div -->
  <div after style="color: red; border: 1px solid red; padding: 1em;">AFTER</div>
</amp-image-slider>
```
2. Hover slider (requires `type="hover"`): allows user to hover the mouse on the slider, during the process the bar would follow cursor's X position. (Hover slider would be coerced to drag slider on mobile platforms)  
```html
<amp-image-slider type="hover" layout="responsive" width="1024" height="600">
  <!-- amp-img left to bar -->
  <amp-img before src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
  <!-- amp-img right to bar -->
  <amp-img after src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
  <!-- (optional) add a label to the left center of left amp-img. If present, MUST be a div -->
  <div before style="color: red; border: 1px solid red; padding: 1em;">BEFORE</div>
  <!-- (optional) add a label to the right center of left amp-img. If present, MUST be a div -->
  <div after style="color: red; border: 1px solid red; padding: 1em;">AFTER</div>
</amp-image-slider>
```

Elements labeled with `before` are related to images displayed on the left of bar, while elements with `after` are related to images on the right.  

## Label Positioning

`<amp-image-slider>` supports one label on each of the images. The position of the label could be customized, following the following rules:  

1. For `before` label (on the left, a.k.a. `before` image), its horizontal position could be controlled by `left` CSS property:
```css
.my-label {
  left: 10%;
}
```
If you must use `right` to control, do it by setting `left` to `auto`:
```css
.my-label {
  right: 10%;
  left: auto;
}
```  
2. For `after` label (on the right, a.k.a. `before` image), its horizontal position could be controlled by `right` CSS property:
```css
.my-label {
  right: 10%;
}
```
If you must use `left` to control, do it by setting `right` to `auto`:
```css
.my-label {
  left: 10%;
  right: auto;
}
```  
3. For both labels, the vertical positions could be controlled by `top` or `bottom` CSS property:
```css
.my-label {
  top: 0;
}
```
4. You can apply `transform: translate(...)` rules to allow more granular control. While percentages on `top/left/bottom/right` are relative to the slider container's width/height, percentages on `translate` is relative to the label's width/height. For example, to center the `before` label both horizontally and vertically, one can do:
```css
.before-label-center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```  
More label positioning examples could be seen in [`examples/amp-image-slider.html`](https://github.com/ampproject/amphtml/blob/master/examples/amp-image-slider.amp.html).  

TODO: add other sections.

## Validation
See [amp-image-slider rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-image-slider/validator-amp-image-slider.protoascii) in the AMP validator specification.
