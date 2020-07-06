---
$category: layout
formats:
  - websites
  - email
  - ads
  - stories
teaser:
  text: A generic, multi-purpose container element that brings AMP's powerful layouts to any element.
---

<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# amp-layout <a name="amp-layout"></a>

## Usage

The `amp-layout` component allows you to apply aspect-ratio based responsive
layouts to any element. The `amp-layout` component works similarly to the
[`layout`](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout#the-layout-attribute)
attribute on existing AMP components, but supports any HTML markup as children.
Other supported layouts all work with `amp-layout` (e.g., fixed-height, fixed,
etc.).

The example below uses `amp-layout` to create a responsive container around a circle
drawn with inline SVG.

```html
<amp-layout layout="responsive" width="1" height="1">
  <svg viewBox="0 0 100 100">
    <circle cx="50%" cy="50%" r="40%" stroke="black" stroke-width="3" />
    Sorry, your browser does not support inline SVG.
  </svg>
</amp-layout>
```

## Attributes

### Common attributes

The `amp-layout` component includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-layout rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
