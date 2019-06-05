# AMPHTML Ad Implementation Guide for RTB Ad Exchanges
---
## Objective

This guide is designed to provide additional information for SSPs and Ad Exchanges that want to support AMPHTML ads in a Real-Time Bidding (RTB) environment.  The IAB's OpenRTB 2.5 spec is [here](http://www.iab.com/wp-content/uploads/2016/03/OpenRTB-API-Specification-Version-2-5-FINAL.pdf).

AMP pages must ensure all content conforms to the AMP format. When non-AMP content is included in an AMP page, there can be a delay as the content is verified. A major benefit for AMPHTML ads on AMP pages is that the ad can be rendered early by splicing the ad into the surrounding AMP page, without affecting the UX of the page and without delay.

For those new to AMPHTML ads, see the background docs at the bottom of this article.

## AMPHTML Ads in RTB: High-Level Approach

### RTB Bid Request

Exchanges will need to indicate in the RTB bid request whether a page is built in AMP, and any specific requirements or treatment of AMPHTML ads.  As of [OpenRTB 2.5](http://www.iab.com/wp-content/uploads/2016/03/OpenRTB-API-Specification-Version-2-5-FINAL.pdf), this is not yet included in the spec, but the proposed implementation to the IAB committee is as follows.

**`Site` Object additional field: `amp`**

A new field is added to the `Site` object of the OpenRTB standard to indicate whether a webpage is built on AMP.  In OpenRTB 2.5, this is section 3.2.13.

| Field         | Scope     | Type      | Default       | Description           |
| ------------- |------     |-----      |:-------------:|-------------          |
| `amp`         | optional  | integer   | -             | Whether the request is for an Accelerated Mobile Page. 0 = page is non-AMP, 1 = page is built with AMP HTML.  AMP status unknown if omitted. |

**`Imp` Object additional field: `ampad`**

A new field is added to the `Imp` object of the OpenRTB standard to provide more detail around AMP ad requirements and how AMP ads will load.  In OpenRTB 2.5, this is section 3.2.4.

| Field         | Scope     | Type      | Default       | Description           |
| ------------- |------     |-----      |:-------------:|-------------          |
| `ampad`       | optional  | integer   | 1             | AMPHTML ad requirements and rendering behavior.  See AMPHTML Ad Status Table. |

**AMPHTML Ad Status Table**

| Value        | Description            |
| ------------- |-------------          |
| 1         | AMPHTML ad requirements are unknown.|
| 2         | AMPHTML ads are not allowed.                |  
| 3         | Either AMPHTML or non-AMPHTML ads are allowed; AMPHTML ads are not early rendered. |
| 4         | Either AMPHTML or non-AMPHTML ads are allowed, and AMPHTML ads are early rendered.|
| 5         | AMPHTML ads are required.  Ads that are non-AMPHTML may be rejected by the publisher.|
| 500+      | Exchange-specific values; should be communicated to bidders *a priori*         |

### RTB Bid Response

SSPs will need to provide a new field in the bid response to allow bidders to return AMPHTML content, and RTB bidders will need to populate that field in order to return AMPHTML ads.  As of [OpenRTB 2.5](http://www.iab.com/wp-content/uploads/2016/03/OpenRTB-API-Specification-Version-2-5-FINAL.pdf), this is not yet included in the spec, but the proposed workflow is a new field that accepts a URL pointing to AMP ad content.  

**`Bid` Object additional field: `ampadurl`**

| Field         | Type     | Description        |
| ------------- |------     |-----              |
| `ampadurl`       | string  | Optional means of conveying AMPHTML ad markup in case the bid wins; only one of `ampadurl` or `adm` should be set. Substitution macros (Section 4.4) may be included.  URL should point to a creative server containing valid AMP Ad html.           |  

### Verification of valid AMP

* For AMPHTML ads to be rendered early, the exchange is required to verify and sign in real time that the ad is written in amp4ads  `<html amp4ads>` creative format.
* See "[Proposed Design](https://github.com/ampproject/amphtml/issues/3133)" for signing.
* Ads that are valid AMPHTML ads will be allowed to render early by AMP pages.  Ads that are not verified as valid AMPHTML ads  will render at the same speed as non-AMPHTML ads.
* Only AMPHTML ads should be returned in the `ampadurl`.

### Server-side fetch

* For AMPHTML ads to be rendered early, AMPHTML ad content must be fetched with 0 additional "hops" from the client.  This is designed to avoid poor user experiences due to ad latency and extra client-side calls.
* The exchange's servers (not the client browser) will request the AMPHTML ad content located at the URL provided in `ampadurl`  after a bidder wins the auction.
* Creative servers must respond and return content within some reasonable SLA, recommended at 150ms.
* The AMPHTML ad will be injected into the adslot and subsequently rendered.  Note that since a valid AMPHTML ad cannot contain an iframe or another ad tag, the server-side fetch must retrieve the actual HTML of the creative.

### Impression Tracking and Billing URLs

* RTB buyers often include impression trackers as a structured field in the bid response (for example `Bid.burl`, the "billing notice URL" in OpenRTB 2.5).
* It is up to the exchange or publisher ad server to determine how these URLs are fired, but <code><[amp-pixel](https://www.ampproject.org/docs/reference/components/amp-pixel)></code> and <code><[amp-analytics](https://www.ampproject.org/docs/reference/components/amp-analytics)></code> can handle most impression tracking and analytics use cases.

## Background Docs
* [AMPHTML Ads for AMP Pages (Github)](https://github.com/ampproject/amphtml/issues/3133)
* [AMPHTML Ad Creative Format Spec (Github)](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md)
* [AMPHTML Ads Overview (Github)](https://github.com/ampproject/amphtml/blob/master/ads/google/a4a/docs/a4a-readme.md)
* [AMPHTML Ads Website from amp.dev](https://amp.dev/community/platform-and-vendor-partners)
* [Example AMPHTML Ads](https://amp.dev/documentation/examples/)
* [Speed comparison](https://amp.dev/documentation/examples/advertising-analytics/amphtml_ads_vs_non_amp_ads/?format=websites): see how fast an AMP Ad loads in comparison to a regular ad. Best viewed on a 3G connection.
* [Discussion in OpenRTB Dev Forum](https://groups.google.com/forum/#!topic/openrtb-dev/0wyPsF5D07Q): RTB Specific Proposal
