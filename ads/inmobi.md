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

# InMobi

## Examples

### For 320x50 Ad

```html
<amp-ad
width="320"
height="50"
type="inmobi"
data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
data-slotid="15"
data-testdeviceid="26F6721C-6852-4077-A60A-DD58BD1F2A8C">
</amp-ad>
```

### For 300x250 Ad

```html
<amp-ad
width="300"
height="250"
type="inmobi"
data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
data-slotid="10"
data-testdeviceid="26F6721C-6852-4077-A60A-DD58BD1F2A8C">
</amp-ad>
```

## Configuration

For configuration, please see [ad network documentation](https://support.inmobi.com/monetize/integration/mobile-web/mobile-web-integration-guide/#integrating-the-ad-code).

Supported parameters:

**Required**
- width:        required by amp
- height:       required by amp
- data-siteid: Site Id is the InMobi property id. You can get this from InMobi dashboard.
- data-slotid: Slot Id is the ad size. 15 for 320x50 and 10 for 300x250.

**Optional**
- data-testdeviceid: To get test ads for specific device id. This device id should be added in the diagnostic mode of Site settings.
