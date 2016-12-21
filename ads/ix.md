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

# Index Exchange

Index supports both direct ad tags and Header Tag style bidding using Doubleclick as the ad server.

## Examples

### Ad tag ###

```html
<amp-ad width=300 height=250
  type="ix"
  data-ad-units="4"
  data-casale-i-d="1"
  data-version="2"
</amp-ad>
```

### Header Tag ###

```html
<amp-ad width=300 height=250
  type="ix"
  data-ix-id="54321"
  data-slot="/1234/example"
</amp-ad>
```

## Configuration

For semantics of configuration, please contact your account manager at Index Exchange.

### Ad tag ###

__Required:__

- `data-ad-units`
- `data-casale-i-d` or `data-app-i-d`
- `data-version`


__Optional:__

- `data-default-ad-unit`
- `data-floor`
- `data-floor-currency`
- `data-interstitial`
- `data-position-i-d`
- `data-pub-default`
- `data-pub-passback`
- `data-referrer`
- `data-ifa`

### Header Tag ###

__Required:__

- `data-ix-id`
- `data-slot`


__Optional:__

- `data-ix-slot`

Additional parameters including `json` will be passed through in the resulting call to DFP. For details please see the [Doubleclick documentation](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md).

