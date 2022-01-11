# SRA: Single Request Architecture

Enabling SRA allows a publisher to make a single request for all ad slots on the AMP page which gives a publisher the ability to do roadblocking and competitive exclusions. This very similar to the behavior achieved on non-AMP pages when using [this](https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest) method in GPT.

In order to use this feature, add the following meta tag to the head of the AMP page:
`<meta name="amp-ad-doubleclick-sra"/>`

Note that SRA is only available if:

1. The AMP page is served from a valid AMP cache, and
2. The publisher does not use [`remote.html`](https://github.com/ampproject/amphtml/blob/main/ads/README.md#1st-party-cookies).

Note also that <a href="refresh.md">Refresh</a> is not compatible with SRA. If both SRA and Refresh are enabled on the same slot, Refresh will be disabled in favor of SRA.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to Google Ad Manager</a>
