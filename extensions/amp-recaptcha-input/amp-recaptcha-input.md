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

# <a name="`amp-recaptcha-input`"></a> `amp-recaptcha-input`

<table>
<tr>
<td width="40%"><strong>Description</strong></td>
<td>Appends a <a href="https://developers.google.com/recaptcha/docs/v3">reCAPTCHA v3</a> token to <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-form/amp-form.md">AMP form</a> submissions.</td>
</tr>
<tr>
<td width="40%"><strong>Status</strong></td>
<td>Experimental. You must turn on the `amp-recaptcha-input` experiment to use this component.</td>
</tr>
<tr>
<td width="40%"><strong>Required Script</strong></td>
<td><code>&lt;script async custom-element="amp-recaptcha-input" src="https://cdn.ampproject.org/v0/amp-recaptcha-input-0.1.js">&lt;/script></code></td>
</tr>
<tr>
<td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
<td>nodisplay</td>
</tr>
<tr>
<td width="40%"><strong>Examples</strong></td>
<td><a href="https://github.com/ampproject/amphtml/blob/master/examples/recaptcha.amp.html">Development Example</a></td>
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

**layout (required)**

Required value is `nodisplay`.

**name (required)**

Name of the `<amp-recaptcha-input>`. Will be used as a parameter key in the AMP form body submission.

**data-sitekey (required)**

[reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) site key for the registered website.

**data-action (required)**

[reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) action to be executed on form submission.

## Validation

See [`<amp-recaptcha-input>`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-recaptcha-input/validator-amp-recaptcha-input.protoascii) rules in the AMP validator specification.
