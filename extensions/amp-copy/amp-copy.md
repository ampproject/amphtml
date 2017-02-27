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

# <a name="amp-copy"></a> `amp-copy`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Shows text, with a button to copy to the user's clipboard.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-copy" src="https://cdn.ampproject.org/v0/amp-copy-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <a href="https://github.com/ampproject/amphtml/blob/master/examples/copy.amp.html">Source</a>
      <a href="https://cdn.rawgit.com/ampproject/amphtml/master/examples/copy.amp.html">Rendered</a>
    </td>
  </tr>
</table>

## Example

Text Copy with responsive layout:

```html
  <!-- Short Copy-able text (text-element="input") -->
  <amp-copy
          copy-text="Copy me!"
          text-element="input"
          layout="responsive">
  </amp-copy>

  <!-- Long Copy-able text (text-element="textarea") -->
  <amp-copy
          copy-text="AMP HTML is a way to build web pages for static content that render with reliable, fast performance. It is our attempt at fixing what many perceive as painfully slow page load times – especially when reading content on the mobile web."
          text-element="textarea"
          layout="responsive">
  </amp-copy>
```

## Attributes

**copy-text** (__required__)

The text that will be displayed with an accompanying button to copy the text

**text-element** (__required__)

The text element type that the copy-able text will be placed in. Valid elements are: "input", and "textarea";

## Styles

### Default Styles

By default, `amp-copy` shows the displayed text input field, with the copy button and copy notification bound in the bottom right, below the text field.

### Custom Styles

Sometimes you want to provide your own style. You can simply override the provided styles like the following (These are all example styles, and not the actual styles):
```css
/* The input field of the copy-able text */
.amp-copy-input {
  width: 100%;
  min-width: 100%;
}

/* The text area field of the copy-able text */
.amp-copy-textarea {
  width: 100%;
  max-width: 100%;
  min-height: 200px;
}

/* The Child Container encapsulating the copy button, and copy notification */
.-amp-copy-child-container {
  vertical-align: middle;
  height: 100px;
}

/* The Copy Button */
.amp-copy-button {
  border: 2px solid black;
  background-color: blue;
}

/* Notification on Success/Error of copy */
.amp-copy-notification {
  /* Position */
  position: absolute;
  top: 20px;
  right: 20px;

  /* Box Shadow to make it pop out to users */
  -webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
  -moz-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);

  /* Borders and background color */
  border: 2px solid black;
  border-radius: 5px;
  background-color: blue;
}
```

## Validation

See [amp-copy rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-copy/0.1/validator-amp-copy.protoascii) in the AMP validator specification.
