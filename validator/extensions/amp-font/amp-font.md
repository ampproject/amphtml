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

# <a name="`amp-font`"></a> `amp-font`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Trigger and monitor the loading of custom fonts on AMP pages.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-font" src="https://cdn.ampproject.org/v0/amp-font-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/font.amp.html">font.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-font` extension should be used for controlling timeouts on font loading.

The `amp-font` extension allows adding and removing CSS classes from document.documentElement based on whether a font was loaded or is in error-state.

Example:
```html
  <amp-font
      layout="nodisplay"
      font-family="My Font"
      timeout="3000"
      on-error-remove-class="my-font-loading"
      on-error-add-class="my-font-missing"></amp-font>
  <amp-font
      layout="nodisplay"
      font-family="My Other Font"
      timeout="1000"
      on-load-add-class="my-other-font-loaded"
      on-load-remove-class="my-other-font-loading"></amp-font>
```

The extension observes loading of a font and when it loads executes the optional attributes `on-load-add-class` and `on-load-remove-class` and when there is any error or timeout runs `on-error-remove-class` and `on-error-add-class`.

Using these classes authors can guard whether a font is displayed and get the following results:

- get a short (e.g. 3000ms) timeout in Safari similar to other browsers
- implement FOIT where the page renders with no text before the font comes in
- make the timeout very short and only use a font if it was already cached.


The `amp-font` extension accepts the `layout` value:  `nodisplay`

## Attributes

**font-family**

The font-family of the custom font being loaded.

**timeout**

Time in milliseconds after which the we don't wait for the custom font to be available. This attribute is optional and it's default value is 3000. If the timeout is set to 0 then the amp-font loads the font if it is already in the cache, otherwise the font would not be loaded. If the timeout is has an invalid value then the timeout defaults to 3000.

**on-load-add-class**

CSS class that would be added to the `document.documentElement`  after making sure that the custom font is available for display. This attribute is optional.

**on-load-remove-class**

CSS class that would be removed from the `document.documentElement` and `document.body` after making sure that the custom font is available for display. This attribute is optional.

**on-error-add-class**

CSS class that would be added to the `document.documentElement`, if the timeout interval runs out before the font becomes available for use. This attribute is optional.

**on-error-remove-class**

CSS class that would be removed from the `document.documentElement` and `document.body` , if the timeout interval runs out before the font becomes available for use. This attribute is optional.

**font-weight, font-style, font-variant**

The attributes above should all behave like they do on standard elements.

## Validation errors

The following lists validation errors specific to the `amp-font` tag
(see also `amp-font` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-font/0.1/validator-amp-font.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-font</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when <code>font-family</code> attribute is missing.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-attribute-value">The attribute 'example1' in tag 'example2' is set to the invalid value 'example3'.</a></td>
    <td>Error thrown when the <code>timeout</code> attribute is not a positive integer.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if implied layout is any other value.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if specified layout is any other value.</td>
  </tr>
</table>
