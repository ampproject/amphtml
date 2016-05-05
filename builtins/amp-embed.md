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

## Validation errors

The following lists validation errors specific to the `amp-embed` tag
(see also `amp-embed` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii)):

<table>
  <tr>
    <th class="col-fourty"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when <code>type</code> attribute missing.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute is missing its URL.</td>
  </tr>
  <tr>
  <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute's URL is invalid.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>src</code> attribute's URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>
