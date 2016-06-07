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

# AdTech

## Example

```html
<amp-ad width=300 height=250
        type="adtech"
        data-atwMN="2842475"
        data-atwDiv="adtech-ad-container"
        >
```

## Configuration

For semantics of configuration, please see ad network documentation.

### Required Parameters:
* `data-atwMN` - magic number for the ad spot
* `data-atwDiv` - div name of the ad spot

### Optional parameters:
* `data-atwPlId` - placement ID (instead of Magic Number)
* `data-atwOthAT` - generic var to set key/value pairs to send with the ad call
* `data-atwCo` - override default country code
* `data-atwMOAT` - set this var to '1' to enable MOAT
* `data-atwHtNmAT` - override ad host name
* `data-atwNetId` - network ID
* `data-atwWidth` - ad width
* `data-atwHeight`- ad height
* `data-atwSizes` - this overrides atwWidth/atwHeight; use this to create a comma-separated list of possible ad sizes

### Direct URL Call:
* `src` - Value must start with `https:` and contain `/addyn/`.  This should only be used in cases where a direct ad call is being used rather than a magic number (MN).

