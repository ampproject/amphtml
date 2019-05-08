<!--
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

# \`amp-inputmask\`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides input masking capabilities to inputs in AMP forms</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-inputmask" src="https://cdn.ampproject.org/v0/amp-inputmask-0.1.js">&lt;/script></code></td>
  </tr>
  <!-- TODO(@cvializ) after the experiment is in PROD so AMP By Example can use the component -->
  <!-- <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr> -->
</table>

## Behavior

`amp-inputmask` enables the `mask` and `mask-output` attributes on `input` elements. These allow document authors to specify input masks for their form elements.

Input masks automatically add formatting characters to user input, and prevent
users from typing input that doesn't match the mask. For example, an input mask
on a telephone field automatically adds special characters like
`(`, `)` and `-`, and users can type only the numbers needed while the mask prevents
them from typing incorrect characters.

#### Supported elements

- `input[type=text]`
- `input[type=tel]`
- `input[type=search]`

## Attributes

#### mask

Specifies the mask or masks to apply to the input element.

Custom masks are composed of the following characters,
and may be listed separated by spaces:

<table>
<tr>
<th width="30%"><code>mask</code><br>character</th>
<th>Description</th>
</tr>
<tr>
<td><code>L</code></td>
<td>The user must add an alphabetical character</td>
</tr>
<tr>
<td><code>0</code></td>
<td>The user must add a numeric character</td>
</tr>
<tr>
<td><code>A</code></td>
<td>The user must add an alphanumeric character</td>
</tr>
<tr>
<td><code>C</code></td>
<td>The user must add an arbitrary character</td>
</tr>
<tr>
<td><code>l</code></td>
<td>The user may optionally add an alphabetical character</td>
</tr>
<tr>
<td><code>a</code></td>
<td>The user may optionally add an alphanumeric character</td>
</tr>
<tr>
<td><code>c</code></td>
<td>The user may optionally add an arbitrary character</td>
</tr>
<tr>
<td><code>9</code></td>
<td>The user may optionally add a numeric character.</td>
</tr>
<tr>
<td><code>\</code></td>
<td>The backslash `\` escapes the next character in the mask to be a character literal.</td>
</tr>
<tr>
<td><code>_</code></td>
<td>The mask will automatically insert a space character</td>
</tr>
</tbody>
</table>

As an example, this masked input will allow the user to enter a
Canadian postal code. The space will be automatically added for the user.
```html
<input mask="L0L_0L0" placeholder="A1A 1A1" type="text">
```

This mask allows a user to enter either a 5-digit or a 9-digit US ZIP code.
The hyphen will be automatically added as the user types the sixth digit.
```html
<input mask="00000 00000-0000" placeholder="10001" type="tel">
```

This mask accepts a North American phone number.
The characters "+", "1", " ", "(", ")" and "-" will be automatically added as the user types.
```html
<input type="tel" mask="+1_(000)_000-0000" placeholder="+1 (555) 555-5555">
```

The following named masks are supported:

<table>
<tr>
<th width="30%"><code>mask</code><br></th>
<th>Description</th>
</tr>
<tr>
<td><code>payment-card</code></td>
<td>The user must enter a payment card number.
The mask automatically adds spaces to chunk the numbers, and supports both
American Express-style and Visa-style chunking.</td>
</tr>
</tbody>
</table>

As an example, this masked input will allow the user to enter a payment card number.
Space characters " " will be automatically added as the user types.

```html
<input type="tel" mask="payment-card" placeholder="0000 0000 0000 0000">
```

#### mask-trim-zeros

Specifies how many zeros the mask will remove from pasted values into
custom masks. For backwards compatibility, the default is `2`.
Specify `0` to disable this behavior.

When users paste values from spreadsheets, often there is a zero padding
on the left side. For example, North American phone numbers are sometimes
stored as 015551112222 where 1 is the country code, but it has been zero-padded.
The `mask-trim-zeros` attribute will remove up to the given number of zeros.
The `mask-trim-zeros` attribute does not affect named masks.

#### mask-output

Specifies how the form will submit the input value.

- **raw** (default): Outputs the value as-is with all special characters.
- **alphanumeric**: Only outputs alphanumeric characters in the mask. The form will add a `type="hidden"` input with the masked input's `name` or `id` attribute with  `-unmasked` appended.

Example:

Here, the `mask-output` output attribute is set to `raw`.

```html
<input mask="+\1_(000)_000-0000" mask-output="raw" name="phone" type="tel" placeholder="+1 (555) 555-5555">
```

If the `mask-output` attribute is missing, the default is `raw`
```html
<!-- missing `mask-output`, which is equivalent to `mask-output="raw"` -->
<input mask="+\1_(000)_000-0000" name="phone" type="tel" placeholder="+1 (555) 555-5555">
```

When `mask-output` is set to `raw`, the form will submit the `input` value as-is. For example, if the input contains `+1 (800) 123-4567`, the form will submit the following value:

```json
{"phone": "+1 (800) 123-4567"}
```

Here, the `mask-output` output attribute is set to `alphanumeric`.

```html
<input mask="+\1_(000)_000-0000" mask-output="alphanumeric" name="phone" type="tel" placeholder="+1 (555) 555-5555">
```

When `mask-output` is set to `raw`, the form will submit the `input` value as-is, and the form will add a hidden input. The hidden input will have the alphanumeric characters from the original input. Its `name` will be the original input's name with `-unmasked` appended. For example, if the input contains `+1 (800) 123-4567`, the form will submit the following values:
```json
{
  "phone": "+1 (800) 123-4567",
  "phone-unmasked": "18001234567"
}
```

## Validation
See [amp-inputmask rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-inputmask/validator-amp-inputmask.protoascii) in the AMP validator specification.
