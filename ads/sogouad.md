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

# Sogou

## Examples

```html
<!-- Responsive Ad -->
<amp-ad width="20" height="3"
    type="sogou_ad"
    layout="responsive"
    data-slot="854370"
    data-w="20"
    data-h="3">
</amp-ad>

<!-- Fixed-height Ad -->
<amp-ad height="69"
    type="sogou_ad"
    layout="fixed-height"
    data-slot="854366"
    data-w="100%"
    data-h="69">
</amp-ad>
```

## Configuration

Responsive mode:

- `data-slot` slot id of sogou ads
- `data-w` always be 20
- `data-h` slot's height info from sogou ads

Fixed-height mode:

- `data-slot` slot id of sogou ads
- `data-w` always be 100%
- `data-h` slot's height info from sogou ads
