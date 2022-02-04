---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays a MathML formula.
  bento: true
  experimental: true
---

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

### Standalone Use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-mathml`, see [**`bento-mathml`**](./1.0/README.md).

## Attributes

### data-formula (required)

Specifies the formula to render.

### inline (optional)

If specified, the component renders inline (`inline-block` in CSS).

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"MathML formula"`.

## Validation

See [amp-mathml rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-mathml/validator-amp-mathml.protoascii) in the AMP validator specification.

## Version Notes

The 1.0 version of amp-mathml will, by default, only render formulas when they are offscreen to avoid layout shifts that would negatively impact the Page Experience (PX). If a formula is onscreen, it will resize to its correct size dynamically when the user has scrolled the formula out of the viewport. When the component returns to the viewport, they formula should be rendered. For best experience, it is recommended to provide the dimensions of the formula using `height` and `width` attributes so formulas onscreen are rendered immediately without causing a layout shift.
