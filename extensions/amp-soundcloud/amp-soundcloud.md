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

# <a name="amp-soundcloud"></a>amp-soundcloud

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td> Displays a <a href="https://soundcloud.com/">Soundcloud</a> clip.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-soundcloud" src="https://cdn.ampproject.org/v0/amp-soundcloud-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-soundcloud/">amp-soundcloud.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/soundcloud.amp.html">soundcloud.amp.html</a></td>
  </tr>
</table>

## Examples 

Visual Mode:
```html
<amp-soundcloud height=657
    layout="fixed-height"
    data-trackid="243169232"
    data-visual="true"></amp-soundcloud>
```

Classic Mode:
```html
<amp-soundcloud height=657
    layout="fixed-height"
    data-trackid="243169232"
    data-color="ff5500"></amp-soundcloud>
```

## Required attributes

**data-trackid**

The ID of the track, an integer.

## Optional attributes

**data-visual**

Value: `"true"` or `"false"`

Default value: `"false"`

If set to true, displays full width "Visual" mode. Otherwise, displays "Classic"
mode.

**data-color**

Value: Hexadecimal color value (without the leading #).
E.g. `data-color="e540ff"`

Custom color override for the "Classic" mode. Ignored in "Visual" mode.

**width and height**
Layout is `fixed-height` and will fill all the available horizontal space. This is ideal for "Classic" mode, but for "Visual", height is recommended to be 300px, 450px or 600px, as per Soundcloud embed code. This will allow the clip's internal elements to resize properly on mobile.

## Validation errors

The following lists validation errors specific to the `amp-soundcloud` tag
(see also `amp-soundcloud` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-soundcloud/0.1/validator-amp-soundcloud.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-soundcloud</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-trackid</code> attribute missing.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-attribute-value">The attribute 'example1' in tag 'example2' is set to the invalid value 'example3'.</a></td>
    <td>Error thrown when the <code>data-trackid</code> attribute is invalid. Only integers allowed.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>FIXED_HEIGHT</code>. Error thrown if implied layout is any other value.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>FIXED_HEIGHT</code>. Error thrown if specified layout is any other value.</td>
  </tr>
</table>
