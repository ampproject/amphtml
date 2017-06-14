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

# <a name="amp-vimeo"></a> `amp-vimeo`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://vimeo.com">Vimeo</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-vimeo" src="https://cdn.ampproject.org/v0/amp-vimeo-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-vimeo/">Annotated code example for amp-vimeo</a></td>
  </tr>
</table>

## Example

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-vimeo
    data-videoid="27246366"
    layout="responsive"
    width="500" height="281"></amp-vimeo>
```

## Attributes

**data-videoid** (required)

The Vimeo video id found in every Vimeo video page URL For example, `27246366` is the video id for the following url: `https://vimeo.com/27246366`.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-vimeo rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-vimeo/validator-amp-vimeo.protoascii) in the AMP validator specification.
