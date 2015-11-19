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

# Doubleclick

## Example

### Basic

```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner">
</amp-ad>
```

### With additional targeting

```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner"
    json='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusion":"health","tagForChildDirectedTreatment":1}'>
</amp-ad>
```

## Configuration

For semantics of configuration, please see ad network documentation.

Supported parameters:

- data-slot

Supported via `json` attribute:

- categoryExclusion
- cookieOptions
- tagForChildDirectedTreatment
- targeting
