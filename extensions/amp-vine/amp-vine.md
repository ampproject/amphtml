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
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-vine" src="https://cdn.ampproject.org/v0/amp-vine-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-vine/">amp-vine.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/vine.amp.html">vine.amp.html</a></td>
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

**data-vineid**

The ID of the Vine. In a URL like https://vine.co/v/MdKjXez002d `MdKjXez002d` is the vineID.

## Validation errors

The following lists validation errors specific to the `amp-vine` tag
(see also `amp-vine` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-vine/0.1/validator-amp-vine.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-vine</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when required attribute, <code>data-vineid</code>, is missing.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.D</a></td>
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
</table>
