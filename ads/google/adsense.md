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

# AdSense

## Example

```html
<amp-ad
  width="100vw"
  height="320"
  type="adsense"
  data-ad-client="ca-pub-2005682797531342"
  data-ad-slot="7046626912"
  data-auto-format="rspv"
  data-full-width
>
  <div overflow></div>
</amp-ad>
```

## Configuration

For semantics of configuration, please see [ad network documentation](https://support.google.com/adsense/answer/7183212?hl=en). For AdSense for Search and AdSense for Shopping, please see the [CSA AMP ad type](https://github.com/ampproject/amphtml/blob/master/ads/vendors/csa.md).

Supported parameters:

-   data-ad-channel
-   data-ad-client
-   data-ad-slot
-   data-ad-host
-   data-adtest
-   data-auto-format
-   data-full-width
-   data-tag-origin
-   data-language
-   data-matched-content-ui-type
-   data-matched-content-rows-num
-   data-matched-content-columns-num
-   data-npa-on-unknown-consent
