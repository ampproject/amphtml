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

# amp-ad-network-dianomi-impl

The Dianomi fast fetch implementation for serving AMP ads, using `<amp-ad>`.

[https://amp.dev/documentation/components/amp-ad/?format=websites](https://amp.dev/documentation/components/amp-ad/?format=websites)

### Required parameters

-   `data-request-param-id` : A Dianomi provided SmartAd ID.

#### Example configuration:

```html
<amp-ad
  width="400"
  height="450"
  type="dianomi"
  data-request-param-id="5519">
</amp-ad>
```
