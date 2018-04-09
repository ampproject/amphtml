<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# SRA: Single Request Architecture

Enabling SRA allows a publisher to make a single request for all ad slots on the AMP page which gives a publisher the ability to do roadblocking and competitive exclusions. This very similar to the behavior achieved on non-AMP pages when using [this](https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest) method in GPT.

In order to use this feature, add the following meta tag to the head of the AMP page:
`<meta name=”amp-ad-doubleclick-sra”/>`

Note that SRA is only available in the following cases:
1. The AMP page is served from a valid AMP cache
2. The publisher does not use [`remote.html`](https://github.com/ampproject/amphtml/blob/master/ads/README.md#1st-party-cookies)
3. The publisher uses the amp-ad attribute [`useSameDomainRenderingUntilDeprecated`](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md#temporary-use-of-usesamedomainrenderinguntildeprecated)

Note also that <a href="refresh.md">Refresh</a> is not compatible with SRA. If both SRA and Refresh are enabled on the same slot, Refresh will be disabled in favor of SRA.


#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
