---
$category@: social
formats:
  - websites
teaser:
  text: Displays an Instagram embed.
---
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

# amp-instagram

Displays an Instagram embed.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-instagram" src="https://cdn.ampproject.org/v0/amp-instagram-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-instagram/">Annotated code example for amp-instagram</a></td>
  </tr>
</table>

[TOC]

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

<table>
  <tr>
    <td width="40%"><strong>data-shortcode</strong></td>
    <td>The instagram data-shortcode is found in every instagram photo URL.
<br>
For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the data-shortcode.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-captioned</strong></td>
    <td>Include the Instagram caption. <code>amp-instagram</code> will attempt to resize to the correct height including the caption.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-instagram rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-instagram/validator-amp-instagram.protoascii) in the AMP validator specification.
