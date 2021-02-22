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

## Overview

Responsive attributes, or media attributes, are the attributes for certain AMP components that can be configured to use different options based on a media query. You can also use a value without any media queries. The format looks like:

```html
<amp-component
  attr-name="(min-width: 1000px) valueOne, (min-width: 600px) valueTwo, defaultValue"
></amp-component>
```

The media queries are evaluated from left to right, with the first matching
media query being used. A default value (without a media query) is required. In
this case, if the page has a screen width of 1000px or more, `valueOne` is used.
If the width is between 999px and 600px, `valueTwo` is used. When it is 599px or
smaller, `defaultValue` is used.

## Eligible components

-   [amp-base-carousel](./../extensions/amp-base-carousel/amp-base-carousel.md)
-   [amp-inline-gallery-pagination](./../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-indicators)
-   [amp-inline-gallery-thumbnails](./../extensions/amp-inline-gallery/amp-inline-gallery.md#include-pagination-thumbnails)
-   [amp-stream-gallery](./../extensions/amp-stream-gallery/amp-stream-gallery.md)
