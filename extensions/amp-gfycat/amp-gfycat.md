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
    <td>Displays a <a href="https://gfycat.com/">Gfycat</a> video GIF.</td>
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
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>
      <ul>
      <li><a href="https://ampbyexample.com/components/amp-gfycat/">Annotated code example for amp-gfycat</a></li>
      <li>Other example: <a href="https://github.com/ampproject/amphtml/blob/master/examples/gfycat.amp.html">Source</a>,
      <a href="https://cdn.rawgit.com/ampproject/amphtml/master/examples/gfycat.amp.html">Rendered</a></li>
    </ul>
    </td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the Gfycat embedded in responsive layouts.

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

The Gfycat ID found in any Gfycat url. For example, `TautWhoppingCougar` is the id in the following url: https://gfycat.com/TautWhoppingCougar.

**width** and **height**

The width and height attributes are special for the Gfycat embed. These should be the actual width and height of the Gfycat. The system automatically adds space for the "chrome" that Gfycat adds around the GIF.

Gfycat allows many aspect ratios.

To specify the width and height in the code, copy it from the embed URL:

1. Go to https://gfycat.com/name, where name is the Gfycat ID.
2. Click the embed link icon (</>).
3. Copy the width and height specified in the "Fixed iFRAME" field.

Example: Finding the actual width and height

```html
<iframe src='https://gfycat.com/ifr/TautWhoppingCougar'
        frameborder='0' scrolling='no' width='640'
        height='360' allowfullscreen>
</iframe>
```
**noautoplay**

By default, a video autoplays. You can turn off autoplay by setting the  `noautoplay` attribute.

Example: Turning off autoplay

```html
  <amp-gfycat
          data-gfyid="TautWhoppingCougar"
          width="640"
          height="360"
          noautoplay>
  </amp-gfycat>
```

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-gfycat rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-gfycat/0.1/validator-amp-gfycat.protoascii) in the AMP validator specification.
