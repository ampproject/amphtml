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

# Bringhub

## Example installation of the Bringhub Mini-Storefront

### Basic

```html
<amp-embed width="600" height="320"
    type="bringhub"
    layout="responsive"
    heights="(max-width: 270px) 1280px, (max-width:553px) 640px, 338px">
</amp-embed>
```

## Configuration

### Optional parameters

- `htmlURL`: The URL of the standard html version of the page. Defaults to `global.context.canonicalURL`.
- `ampURL`: The URL of the AMP version of the page. Defaults to `global.context.sourceUrl`.
- `articleSelector`: The CSS Selector of the article body on the page. Contact your Bringhub Account Manager for requirements.
