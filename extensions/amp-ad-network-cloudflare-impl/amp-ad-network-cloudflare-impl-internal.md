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
    <td>Cloudflare sample implementation of AMP Ad tag which integrates with
    Cloudflare's transparent creative signing.  Ad networks can use this code
    to build out their own libraries.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><code>&lt;amp-ad type="cloudflare" ...>&lt;/amp-ad></code></td>
  </tr>
</table>

#### Examples
Example - AdSense Ad
```html
<amp-ad width=300 height=200
    type="cloudflare"
    data-a4a="true"
    src="/ad.html?v=6">
</amp-ad>
```

#### Attributes

* data-a4a - enables Amp4Ad, instead of normal Ad flow
* src - path to ad creative
