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
    <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-inputmask" src="https://cdn.ampproject.org/v0/amp-inputmask-0.1.js">&lt;/script></code></td>
  </tr>
  <!-- TODO(@cvializ) -->
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

Specifies the mask or masks to apply to the input element. This is a space-separated list of masks.

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

#### mask-output

Specifies how the form will submit the input value.

- **raw** (default): Outputs the value as-is with all special characters.
- **alphanumeric**: Only outputs alphanumeric characters in the mask. The form will add a `type="hidden"` input with the masked input's `name` or `id` attribute with  `-unmasked` appended.

## Validation
See [amp-inputmask rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-inputmask/validator-amp-inputmask.protoascii) in the AMP validator specification.
