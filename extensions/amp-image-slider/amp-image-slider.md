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
    <td>A slider used to slide and compare 2 `amp-img`s</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>TODO</td>
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

Support 2 types of image compare sliders:  
1. Drag slider (default): allows user to drag the bar (either mouse down or touch), while also allowing clicking/tapping on the images to move the bar to position.  
```html
<amp-image-slider layout="responsive" width="1024" height="600">
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

TODO: add other sections.

## Validation
See [amp-image-slider rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-image-slider/validator-amp-image-slider.protoascii) in the AMP validator specification.
