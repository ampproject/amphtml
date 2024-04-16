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

# <a name="amp-ad-network-smartadserver-impl"></a> `amp-ad-network-smartadserver-impl`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>The Smartadserver fast fetch implementation for serving AMP ads using <code>&lt;amp-ad&gt;</code></td>
  </tr>
  <tr>
    <td class="col-fourty" width="25%"><strong>Availability</strong></td>
    <td>Launched</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
</table>

# Behavior

Smartadserver supports the Real Time Config (RTC) to preload configuration settings for ad placements. The RTC setup is optional.

# Supported parameters

Smartadserver largely uses the same tags as `<amp-ad>`. The following are required tags for special behaviors of existing ones:

-   `data-site`: Site ID
-   `data-page`: Page ID
-   `data-format`: Format ID
-   `data-domain`: Ad call domain

These attributes are optional:

-   `data-target`: Targeting string
-   `data-isasync`: Is call to Smartadserver should be executed in sync or async mode
-   `data-schain`: SupplyChain Object string
-   `rtc-config`: Please refer to [RTC Documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-documentation.md) for details

## Example configuration

```html
<amp-ad width="300" height="250" type="smartadserver"
  data-site="38877"
  data-page="1410268"
  data-format="945"
  data-target="test=amp"
  data-isasync="true"
  data-domain="https://www4.smartadserver.com">
</amp-ad>
```
