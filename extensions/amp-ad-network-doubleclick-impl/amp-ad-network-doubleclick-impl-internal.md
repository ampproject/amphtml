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

### <a name="amp-ad-network-doubleclick-impl"></a> `amp-ad-network-doubleclick-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>DoubleClick implementation of AMP Ad tag which requests early by XHR and
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
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TBD</td>
  </tr>
</table>

#### Examples
Example - DoubleClick Ad
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel">
</amp-ad>
```

Example - DoubleClick Ad with Multi-size Request
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-multi-size="700x90,700x60,500x60">
</amp-ad>
```

Example - DoubleClick Ad with Multi-size Request Ignoring Size Validation
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-multi-size="300x25"
    data-multi-size-validation="false">
</amp-ad>
```

#### Attributes
Below the term `primary size` refers to the width and height pair specified by the `width` and `height` attributes of the tag.
- `data-multi-size` A string of comma separated sizes, which if present, forces the tag to request an ad with all of the given sizes, including the primary size. Each individual size must be a number (the width) followed by a lowercase 'x' followed by a number (the height). Each dimension specified this way must not be larger than its counterpart in the primary size. Further, each dimension must be no less than 2/3rds of the corresponding primary dimension, unless `data-mutli-size-validation` is set to false.
- `data-multi-size-validation` If set to false, this will allow secondary sizes (those specified in the `data-multi-size` attribute) to be less than 2/3rds of the corresponding primary size. By default this is assumed to be true.

### AMP Ad Refresh (alpha)

AMP Ad Refresh permits amp-ad tags using Fast Fetch to undergo periodic refresh events. Each such event re-issues a new ad request and attempts to display the returned creative.

#### Network-level Configuration

Networks wishing to opt-in to this feature must add a refresh configuration object to `refreshConfigs` in ads/_a4a-config.js. The configuration must specify the following parameters:

<table>
  <tr>
    <td>Parameter</td>
    <td>Description</td>
    <td>Permitted Values</td>
  <tr>
    <td>visiblePercentageMin</td>
    <td>The minimum ratio of creative pixels that must be on screen before the refresh timer is started.</td>
    <td>Must be an integer between 0 and 100, inclusive.</td>
  </tr>
  <tr>
    <td>continuousTimeMin</td>
    <td>The amount of continuous time, in seconds, that the creative must be on screen before the refresh timer is started.</td>
    <td>Any positive numerical value.</td>
  </tr>
</table>

For convenience, ada/_a4a-config.js contains a default configuration object.

#### Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-refresh" content=”network1=refresh_interval1,network2=refresh_interval2,...">`

Where `refresh_interval` is the time, in seconds, in between refresh cycles. This value must be numeric and no less than 30. Individual slots may be opted-out of refresh by adding `data-enable-refresh=false` to the slot.

#### Slot-level Configuration

An individual slot is eligible to be refreshed if it is configured as:

```
<amp-ad 
 ...
 data-enable-refresh=refresh_interval>
```
If `refresh_interval` is set to false, then this slot will not be refresh-enabled, even if page-level configurations are set.

#### SRA Compatibility

Refresh is currently not supported for SRA enabled slots. If a slot is enabled for both, refresh will be disabled, and an error will be logged to the user's console.

#### AMP Ad Container Compatibility

The only AMP ad containers in which refresh is currently supported are amp-sticky-ad and amp-carousel container types.


### SRA: Single Request Architecture (alpha)
Enabling SRA allows a publisher to make a single request for all ad slots on the AMP page which gives a publisher the ability to do roadblocking and competitive exclusions. This very similar to the behavior achieved on non-AMP pages when using [this](https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest) method in GPT.

In order to use this feature, add the following meta tag to the head of the AMP page:
`<meta name=”amp-ad-doubleclick-sra”/>`

Note that SRA is not available in the following cases:
1. If the AMP page is not served from a valid AMP cache 
2. If publishers use [`remote.html`](https://github.com/ampproject/amphtml/blob/master/ads/README.md#1st-party-cookies)
3. The ad refresh feature is incompatible with SRA
4. Publishers don't use the amp-ad attribute [`useSameDomainRenderingUntilDeprecated`](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md#temporary-use-of-usesamedomainrenderinguntildeprecated)
