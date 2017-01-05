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

# <a name="amp-fit-text"></a> `amp-fit-text`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Expands or shrinks its font size to fit the content within the space given to it.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-fit-text" src="https://cdn.ampproject.org/v0/amp-fit-text-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/">Annotated code example that includes amp-fit</a></td>
  </tr>
</table>

## Behavior

The `amp-fit-text` component expects its content to be text or other inline
content, but it can also contain non-inline content. For the given content
the `amp-fit-text` will try to find the best font size to fit all of the
content within the available space.

If content of the `amp-fit-text` is overflowing the available space event with
the minimum font size, the overflowing content will be cut off and hidden. The
WebKit and Blink-based browsers will show ellipsis in this case.

The `amp-fit-text` accepts one of the following `layout` values: `fixed`,
`fixed-height`, `responsive` or `fill`.

For example:
```html
<amp-fit-text width="300" height="200" layout="responsive"
    max-font-size="52">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</amp-fit-text>
```


## Attributes

**min-font-size**

The minimum font size as an integer that the `amp-fit-text` can use.

**max-font-size**

The maximum font size as an integer that the `amp-fit-text` can use.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Styling

The `amp-fit-text` component can be styled with standard CSS. In particular,
it's possible to use `text-align`, `font-weight`, `color` and many other CSS
properties with the main exception of `font-size`.

## Validation

See [amp-fit-text rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fit-text/0.1/validator-amp-fit-text.protoascii) in the AMP validator specification.
