---
$category@: media
formats:
  - websites
teaser:
  text: Appends a reCAPTCHA v3 token to AMP form submissions.
---
<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# amp-recaptcha-input

Appends a <a href="https://developers.google.com/recaptcha/docs/v3">reCAPTCHA v3</a> token to <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-form/amp-form.md">AMP form</a> submissions.

<table>
<tr>
<td width="40%"><strong>Required Script</strong></td>
<td><code>&lt;script async custom-element="amp-recaptcha-input" src="https://cdn.ampproject.org/v0/amp-recaptcha-input-0.1.js">&lt;/script></code></td>
</tr>
<tr>
<td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
<td>nodisplay</td>
</tr>
<tr>
<td width="40%"><strong>Examples</strong></td>
<td><a href="https://amp.dev/documentation/examples/components/amp-recaptcha-input">Example on amp.dev</a></td>
</tr>
</table>

[TOC]

## Behavior

This extension adds a parameter containing a recaptcha response token when a parent `<form>` element submits. `amp-recaptcha-input` does this by creating an iframe to load the reCAPTCHA v3 api script using the provided site key, and calling `grecaptcha.execute` with the provided site key and action.

### Example

This example demonstrates how `<amp-recaptcha-input>` usage on an AMP page correlates to calls on the `grecaptcha` object and form body. `<amp-recaptcha-input>` must be a child of a `<form>` element.

**`<amp-recaptcha-input>` usage**

```
<form amp-form-attributes-go-here>
  ...
  <amp-recaptcha-input layout="nodisplay" name="reCAPTCHA_body_key" data-sitekey=”reCAPTCHA_site_key" data-action="reCAPTCHA_example_action">
  </amp-recaptcha-input>
  ...
</form>
```

**Corresponding `grecaptcha` call**

```
grecaptcha.execute('reCAPTCHA_site_key', {action: 'reCAPTCHA_example_action'});
```

**Corresponding AMP form submit body**

```
{
  ...other form params
  “reCAPTCHA_body_key”: “returned_reCAPTCHA_response_token”
}
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>layout (required)</strong></td>
    <td>Required value is <code>nodisplay</code>.
</td>
  </tr>
  <tr>
    <td width="40%"><strong>name (required)</strong></td>
    <td>Name of the <code>&lt;amp-recaptcha-input&gt;</code>. Will be used as a parameter key in the AMP form body submission.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-sitekey (required)</strong></td>
    <td><a href="https://developers.google.com/recaptcha/docs/v3">reCAPTCHA v3</a> site key for the registered website.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-action (required)</strong></td>
    <td><a href="https://developers.google.com/recaptcha/docs/v3">reCAPTCHA v3</a> action to be executed on form submission.</td>
  </tr>
</table>

## Validation

See [`<amp-recaptcha-input>`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-recaptcha-input/validator-amp-recaptcha-input.protoascii) rules in the AMP validator specification.
