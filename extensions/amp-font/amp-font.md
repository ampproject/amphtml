---
$category@: presentation
formats:
  - websites
  - stories
  - ads
deprecated: true
teaser:
  text: Trigger and monitor the loading of custom fonts on AMP pages.
---

<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# amp-font (deprecated)

Replace with a sentence: "This component has been deprecated and should no longer be used. Instead, use the [`font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) descriptor to specify how to display a font face dependent on whether and when it is ready.

The `amp-font` component was AMP's solution to controlling timeouts on font loading. With the wide browser adoption of font-display, this component is no longer necessary. It is here for legacy users.

## Usage

Historically, the `amp-font` extension was used for controlling timeouts on font loading. **We recommend implementing this functionality with [`font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) instead.**

The `amp-font` extension allows adding and removing CSS classes from `document.documentElement`
or `document.body` based on whether a font was loaded or is in error-state.

Example:

```html
<amp-font
  layout="nodisplay"
  font-family="My Font"
  timeout="3000"
  on-error-remove-class="my-font-loading"
  on-error-add-class="my-font-missing"
></amp-font>
<amp-font
  layout="nodisplay"
  font-family="My Other Font"
  timeout="1000"
  on-load-add-class="my-other-font-loaded"
  on-load-remove-class="my-other-font-loading"
></amp-font>
```

The component observes loading of a font. When the font successfully loads it executes the optional `on-load-add-class` and `on-load-remove-class` attributes. If the font loading results in an error or timeout, it runs `on-error-remove-class` and `on-error-add-class`. These classes toggle on the `documentElement` for standalone documents, and on `body` for documents without a `documentElement` i.e. inside a `ShadowRoot`.

Use these classes to guard against displaying a font and get the following results:

- get a short (e.g. 3000ms) timeout in Safari similar to other browsers
- implement FOIT where the page renders with no text before the font comes in
- make the timeout very short and only use a font if it was already cached.

## Attributes

### `font-family`

The font family of the custom loaded font.

### `timeout` (optional)

The allowed time in millisecond for the custom font to load. Defaults to 3000 when undefined. When set to 0 the component loads font only if the font is in the cache. If set to an invalid value it defaults back to 3000.

### `on-load-add-class` (optional)

CSS class to remove from document root after custom font is available.

### `on-error-add-class` (optional)

CSS class to add to the document root if the timeout interval runs out before the font is available.

### `on-error-remove-class` (optional)

CSS class to remove from document root if the timeout interval runs out before the font is available.

### `font-weight` (optional)

Behaves same as standard CSS [`font-weight` property](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight).

### `font-style` (optional)

Behaves same as standard CSS [`font-style` property](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style).

### `font-variant` (optional)

Behaves same as standard CSS [`font-variant` property](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant).

### `layout`

The `layout` attribute must be set to `nodisplay`.

## Validation

See [amp-font rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-font/validator-amp-font.protoascii) in the AMP validator specification.
