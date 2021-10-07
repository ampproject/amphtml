# AMP HTML Responsive Attributes

You can apply or remove certain attributes based on screen size. These are responsive attributes, or media attributes. On eligible components, these attributes are applied or removed based on media queries. You can also use a value without any media queries. Media queries evaluate from from left to right, applying the first matching media query. You must include a default value with no media query.

[tip type="note"]

Responsive attributes do not require media queries. You may apply media query eligible attributes the same as regular attributes: `attr-name="attr-value"`.

[/tip]

To apply this behavior to an attribute, use the following format:

```html
<amp-component
  attr-name="(min-width: 1000px) valueOne, (min-width: 600px) valueTwo, defaultValue"
></amp-component>
```

In the example above, if the page has a screen of `1000px` or more, it applies `valueOne`. If the width is between `999px` and `600px`, it applies `valueTwo`. When the screen is `599px` or smaller, it applies the `defaultValue`.

The following `amp-base-carousel` will show `3` slides at a time when width is greater than or equal to `800px`, and `2` otherwise.

[example preview="top-frame" playground="true" imports="amp-base-carousel:1.0"]

```html
<amp-base-carousel
    width="900" height="200"
    layout="responsive"
    visible-count="(min-width: 800px) 3, 2">
  <amp-img src="./img/redgradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/greengradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/bluegradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/orangegradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/tealgradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/lemonyellowgradient.png" layout="flex-item"></amp-img>
  <amp-img src="./img/lilacgradient.png" layout="flex-item"></amp-img>
</amp-base-carousel>
```

[/example]

## Eligible components

You may apply responsive attribute values to the following components:

-   [amp-accordion](./../../extensions/amp-accordion/amp-accordion.md#animate)
-   [amp-base-carousel](./../../extensions/amp-base-carousel/amp-base-carousel.md#media-queries)
-   [amp-fit-text](./../../extensions/amp-fit-text/amp-fit-text.md#media-queries)
-   [amp-inline-gallery-pagination](./../../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-indicators)
-   [amp-inline-gallery-thumbnails](./../../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-thumbnails)
-   [amp-lightbox](./../../extensions/amp-lightbox/amp-lightbox.md#animation)
-   [amp-selector](./../../extensions/amp-selector/amp-selector.md#keyboard-select-mode)
-   [amp-stream-gallery](./../../extensions/amp-stream-gallery/amp-stream-gallery.md#media-queries)
-   [amp-video](./../../extensions/amp-video/amp-video.md#rotate-to-fullscreen)
