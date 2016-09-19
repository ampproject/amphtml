<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-gfycat"></a> `amp-gfycat`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Gfycat video GIF.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-gfycat" src="https://cdn.ampproject.org/v0/amp-gfycat-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>FILL, FIXED, FIXED_HEIGHT, FLEX_ITEM, RESPONSIVE</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/gfycat.amp.html">gfycat.amp.html</a></td>
  </tr>
</table>

## Example

Gfycat embed with responsive layout:

```html
  <amp-gfycat
          data-gfyid="TautWhoppingCougar"
          width="640"
          height="360"
          layout="responsive">
  </amp-gfycat>
```

## Attributes

**data-gfyid**

In the url https://gfycat.com/TautWhoppingCougar gfyid is `TautWhoppingCougar`, can be found in any Gfycat url.

**width** and **height**

The width and height attributes are special for the Gfycat embed. These should be the actual width and height of the Gfycat. The system automatically adds space for the "chrome" that Gfycat adds around the GIF.

Gfycat allows many aspect ratios.

To specify the width and height in the code, please copy it from the embed URL. You can see these values by going to:
https://gfycat.com/name
Click on the embed link </>. Copy the width and height specified in the fixed IFRAME field.

**Example:**

```html
<iframe src='https://gfycat.com/ifr/TautWhoppingCougar' frameborder='0' scrolling='no' width='640' height='360' allowfullscreen></iframe>
```
**noautoplay**

By default video is autoplaying. It's possible to turn it off by setting `noautoplay` attribute.

**Example:**

```html
  <amp-gfycat
          data-gfyid="TautWhoppingCougar"
          width="640"
          height="360"
          noautoplay>
  </amp-gfycat>
```
