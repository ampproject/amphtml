# AMP Real Time Config with Google Ad Manager

## Introduction

This implementation guide is intended for publishers who wish to use Real Time Config with Google Ad Manager Fast Fetch in AMP. Any publishers using remote.html with Google Ad Manager will need to implement this, as Delayed Fetch (and therefore remote.html support) will be deprecated March 29, 2018. See [Intent to Implement: Delayed Fetch Deprecation.](https://github.com/ampproject/amphtml/issues/11834)

## Background

For full details and background, please refer to the [RTC Documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-documentation.md) and the generic [RTC Publisher Implementation Guide](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-publisher-implementation-guide.md). This guide is intended to highlight some of the details of Google Ad Manager's implementation of RTC.

AMP Real Time Config (RTC) is a feature of Fast Fetch that allows Publishers to augment ad requests with targeting information that is retrieved at runtime. This dynamic targeting data can be applied in addition to any existing statically-defined data on each amp-ad element. RTC allows 5 callouts to targeting servers for each individual ad slot, the results of which can be added to the ad request. To use RTC with Google Ad Manager, you must simply setup the rtc-config on each amp-ad element.

## Setting Up RTC-Config

For instructions on how to set the rtc-config attribute on the amp-ad, refer to [Setting Up RTC-Config](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-publisher-implementation-guide.md#setting-up-rtc-config) in the Publisher Implementation Guide.

## Available URL Macros

Google Ad Manager's RTC implementation has made many macros available for RTC url expansion. Please note that the time to expand the URL is counted against the RTC timeout. Additionally, note that all RTC URLs are truncated at 16384 characters, so keep possible truncation in mind when determining which macros to include, and which order to include them in your URL. Currently available macros are as follows:

-   **PAGEVIEWID** - pageViewId
-   **PAGEVIEWID_64** - pageViewId64
-   **HREF** - equivalent to window.context.location.href
-   **REFERRER** - Referrer URL
-   **ATTR(height)** - Height attribute of the amp-ad element
-   **ATTR(width)** - Width attribute of the amp-ad element
-   **ATTR(data-slot)** - data-slot attribute of the amp-ad element
-   **ATTR(data-multi-size)** - data-multi-size attribute of the amp-ad element
-   **ATTR(data-multi-size-validation)** - data-multi-size-validation attribute of the amp-ad element
-   **ATTR(data-override-width)** - data-override-width attribute of the amp-ad element
-   **ATTR(data-override-height)** - data-override-height attribute of the amp-ad element
-   **ATTR(json)** - json attribute of the amp-ad element
-   **ELEMENT_POS** - Offset of the element from document's top
-   **SCROLL_TOP** - Number of pixels that the user scrolled from the document's top
-   **PAGE_HEIGHT** - Height of the amp-doc
-   **BKG_STATE** - Current visibility state of the amp-doc
-   **ADCID** - adClientId
-   **TGT** - Just the targeting piece of json
-   **CANONICAL_URL** - The canonical URL of the page

-   **TIMEOUT** - The publisher-specified timeout for the RTC callout.

## Response and Endpoint Specification

To use their own first-party data, publishers will need to build a RTC-compatible endpoint that returns this targeting data. For those only retrieving data from 3rd-party vendors, this section is not applicable.

The requirements for an RTC endpoint to be used with Google Ad Manager are the same as what is specified in the Publisher Implementation Guide. In summary:

The RTC Response to a GET must meet the following requirements:

-   Status Code = 200
-   See [here for Required Headers](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-cors-requests.md#ensuring-secure-responses) and note that Access-Control-Allow-Credentials: true must be present for cookies to be included in the request.
-   Body of response is a JSON object of targeting information such as:
    -   **<code>{"targeting": {"sport":["rugby","cricket"]}}</code>**</strong>
    -   The response body must be JSON, but the actual structure of that data need not match the structure here. Refer to Fast Fetch Network specific documentation for the required spec. (for example, if using Google Ad Manager, refer to Google Ad Manager docs).

The body of the response must meet the following specification:

<table>
  <tr>
   <td><code>{"<strong>targeting</strong>": {"key1": "value1",
             "key2": "value2"},
<strong>categoryExclusions</strong>: ['cat1', 'cat2', 'cat3']} </code>
   </td>
  </tr>
  <tr>
   <td><strong>Example of RTC Response format</strong>
   </td>
  </tr>
</table>

-   "targeting"
    -   Optional parameter
    -   Value is an object of key/value pairs to use for targeting in DFP
-   "categoryExclusions"
    -   Optional parameter
    -   Value is an array of categories to use for category exclusions in DFP

The RTC responses will be merged with whatever JSON targeting is specified on the amp-ad element.

## Merging RTC targeting data and categoryExclusions into Ad Requests

The results of the RTC callouts will be merged with any existing, static JSON targeting on the amp-ad element, and then sent on the **scp** parameter of the DFP ad request.

### Merging targeting data for custom URLs

For data coming from a custom URL endpoint (typically 1st-party data), the "targeting" values from RTC callous and existing static targeting will be deep-merged.

Keys for targeting data should be named differently to avoid collision. In case of a collision of key names, the last one wins (i.e. if two URLs return \*\*<code>{"targeting": {"foo":"bar"}}</code></strong> and <strong><code>{"targeting": {"foo": "baz"}}</code></strong>, there is a collision on the key 'foo', and the data sent on the subsequent request is <strong><code>{"targeting": {"foo": "baz"}}</code></strong>.

For example, take the following amp-ad:

```html
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  rtc-config='{"urls": ["https://rtcEndpoint.biz/"}'
  json='{
          "targeting":{"loc": "usa", "animal": "cat"},
          "categoryExclusions":["sports", "food", "fun"]
        }'
>
</amp-ad>
```

And let the response from the callout to `https://rtcEndpoint.biz/` be:

```json
{"targeting": {"animal": "dog"}}
```

The results will be merged with the value set on the amp-ad element, and the result will be:

```json
{"targeting": {"loc": "usa", "animal": "dog"}}
```

_Note: the ordering of items is not guaranteed._

This resulting object will then be sent on the **scp** parameter of the ad request, as

```http
https://securepubads.g.doubleclick.net/gampad/ads?.....&scp=loc%3Dusa%26animal%3Ddog%26excl_cat%3Dsports,food,fun…...
```

### Merging targeting data for Vendors

To prevent malicious vendors from naming the keys in their RTC response to match other vendors (and thereby overwrite them), key names from all vendor RTC responses are automatically appended with the vendor's name as defined in callout-vendors.js. Note that this is only done to responses from vendors, not responses from custom URLs. This may optionally be turned off via vendor configuration in callout-vendors.js.

For instance, take this example where we call out to vendors, VendorA and VendorB:

```html
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  rtc-config='{"vendors": {"vendorA": {}, "vendorB": {}}'
  json='{"targeting":{"abc":"123"}'
>
</amp-ad>
```

Let the response from VendorA be:

```json
{"targeting": {"abc": "456"}}
```

And let the response from VendorB be:

```json
{"targeting": {"abc": "FOO"}}
```

The Google Ad Manager Fast Fetch implementation automatically converts both of these responses to:

Rewritten VendorA Response

```json
{"targeting": {"abc_vendorA": "456"}}
```

Rewritten VendorB Response

```json
{"targeting": {"abc_vendorB": "FOO"}}
```

Thus, when the merging happens, the final object is:

```json
{"targeting": {"abc": "123", "abc_vendorA": "456", "abc_vendorB": "FOO"}}
```

To disable key appending, within callout-vendors.js set the option `disableKeyAppend: true` as seen in the following example:

```js
export const RTC_VENDORS = {
 ...
 ...
    'fakeVendor': {
      url: 'https://fakeVendor.biz/slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
      macros: ['SLOT_ID', 'PAGE_ID', 'FOO_ID'],
      disableKeyAppend: true,
    },
 ...
 ...
};
```

### Merging categoryExclusions

Any values for categoryExclusions returned by the RTC callouts (either from custom URLs or Vendors) will be concatenated together, along with existing static values, into one array with no duplicates.

For example, take the following amp-ad:

```html
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  rtc-config='{
                "vendors": {"vendorA": {}},
                "urls": ["https://rtcEndpoint.biz/"]
              }'
  json='{"categoryExclusions":["sports", "food", "fun"]}'
>
</amp-ad>
```

Let the response from the callout to `https://rtcEndpoint.biz/` be:

```json
{"categoryExclusions": ["health", "sports"]}
```

Let the response from VendorA be:

```json
{"categoryExclusions": ["abc", "fun"]}
```

The results will be merged with the value set on the amp-ad element, and the result will be:

```json
{"categoryExclusions": ["abc", "health", "sports", "food", "fun"]}
```

_Note: the ordering of items is not guaranteed._

This resulting object will then be sent on the **scp** parameter of the ad request, as

```http
https://securepubads.g.doubleclick.net/gampad/ads?.....&scp=excl_cat%3Dabc,health,sports,food,fun…...
```

### Merging RTC Responses from Vendors and Custom URLs

The RTC responses from vendors and custom URLs are ultimately all merged together (after the vendor responses have the vendor name appended on each targeting key as specified above).

For example, take the following amp-ad:

```html
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  rtc-config='{
                "vendors": {"vendorA": {}},
                "urls": ["https://rtcEndpoint.biz/"]
              }'
  json='{"targeting":{"loc": "usa"}, "categoryExclusions":["sports"]}'
>
</amp-ad>
```

Let the response from the callout to `https://rtcEndpoint.biz/` be:

```json
{"targeting": {"gender": "f"}, "categoryExclusions": ["dating"]}
```

Let the response from VendorA be:

```json
{"targeting": {"r": "h"}, "categoryExclusions": ["autos"]}
```

The results will be merged with the value set on the amp-ad element, and the result will be:

```json
{
  "targeting": {"loc": "usa", "gender": "f", "r": "h"},
  "categoryExclusions": ["sports", "dating", "autos"]
}
```

_Note: the ordering of items is not guaranteed._

This resulting object will then be sent on the **scp** parameter of the ad request, as

```http
https://securepubads.g.doubleclick.net/...scp=loc%3Dusa%26gender%3Df%26r%3Dh%26excl_cat%3Dsports%2Cdating%2Cautos&...
```

## Using RTC In DFP

The results of the RTC Callouts will be added to the Google Ad Manager Ad Request, allowing you to use the key/value pairs in DFP as you would for any other non-AMP ad request. Please refer to generic key/value targeting documentation for Google Ad Manager.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to Google Ad Manager</a>
