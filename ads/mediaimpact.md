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

# MediaImpact

## Example

```html
<amp-ad width="300" height="250"
    type="mediaimpact"
    data-site="67767"
    data-page="amp"
    data-format="4459"
    data-target=""
    data-slot="4459">
</amp-ad>
```

## Configuration

for further information regarding this implementation, please contact adtechnology@axelspringer.de  or visit http://www.mediaimpact.de/ 

Supported parameters:

- `data-site`: siteid given by mediaimpact
- `data-page`: pageName given by mediaimpact
- `data-format`: formatid e.g. 4459 (MREC)
- `data-target`: for special targeting like "goodCustomer=true;"
- `data-slot`: slotid without trailing sas_

## Optional features

- Loading placeholder for ads, see [Placeholders in amp-ad](https://amp.dev/documentation/components/amp-ad#placeholder).
- No ad fallback for ads, see [No ad in amp-ad](https://amp.dev/documentation/components/amp-ad#no-ad-available).
