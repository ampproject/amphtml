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

# <a name="amp-hulu"></a> `amp-hulu`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a simple embedded <a href="http://www.hulu.com">Hulu</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-hulu" src="https://cdn.ampproject.org/v0/amp-hulu-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-hulu/">Annotated code example for amp-hulu</a></td>
  </tr>
</table>

## Example

```html
<amp-hulu width="412" height="213" layout="responsive"
  data-eid="4Dk5F2PYTtrgciuvloH3UA">
</amp-hulu>
```

## Attributes

**data-eid**

The ID of the video. For example, `4Dk5F2PYTtrgciuvloH3UA` is the eid in the following URL: https://player.hulu.com/site/dash/mobile_embed.html?eid=4Dk5F2PYTtrgciuvloH3UA.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-hulu rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-hulu/0.1/validator-amp-hulu.protoascii) in the AMP validator specification.
