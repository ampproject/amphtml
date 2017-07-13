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

# Criteo

Criteo support for AMP covers Real Time Audience (RTA), Publisher Marketplace (PuMP) and Passback technologies.

For configuration details and to generate your tags, please refer to [your publisher account](https://publishers.criteo.com) or contact publishers@criteo.com.

## Example - RTA

```html
<amp-ad width=300 height=250
    type="criteo"
    data-tagtype=“rta”
    data-networkid=“76543”
    data-adserver=“DFP”
    data-slot=“/0987654/rta_zone_amp”
    data-doubleclick='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"]}'>
</amp-ad>
```

## Example - PuMP and Passback

```html
<amp-ad width=300 height=250
    type="criteo"
    data-tagtype=“passback”
    data-zone=“567890”>
</amp-ad>
```

## Configuration

The ad size is based on the setup of your Criteo zone. The `width` and `height` attributes of the `amp-ad` tag should match that.

### RTA

Supported parameters:

- `data-tagtype`: identifies the used Criteo technology. Must be “rta”. Required.
- `data-adserver`: the name of your adserver. Required. Only “DFP” is supported at this stage.
- `data-slot`: adserver (DFP) slot slot. Required.
- `data-networkid`: your Criteo network id. Required.
- `data-varname`: `crtg_content` variable name to store RTA labels. Optional.
- `data-cookiename`: `crtg_rta` RTA cookie name. Optional.
- `data-doubleclick`: custom options to send to doubleclick, in JSON format. Optional. See [doubleclick documentation](google/doubleclick.md) for details.

### PuMP and Passback

Supported parameters:

- `data-tagtype`: identifies the used Criteo technology. Must be “passback”. Required.
- `data-zone`: your Criteo zone identifier. Required.

