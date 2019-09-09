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

# ReadMo

## Example

ReadMo only requires a section code to run. Please work your account manager to properly configure your AMP section.

### Basic

```html
  <amp-embed width="400" height="400"
             type="readmo"
             layout="responsive"
             data-url="https://yoursite.com"
             data-infinite="true"
             data-section="1234567">
  </amp-embed>
```

### Required parameters

- `data-section` : A unique section code that represents your site and placement
- `data-url` : Url that your section code is valid to run on

### Optional parameters

- `data-module` : Type of module to render (`end-of-article`, `smart-feed`, `smart-feed-video`, `side-rail`)
- `data-infinite` : If true, will enable infinite feed
- `data-title` : Text that will appear above the module (defaults to "You May Like")
- `data-sponsored-by-label` : Custom text override to the "Sponsored by" label that appears next to the advertiser name
