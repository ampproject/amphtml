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
# <a name="amp-embed"></a> `amp-embed`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Use <code>amp-embed</code> to embed elements into the AMP page. Can be used instead of <a href="https://www.ampproject.org/docs/reference/amp-ad.html">amp-ad</a> when semantically more accurate.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>FILL, FIXED, FIXED_HEIGHT, FLEX_ITEM, NODISPLAY, RESPONSIVE</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>None</td>
  </tr>
</table>

## Implementation

The `<amp-embed>` is actually an alias to the [`<amp-ad>`](amp-ad.md) tag, deriving all of its functionality with a different tag name.

```html
<amp-embed width=400 height=300
        layout=responsive
        data-publisher=thepublisher
        data-mode=themode
        data-article=auto
        data-placement="Below Article Thumbnails">
</amp-embed>
```

## Supported embed types

- [Taboola](../ads/taboola.md)

## Validation

See [amp-embed rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.

## Notes

To use `<amp-embed>`, the script to the `amp-ad` library is needed. It is recommended to add the script manually but currently it will be automatically fetched when `amp-embed` is used.
