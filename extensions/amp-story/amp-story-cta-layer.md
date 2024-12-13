---
$category@: presentation
formats:
  - stories
teaser:
  text: A single layer of a single page of an AMP story, which allows linking to other content.
---

# amp-story-cta-layer

> ## Notice: amp-story-cta-layer is depreciated see [I2D issue](https://github.com/ampproject/amphtml/issues/34450) for details. Use [amp-story-page-outlink](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-page-attachment/amp-story-page-outlink.md) instead.

## Usage

The `<amp-story-cta-layer>` component allows the usage of `<a>` and `<button>` elements inside an `<amp-story-page>`.

-   The `<amp-story-cta-layer>` element may not appear on the first story page.
-   If specified, the `<amp-story-cta-layer>` element must be the last layer within an `<amp-story-page>`.
-   Every `<amp-story-page>` (except the first) can have exactly one or exactly zero of the `<amp-story-cta-layer>` element.
-   Positioning and sizing of this layer cannot be controlled. It is always 100% width of the page, 20% height of the page, and aligned to the bottom of the page.

[tip type="important"]
Both `amp-story-cta-layer` and `amp-story-page-attachment`(amp-story-page-attachment.md) must be the last child tag of an [`amp-story-page`](amp-story-page.md). Because of this, you may include neither or one, but not both.
[/tip]

```html
<amp-story-page id="vertical-template-thirds">
  <amp-story-grid-layer template="thirds">
    <div class="content" grid-area="upper-third">Paragraph 1</div>
    <div class="content" grid-area="middle-third">Paragraph 2</div>
    <div class="content" grid-area="lower-third">Paragraph 3</div>
  </amp-story-grid-layer>
  <amp-story-cta-layer>
    <a href="https://www.ampproject.org" class="button">Outlink here!</a>
  </amp-story-cta-layer>
</amp-story-page>
```

<amp-img alt="CTA Layer" layout="fixed"
    src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-cta-layer.png"
    width="404" height="678">
<noscript>
<img width="404" height="678"
         src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-cta-layer.png" />
</noscript>
</amp-img>

[Complete example found in the examples directory](https://github.com/ampproject/amphtml/blob/main/examples/amp-story/cta-layer-outlink.html)

### Valid children

The `amp-story-cta-layer` allows mostly the same descendants as `amp-story-grid-layer`, and additionally allows `<a>` and `<button>` tags.

For an updated list of supported children, be sure to take a look at the [amp-story-cta-layer-allowed-descendants](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/validator-amp-story.protoascii) field in the validation rules.
