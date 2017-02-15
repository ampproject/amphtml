<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-izlesene"></a> `amp-izlesene`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://www.izlesene.com/">Izlesene</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-izlesene" src="https://cdn.ampproject.org/v0/amp-izlesene-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-izlesene
    data-videoid="7221390"
    layout="responsive"
    width="480" height="270"></amp-izlesene>
```

## Required Attributes

**data-videoid**

The Izlesene video id found in every Izlesene video page URL

E.g. in https://www.izlesene.com/video/yayin-yok/7221390 `"7221390"` is the video id.

## Optional Attributes

**data-param-showrel**

Whether to show related content or not. (Not available for IOS devices)

Value: `"1"` or `"0"`

Default value: `"1"`

**data-param-showreplay**

Whether to show replay button at the end content or not.

Value: `"1"` or `"0"`

Default value: `"1"`

## Validation

See [amp-izlesene rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-izlesene/0.1/validator-amp-izlesene.protoascii) in the AMP validator specification.
