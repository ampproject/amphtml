---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Vine simple embed.
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

# amp-vine

Displays a Vine simple embed.

<table>
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

[TOC]

## Example

A Vine simple embed has equal width and height:

```html
<amp-vine width="400" height="400"
  data-vineid="MdKjXez002d">
</amp-vine>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-vineid (required)</strong></td>
    <td>The ID of the Vine. In a URL like https://vine.co/v/MdKjXez002d, <code>MdKjXez002d</code> is the vineID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>See <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-vine/validator-amp-vine.protoascii">amp-vine rules</a> in the AMP validator specification.</td>
  </tr>
</table>

## Validation

See [amp-vine rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-vine/validator-amp-vine.protoascii) in the AMP validator specification.
