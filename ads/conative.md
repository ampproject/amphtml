<!---
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

# CONATIVE

CONATIVE support for AMP.

## Example

- All CONATIVE `<amp-ad>` tags require the `width`, `height`, `layout`, `sizes` and `type="conative"` parameters.

```html
<amp-ad
  height="250"
  width="300"
  type="conative"
  layout="responsive"
  sizes="(min-width: 320px) 320px, 100vw"
  data-domain="1"
  data-adslot="12"
>
</amp-ad>
```

## Configuration

For configuration details and to generate your tags, please contact https://www.definemedia.de/intelligent-content-marketing/#kontakt

### Required parameters

- `data-domain`
- `data-adslot`

### Optional parameters

- `data-preview`
