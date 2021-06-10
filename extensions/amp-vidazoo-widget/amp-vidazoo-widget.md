---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Vidazoo Widget.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-vidazoo-widget

## Usage

Displays a [Vidazoo Widget](https://www.vidazoo.com/).

The `width` and `height` attributes determine the aspect ratio of the widget embedded in responsive layouts.

Example:

```html
<amp-vidazoo-widget
  data-widget-id="5fe8ba17de03c70004db1d48"
  layout="responsive"
  width="16"
  height="9"
>
</amp-vidazoo-widget>
```

## Attributes

### `data-widget-id` (required)

Vidazoo widget ID. Contact Vidazoo support to get your widget ID.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-vidazoo-widget rules](validator-amp-vidazoo-widget.protoascii) in the AMP validator specification.
