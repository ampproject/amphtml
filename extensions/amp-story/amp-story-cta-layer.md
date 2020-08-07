---
$category@: presentation
formats:
  - stories
teaser:
  text: A single layer of a single page of an AMP story, which allows linking to other content.
---

<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# amp-story-cta-layer

## Usage

The `<amp-story-cta-layer>` component allows the usage of `<a>` and `<button>` elements inside an `<amp-story-page>`.

- If specified, the `<amp-story-cta-layer>` element must be the last layer within an `<amp-story-page>`. As a result, effectively every `<amp-story-page>` can have exactly one or exactly zero of the `<amp-story-cta-layer>` element.
- Positioning and sizing of this layer cannot be controlled. It is always 100% width of the page, 20% height of the page, and aligned to the bottom of the page.

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
    src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-cta-layer.png"
    width="404" height="678">
<noscript>
<img width="404" height="678"
         src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-cta-layer.png" />
</noscript>
</amp-img>

[Complete example found in the examples directory](https://github.com/ampproject/amphtml/blob/master/examples/amp-story/cta-layer-outlink.html)

### Valid children

The `amp-story-cta-layer` allows mostly the same descendants as `amp-story-grid-layer`, and additionally allows `<a>` and `<button>` tags.

For an updated list of supported children, be sure to take a look at the [amp-story-cta-layer-allowed-descendants](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/validator-amp-story.protoascii) field in the validation rules.
