---
$category@: social login
formats:
  - websites
teaser:
  text: Displays Google One Tap.
---

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

# amp-onetap-google

## Overview

`amp-onetap-google` displays [Google One Tap sign-in](https://developers.google.com/identity/one-tap/web).

#### Example

```html
<amp-onetap-google
  layout="nodisplay"
  data-src="https://example.com/onetap"
></amp-onetap-google>
```

After a successful sign-in, [`amp-access`](https://go.amp.dev/c/amp-access) and/or [`amp-subscriptions`](https://go.amp.dev/c/amp-subscriptions) are refreshed on the page.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-src (required)</strong></td>
    <td>The URL of the intermediate iframe.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>
