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

# <a name="`amp-form`"></a> `amp-form`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allow usage of <code>form</code> and <code>input</code> tags.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/forms.amp.html">forms.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-form` extension allows the usage of forms and input fields in an AMP document. The extension allows polyfilling
some of the missing behaviors in browsers.

The `amp-form` extension **MUST** be loaded if you're using `<form>` or any input tags, otherwise your document will be invalid!

Example:
```html
<form method="post" action="https://example.com/subscribe" target="_blank">
    <fieldset>
        <label>
            <span>Your name</span>
            <input type="text" name="name" required>
        </label>
        <label>
            <span>Your email</span>
            <input type="email" name="email" required>
        </label>
        <input type="submit" value="Subscribe">
    </fieldset>
</form>
```

## Attributes

**target**
__required__

Target attribute of the `<form>` must be either `_blank` or `_top`.

**action**
__required__

Action must be provided, `https` and is non-cdn link (does **NOT** link to https://cdn.ampproject.org).

All other [form attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) are optional.

## Inputs
Both `<input type=file>` and `<input type=password>` are not allowed. (This might be reconsidered in the future - please let us know if you require these and use cases).
