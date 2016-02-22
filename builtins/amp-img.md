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

### <a name="amp-img"></a> `amp-img`

<table>
   <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A runtime-managed replacement for the HTML <code>img</code> tag.</td>
  </tr>
   <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
   <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/responsive.amp.html">responsive.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-img` tag
(see also `amp-img` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-tag-ancestor-with-hint">MANDATORY_TAG_ANCESTOR_WITH_HINT</a></td>
    <td>Error thrown if your AMP document uses <code>img</code> instead of <code>amp-img</code>. Error message: <code>The tag <code>img</code> may only appear as a descendant of tag <code>noscript</code>. Did you mean <code>amp-img</code>?</code>.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ONEOF_ATTR_MISSING</a></td>
    <td>Error thrown when neither <code>src</code> or <code>srcset</code> is included. One of these attributes is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#missing-url">MISSING_URL</a></td>
    <td>Error thrown when <code>src</code> or <code>srcset</code> attribute is missing it's URL.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-url">INVALID_URL</a></td>
    <td>Error thrown when <code>src</code> or <code>srcset</code> attribute's URL is invalid.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">IMPLIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">SPECIFIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-property-value">INVALID_PROPERTY_VALUE_IN_ATTR_VALUE</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

#### Behavior

The runtime may choose to delay or prioritize resource loading based on the viewport position, system resources, connection bandwidth, or other factors. The `amp-img` components allows the runtime to effectively manage image resources this way.

`amp-img` components, like all externally fetched AMP resources, must be given an
explicit size (as in width / height) in advance, so that the aspect ratio can be known without fetching the image. Actual layout behavior is determined by the layout attribute. If the resource requested by the `amp-img` component fails to load, the space will be blank. A placeholder background color or other visual can be set using CSS selector and style on the element itself.

The `amp-img` includes attributes for denoting attribution via the attribution attribute.

Additional image features like captions can be implemented with standard HTML - using the `figure` and `figcaption` elements, for example.

#### Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag. The behavior will be polyfilled where not natively supported.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. E.g. `attribution="CC courtesy of Cats on Flicker"`


#### Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:
```css
amp-img {
  background-color: grey;
}
```
