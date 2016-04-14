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

# <a name="amp-instagram"></a> `amp-instagram`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an instagram embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-instagram" src="https://cdn.ampproject.org/v0/amp-instagram-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-instagram">amp-instagram.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/instagram.amp.html">instagram.amp.html</a></td>
  </tr>
</table>

## Behavior

The `width` and `height` attributes are special for the instagram embed.
These should be the actual width and height of the instagram image.
The system automatically adds space for the "chrome" that instagram adds around the image.

Many instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work.

Example:
```html
<amp-instagram
    data-shortcode="fBwFP"
    width="400"
    height="400"
    layout="responsive">
</amp-instagram>
```

If the instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

## Attributes

<!---
`src` attribute hasn't been documented. Should it be?
Also, can the tag include both data-shortcode and src or are they mutually exclusive?
-->

**data-shortcode**

The instagram data-shortcode found in every instagram photo URL.

E.g. in https://instagram.com/p/fBwFP fBwFP is the data-shortcode.

## Validation errors

The following lists validation errors specific to the `amp-instagram` tag
(see also `amp-instagram` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-instagram/0.1/validator-amp-instagram.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-instagram</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The tag 'example1' is missing a mandatory attribute - pick one of example2.</a></td>
    <td>Error thrown when neither <code>data-shortcode</code> or <code>src</code> is included. One of these attributes is mandatory.</td>
  </tr>
  </tr>
    <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-shortcode</code> or <code>src</code> is missing its URL.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-shortcode</code> or <code>src</code> URL is invalid.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>data-shortcode</code> or <code>src</code> URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#deprecated-attribute">The attribute 'example1' in tag 'example2' is deprecated - use 'example3' instead.</a></td>
    <td>The attribute <code>shortcode </code>is deprecated - use <code>data-shortcode</code> instead.</td>
  </tr>
</table>
