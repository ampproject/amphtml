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

### <a name="amp-ad-network-adsense-impl"></a> `amp-ad-network-adsense-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>AdSense implementation of AMP Ad tag which requests early by XHR and
    renders natively within the page if a valid AMP Ad is returned.  Should
    not be directly referenced by pages and instead is dynamically loaded
    via the amp-ad tag.  However, in order to remove an async script load
    of this library, publishers can include its script declaration.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TBD</td>
  </tr>
</table>

#### Examples
Example - AdSense Ad
```html
<amp-ad width=300 height=200
    type="adsense"
    data-ad-client="ca-pub-8125901705757971"
    data-ad-slot="7783467241">
</amp-ad>
```

#### Attributes
TODO: Add attributes
