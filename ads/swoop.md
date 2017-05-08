<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# Swoop

## Example

```html
<amp-ad width=auto height=125
        type="swoop"
        layout="fixed-height"
        data-layout="fixed-height"
        data-publisher="SW-11122234-1AMP"
        data-placement="page/content"
        data-slot="article/body">
  <div placeholder></div>
  <div fallback></div>
</amp-ad>
```

## Configuration

For semantics of configuration, please see ad network documentation.

Required parameters:

- `layout`: AMP layout style, should match the `layout` attribute of the `amp-ad` tag
- `publisher`: Publisher ID
- `placement`: Placement type
- `slot`: Slot ID
