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

# <a name="amp-brid-player"></a> `amp-brid-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An <code>amp-brid-player</code> displays the Brid Player used in <a href="https://www.brid.tv/">Brid.tv</a> Video Platform.
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-brid-player" src="https://cdn.ampproject.org/v0/amp-brid-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/brid-player.amp.html">brid-player.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-brid-player` tag
(see also `amp-brid-player` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-brid-player/0.1/validator-amp-brid-player.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-brid-player</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ATTR_MISSING</a></td>
    <td>Error thrown when <code>data-partner</code> attribute is missing.</td>
  </tr>
  <tr>
      <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ATTR_MISSING</a></td>
      <td>Error thrown when <code>data-player</code> attribute is missing.</td>
  </tr>
  <tr>
      <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ONEOF_ATTR_MISSING</a></td>
      <td>Error thrown when either the <code>data-video</code> or <code>data-playlist</code> attributes are missing.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">IMPLIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">SPECIFIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">INVALID_PROPERTY_VALUE_IN_ATTR_VALUE</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Examples:

```html
<amp-brid-player
    data-partner="264"
    data-player="4144"
    data-video="13663"
    layout="responsive"
    width="480" height="270">
</amp-brid-player>
```

## Attributes

**data-partner**

The Brid.tv partner id.

**data-player**

The Brid.tv player id. Specific to every partner.

**data-video**

The Brid.tv video ID.

**data-playlist**

The Brid.tv playlist ID. Embed must either have video or playlist attribute.
