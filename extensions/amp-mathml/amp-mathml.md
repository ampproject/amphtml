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

# <a name="`amp-mathml`"></a> `amp-mathml`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://www.w3.org/Math/">MathML formula</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-mathml" src="https://cdn.ampproject.org/v0/amp-mathml-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>container</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-mathml.amp.html">amp-mathml.amp.html</a></td>
  </tr>
</table>

## Behavior

This extension creates an iframe and renders a MathML formula.

#### Example: The Quadratic Formula

```html
<amp-mathml layout="container" data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]">
</amp-mathml>
```

#### Example: Cauchy's Integral Formula

```html
<amp-mathml layout="container" data-formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]">
</amp-mathml>
```
#### Example: Double angle formula for Cosines

```html
<amp-mathml layout="container" data-formula="\[ \cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ) \]">
</amp-mathml>
```
#### Example: Inline formula

This is an example of a formula placed  inline in the middle of a block of text. `<amp-mathml layout="container" inline data-formula="\[ \cos(θ+φ) \]"></amp-mathml>` This shows how the formula will fit inside a block of text and can be styled with CSS.

## Attributes

##### data-formula (required)

Specifies the formula to render.

##### inline (optional)

If specified, the component renders inline (`inline-block` in CSS).

## Validation
See [amp-mathml rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mathml/validator-amp-mathml.protoascii) in the AMP validator specification.
