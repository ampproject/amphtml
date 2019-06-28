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

### amp-ad-network-adsense-impl

AdSense implementation of AMP Ad tag which requests early by XHR and
renders natively within the page if a valid AMP Ad is returned.  Should
not be directly referenced by pages and instead is dynamically loaded
via the amp-ad tag.  However, in order to remove an async script load
of this library, publishers can include its script declaration.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>General Availability</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TBD</td>
  </tr>
</table>

#### AMP Consent integration

The `<amp-consent>` element can be used to block the ad request until the user or AMP consent [checkConsentHref](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#consent-configuration) end point provide consent state.  After the amp-consent extension has been configured (please refer to its [documentation](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md)), it can be linked to the amp-ad element via the `data-block-on-consent` attribute.

If the user has responded negatively to the amp-consent component (user rejects the consent prompt), RTC call-outs will not be made and [non-personalized ads](https://support.google.com/dfp_premium/answer/9005435) will be requested.  

If the user’s response to the amp-consent is unknown (user dismisses the consent prompt), by default, no ad requests are sent.  
If `data-npa-on-unknown-consent` is set to true, non-personalized ads will be requested.

See [AdSense Help Center article](https://support.google.com/dfp_premium/answer/7678538) for more information.

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
