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

# <a name="amp-instagram"></a> `amp-instagram`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an Instagram embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-instagram" src="https://cdn.ampproject.org/v0/amp-instagram-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-instagram/">Annotated code example for amp-instagram</a></td>
  </tr>
</table>

## Behavior

The `width` and `height` attributes are special for the Instagram embed.
These should be the actual width and height of the Instagram image.
The system automatically adds space for the "chrome" that Instagram adds around the image.

Many Instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work.

Example:
```html
<amp-instagram
    data-shortcode="fBwFP"
    data-captioned
    width="400"
    height="400"
    layout="responsive">
</amp-instagram>
```

If the Instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

## Attributes

**data-shortcode**

The instagram data-shortcode is found in every instagram photo URL.

For example, in https://instagram.com/p/fBwFP, `fBwFP` is the data-shortcode.

**data-captioned**

Include the Instagram caption.  `amp-instagram` will attept to resize to the correct hight including the caption.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-instagram rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-instagram/0.1/validator-amp-instagram.protoascii) in the AMP validator specification.
