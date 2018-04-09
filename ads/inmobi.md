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

# InMobi

## Examples

### For 320x50 ad

```html
<amp-ad width="320" height="50"
    type="inmobi"
    data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
    data-slotid="15">
</amp-ad>
```

### For 300x250 ad

```html
<amp-ad width="300" height="250"
    type="inmobi"
    data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
    data-slotid="10">
</amp-ad>
```

### Banner Ad SlotIds

| AdSize  | SlotId |
|---------|--------|
| 320x50  |   15   |
| 300x250 |   10   |
| 468x60  |   12   |
| 728x90  |   11   |
| 120x600 |   13   |


## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

### Required parameters

- `data-siteid`: Site Id is the InMobi property id. You can get this from InMobi dashboard.
- `data-slotid`: Slot Id is the ad size.

### Test Ads

To get test ads, you need to enable Diagnostic Mode from Site settings.
