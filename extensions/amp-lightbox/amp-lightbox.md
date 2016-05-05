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

# <a name="amp-lightbox"></a> `amp-lightbox`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allows for a “lightbox” or similar experience where upon user interaction, a component expands to fill the viewport until it is closed again by the user.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-lightbox" src="https://cdn.ampproject.org/v0/amp-lightbox-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-lightbox">amp-lightbox.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-lightbox` component defines the child elements that will be displayed in a full-viewport overlay. It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute that targets `amp-lightbox` element’s `id`.

### Closing the lightbox
Pressing the escape key on the keyboard will close the lightbox.
Alternatively setting the `on` attribute on one or more elements within the lightbox and setting it's method to `close` will close the lightbox when the element is tapped or clicked.

Example:
```html
<button on="tap:my-lightbox">Open lightbox</button>

<amp-lightbox id="my-lightbox" layout="nodisplay">
  <div class="lightbox">
    <amp-img src="my-full-image.jpg" width=300 height=800 on="tap:my-lightbox.close">
  </div>
</amp-lightbox>
```

## Styling

The `amp-lightbox` component can be styled with standard CSS.

## Validation errors

The following lists validation errors specific to the `amp-lightbox` tag
(see also `amp-lightbox` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-lightbox/0.1/validator-amp-lightbox.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-lightbox</code> extension <code>.js</code> script tag is missing or incorrect.</td>
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
