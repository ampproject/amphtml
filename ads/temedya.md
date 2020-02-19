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

# TE Medya Native Widget Model

## Example of TE Medya's widget implementation

### Basic

```html
<amp-embed
  width="320"
  height="320"
  type="temedya"
  layout="responsive"
  data-siteId="vidyome"
  data-keyId="1rlN7oGR6ofEuJz6llh9Pj"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 
You can visit [publishers.vidyome.com](https://publishers.vidyome.com) for ads.

### Required parameters

- `data-title`: Widget Title
- `data-siteId`: Vidyome Website Id
- `data-keyId`: Vidyome Widget Key Id
- `data-siteUrl`: Web Site URL
- `data-typeId`: Widget Type ID (7)
- `data-paidItem`: Paid Item Count
- `data-organicItem`: Organic Item Count
- `data-theme`: Theme Type (light, dark, google)


