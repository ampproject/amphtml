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

# <a name="amp-img"></a> `amp-img`

<table>
   <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A runtime-managed replacement for the HTML <code>img</code> tag.</td>
  </tr>
   <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-img/">Annotated code example for amp-img</a></td>
  </tr>
</table>

## Behavior

The runtime may choose to delay or prioritize resource loading based on the viewport position, system resources, connection bandwidth, or other factors. The `amp-img` components allows the runtime to effectively manage image resources this way.

`amp-img` components, like all externally fetched AMP resources, must be given an
explicit size (as in width / height) in advance, so that the aspect ratio can be known without fetching the image. Actual layout behavior is determined by the layout attribute. For details on layouts, see [AMP HTML Layout System](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md) and [Supported Layouts](https://www.ampproject.org/docs/guides/responsive/control_layout.html).

If the resource requested by the `amp-img` component fails to load, the space will be blank unless a [`fallback`](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md#fallback) child is provided. A fallback is only executed on the initial layout and subsequent src changes after the fact (through resize + srcset for example) will not have a fallback for performance implications.

A placeholder background color or other visual can be set using CSS selector and style on the element itself.

The `amp-img` includes attributes for denoting attribution via the `attribution` attribute.

Additional image features like captions can be implemented with standard HTML - using the `figure` and `figcaption` elements, for example.

## Attributes

**src**

This attribute is similar to the `src` attribute on the `img` tag. The value must be a URL that points to a publicly-cacheable image file. Cache providers may rewrite these URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag. The behavior will be polyfilled where not natively supported.

**sizes**

Same as `sizes` attribute on the `img` tag. For more information see the [common `sizes` attribute docs](../spec/amp-html-layout.md#sizes).

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. For example, `attribution="CC courtesy of Cats on Flicker"`

**height** and **width**

An explicit size of the image, which is used by the AMP runtime to determine the aspect ratio without fetching the image.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

```css
amp-img {
  background-color: grey;
}
```

## Validation

See [amp-img rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.


## Related documentation

* Guide: [Include Images & Video](https://www.ampproject.org/docs/guides/amp_replacements)
* Guide: [Layout & Media Queries](https://www.ampproject.org/docs/guides/responsive/control_layout)
* Guide: [Art direction with srcset, sizes & heights](https://www.ampproject.org/docs/guides/responsive/art_direction)
