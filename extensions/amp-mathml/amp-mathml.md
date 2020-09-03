---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays a MathML formula.
---

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

# amp-mathml

## Usage

Renders a MathML formula in an iframe.

The example below displays the quadratic formula:

```html
<amp-mathml
  layout="container"
  data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
>
</amp-mathml>
```

The example below displays Cauchy's integral formula:

```html
<amp-mathml
  layout="container"
  data-formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"
>
</amp-mathml>
```

The example below displays a double angle formula for cosines:

```html
<amp-mathml
  layout="container"
  data-formula="$$ \cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ) $$"
>
</amp-mathml>
```

### Inline formula

This is an example of a formula of `` <amp-mathml layout="container" inline data-formula="`x`"></amp-mathml> ``, `<amp-mathml layout="container" inline data-formula="\(x = {-b \pm \sqrt{b^2-4ac} \over 2a}\)"></amp-mathml>` placed inline in the middle of a block of text. `<amp-mathml layout="container" inline data-formula="\( \cos(θ+φ) \)"></amp-mathml>` This shows how the formula will fit inside a block of text and can be styled with CSS.

## Attributes

### data-formula (required)

Specifies the formula to render.

### inline (optional)

If specified, the component renders inline (`inline-block` in CSS).

## Validation

See [amp-mathml rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mathml/validator-amp-mathml.protoascii) in the AMP validator specification.
