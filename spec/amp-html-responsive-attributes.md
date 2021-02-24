<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

-   [amp-base-carousel](./../extensions/amp-base-carousel/amp-base-carousel.md)
-   [amp-fit-text](./../extensions/amp-fit-text/amp-fit-text.md)
-   [amp-inline-gallery-pagination](./../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-indicators)
-   [amp-inline-gallery-thumbnails](./../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-thumbnails)
-   [amp-stream-gallery](./../extensions/amp-stream-gallery/amp-stream-gallery.md)
