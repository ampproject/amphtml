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

# Index Exchange AMP RTC 

Index Exchange (IX) supports [AMP Real Time Config (RTC)](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/rtc-publisher-implementation-guide.md) which allows Publishers to augment their ad requests with targeting information that is retrieved at runtime. This document provides instructions on adding IX as a vendor to AMP pages.  

## Configuration
Each [amp-ad](https://amp.dev/documentation/components/amp-ad/) element that uses RTC must have the `rtc-config` attribute set with valid JSON. 

### Example: RTC Specification on an amp-ad

```
<!-- Note: Default timeout is 1000ms -->
<amp-ad width="320" height="50" type="doubleclick"
        data-slot="/1234/pos"
        rtc-config='{
            "vendors": {
                "IndexExchange": {"SITE_ID": "123456"},
            },
            "timeoutMillis": 1000}'>
</amp-ad>
```
The value of `rtc-config` must conform to the following specification:
```
{
            "vendors": {
                "IndexExchange": {"SITE_ID": "123456"},
            },
            "timeoutMillis": 1000
}
```
- `<amp-ad>`: Required. IX `<amp-ad>` tags require the `width`, `height`, and `type="doubleclick"` parameters.</br> 
**Note**: IX leverages AMP through Google Ad Manager (GAM, formerly DoubleClick for Publishers).
- `data-slot`: Required. Data attributes to serve ads.
- `rtc-config`: JSON configuration data which handles the communication with AMP RTC.
   - `vendors` : Required object. The key is `IndexExchange` and the value is the `SITE_ID`.</br>
**Note:** Refer to the materials provided by your account team for your specific SITE_ID details. We recommend one SITE_ID per domain, per unique slot and size. To use more than one SITE_ID, contact your IX Representative.
   - `timeoutMillis`: Optional integer. Defines the timeout in milliseconds for each individual RTC callout. The configured timeout must be greater than 0 and less than 1000ms. If omitted, the timeout value defaults to 1000ms.

Additional parameters including JSON are passed through in the resulting call to GAM. For details refer to the [Google Ad Manager documentation](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ad-network-doubleclick-impl/amp-ad-network-doubleclick-impl-internal.md).

To learn about the required Google Ad Manager (GAM) configuration, refer to [Index Exchange Knowledge Base](https://kb.indexexchange.com/Mobile/AMP_Integration.htm).


