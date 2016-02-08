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

### <a name="amp-youtube"></a> `amp-youtube`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Youtube video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-youtube` tag
(see also `amp-youtube` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-youtube</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ONEOF_ATTR_MISSING</a></td>
    <td>Error thrown when neither <code>data-videoid</code> or <code>src</code> is included. One of these attributes is mandatory.</td>
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
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#/docs/reference/validation_errors.html#deprecated-attribute">DEPRECATED_ATTR</a></td>
    <td>The attribute <code>video-id</code> is deprecated - use <code>data-videoid</code> instead</td>
  </tr>
</table>

#### Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-youtube
    data-videoid="mGENRKrdoGY"
    layout="responsive"
    width="480" height="270"></amp-youtube>
```

#### Attributes

**data-videoid**

The Youtube video id found in every Youtube video page URL

E.g. in https://www.youtube.com/watch?v=Z1q71gFeRqM Z1q71gFeRqM is the video id.
