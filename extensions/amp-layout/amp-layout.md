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

# <a name="amp-layout"></a> `amp-layout`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A generic, multi-purpose container element that can be used independent of other elements</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-layout" src="https://cdn.ampproject.org/v0/amp-layout-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
</table>

## Examples

Use `amp-layout` to create an aspect-ratio based responsive, independent component!.

**Example**

```html
<amp-layout class="card" layout=responsive width=2 height=1>
  This card container will always maintain its 2x1 aspect ratio!
</amp-layout>

.card {
  background-color: red;
}
```
## Attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-layout rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-layout/validator-amp-layout.protoascii) in the AMP validator specification.
