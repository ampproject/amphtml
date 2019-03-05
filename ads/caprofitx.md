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

# CA ProFit-X

## Examples

### (Deprecated) Ad placement with `tagid`

Please consider using the latest setup with `mediaid`.

```html
<amp-ad
  width="320"
  height="50"
  type="caprofitx"
  data-tagid="15217"
  data-placeid="0">
</amp-ad>
```

### Ad placement with `mediaid`

```html
<amp-ad
  width="320"
  heigth="100"
  type="caprofitx"
  data-mediaid="3752"
  data-tag-places="10007"
```

## Configurations

For details on the configuration semantics and to generate your tags,
please email ca_profitx_support@cyberagent.co.jp.

### (Deprecated) Ad placement with `tagid`

Supported parameters:

| Parameter    | Required |
|--------------|--------- |
| data-tagid   | Yes      |
| data-placeid | No       |

### Ad placement with `mediaid`

Supported parameters:

| Parameter                | Required |
|--------------------------|----------|
| data-mediaid             | Yes      |
| data-tag-places          | Yes      |
| data-pageid              | No       |
| data-additional-css-urls | No       |
| data-device-ifa          | No       |
