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



# <a name="amp-viafoura"></a> `amp-viafoura`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Renders a Viafoura widget</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>
      &lt;script async custom-element="amp-viafoura" src="https://cdn.ampproject.org/v0/amp-viafoura-0.1.js">&lt;/script>
    </code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/viafoura.amp.html">viafoura.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-viafoura` tag
(see also `amp-viafoura` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-widget</code> attribute is missing.</td>
  </tr>
</table>

## Example

```html
<amp-viafoura
    data-widget="comments"
    layout="responsive"
    width="500" height="600">
</amp-viafoura>
```

## Required attributes

**data-widget**

The type of Viafoura Widget to be generated

Possible Values: `comments`, `counter`, `trending-articles`, `trending-comments`, `quote`, `sharetotal`, `community-popular`, `rating-star`, `community-comments`, `users`

For more documentation and information on optional data attributes for each widget, take a look at the <a href = http://documentation.viafoura.com/social_plugins.php>Viafoura Docs</a>
