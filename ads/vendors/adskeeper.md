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

# AdsKeeper

## Example

### Basic

Latest version:
```html
<amp-embed
  width="100"
  height="283"
  type="adskeeper"
  data-website="98765"
  data-widget="12345"
>
</amp-embed>
```

Legacy version:
```html
<amp-embed
  width="100"
  height="283"
  type="adskeeper"
  data-publisher="amp-demo"
  data-widget="12345"
  data-container="demo-container"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

Latest version:
-   `data-widget`
-   `data-website`

Legacy version:
-   `data-widget`
-   `data-publisher`
-   `data-container`

### Optional parameters

-   `data-url`
-   `data-options`
