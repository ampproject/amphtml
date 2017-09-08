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

# PulsePoint

## Tag Example

```html
  <amp-ad width=300 height=250
      type="pulsepoint"
      data-pid="512379"
      data-tagid="472988"
      data-size="300X250">
  </amp-ad>
```

## Header Bidding Tag Example

```html
  <amp-ad width=300 height=250
      type="pulsepoint"
      data-pid="521732"
      data-tagid="76835"
      data-tagtype="hb"
      data-timeout="1000"
      data-slot="/1066621/ExchangeTech_Prebid_AdUnit">
  </amp-ad>
```

## Configuration

For semantics of configuration, please see [ad network documentation](https://www.pulsepoint.com).

Supported parameters:

- pid     - Publisher Id
- tagid   - Tag Id
- tagtype - Tag Type. "hb" represents Header bidding, otherwise treated as regular tag.
- size    - Ad Size represented 'widthxheight'
- slot    - DFP slot id, required for header bidding tag
- timeout - optional timeout for header bidding, default is 1000ms.