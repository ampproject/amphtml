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
 
# <a name="amp-vine"></a> `amp-vine`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Vine simple embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-vine" src="https://cdn.ampproject.org/v0/amp-vine-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-vine/">Annotated code example for amp-vine</a></td>
  </tr>
</table>

## Example

A Vine simple embed has equal width and height:

```html
<amp-vine width="400" height="400"
  data-vineid="MdKjXez002d">
</amp-vine>
```

## Attributes

**data-vineid** (required)

The ID of the Vine. In a URL like https://vine.co/v/MdKjXez002d, `MdKjXez002d` is the vineID.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-vine rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-vine/0.1/validator-amp-vine.protoascii) in the AMP validator specification.
