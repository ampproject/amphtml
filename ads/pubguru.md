<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# PubGuru

## Examples

```html
<amp-ad
  width="728"
  height="90"
  type="pubguru"
  data-publisher="your-publisher-name"
  data-slot="/23081961/monetizemore.com_test_300x250"
>
</amp-ad>
```

## Configuration

**Required:**

`data-slot` - The adUnit id from the associated Dfp network.

`data-publisher` - Unique publisher name given to you in your PubGuru administration panel.

`width` + `height` - Required for all `<amp-ad>` units. Specifies the ad size.

`type` - always set to "pubguru"
