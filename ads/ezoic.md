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

# Ezoic

## Example

```html
<amp-ad width="300" height="250"
    type="ezoic"
    data-slot="slot-name" 
    data-json='{"targeting":{"compid":0}, "extras":{"adsense_text_color":"000000"}'>
</amp-ad>
```

## Ad size

The ad size is the size of the ad that should be displayed. Make sure the `width` and `height` attributes of the `amp-ad` tag match the available ad size.


## Configuration

To generate tags, please visit https://svc.ezoic.com/publisher.php?login

Supported parameters:

- `data-slot`: the slot name corresponding to the ad position

Supported via `json` attribute:

- `targeting`
- `extras`
