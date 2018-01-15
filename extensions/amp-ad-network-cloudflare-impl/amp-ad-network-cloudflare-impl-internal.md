<!---
Copyright 2016 Cloudflare. All Rights Reserved.

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

### <a name="amp-ad-network-cloudflare-impl"></a> `amp-ad-network-cloudflare-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Cloudflare implementation of AMP Ad tag which integrates with
    Cloudflare's transparent creative signing.  Cloudflare based Ad networks
    can use this tag to have publishers point to signed AMP creatives on the
    Ad network.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
</table>

#### Examples
Example - Simple Ad
```html
<amp-ad width=300 height=200
    type="cloudflare"
    data-cf-network="my-ad-network"
    src="/ad.html?v=6">
</amp-ad>
```

Example - Ad with additional parameters and replacements
```html
<amp-ad width=300 height=200
    type="cloudflare"
    data-cf-network="my-ad-network"
    data-slot="slot_1"
    data-format="panoramic"
    src="/ad.html?v=6&w=SLOT_WIDTH">
</amp-ad>
```

#### Attributes

* data-cf-network - ad network to use (contact Cloudflare to integrate new ones)
* data-cf-a4a - disables Fast-Fetch Amp4Ads when false (still displays ad)
* src - Path to the ad creative on a Ad network (can use the following replacement tokens)
  * SLOT_WIDTH - width of the target slot
  * SLOT_HEIGHT - height of the target slot
* data-<param> - additional query parameters to the URL
