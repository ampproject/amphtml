<!---
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

# TE Medya

## Example of TE Medya's widget implementation

### Basic

```html
<amp-embed
  width="320"
  height="320"
  type="temedya"
  layout="responsive"
  data-title="widget-title"
  data-siteId="site-id"
  data-keyId="key-id"
  data-siteUrl="site-url"
  data-typeId="ad-type"
  data-paidItem="paid-item-count"
  data-organicItem="organic-item-count"
  data-theme="theme-style"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

- `data-title`: Widget Title
- `data-siteId`: Vidyome Website Id
- `data-keyId`: Vidyome Widget Key Id
- `data-siteUrl`: Web Site URL
- `data-typeId`: Widget Type ID (7)
- `data-paidItem`: Paid Item Count
- `data-organicItem`: Organic Item Count
- `data-theme`: Theme Type (light | dark | google)
