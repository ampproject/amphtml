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

<<<<<<< HEAD
# DoubleClick

=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
### <a name="amp-ad-network-doubleclick-impl"></a> `amp-ad-network-doubleclick-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
<<<<<<< HEAD
    <td>DoubleClick implementation of the AMP Ad tag.  Click <a href="/extensions/amp-a4a/amp-a4a-internal.md">here</a>
    for Fast Fetch details, and <a href="/extensions/amp-a4a/amp-a4a-format.md">here</a>
    for AMPHTML ad format details. This tag should
=======
    <td>DoubleClick implementation of AMP Ad tag which requests early by XHR and
    renders natively within the page if a valid AMP Ad is returned.  Should
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    not be directly referenced by pages and instead is dynamically loaded
    via the amp-ad tag.  However, in order to remove an async script load
    of this library, publishers can include its script declaration.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
<<<<<<< HEAD
    <td>Launched</td>
=======
    <td>In Development</td>
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
<<<<<<< HEAD
    <td><a href="#examples">See Example Section</a></td>
  </tr>
</table>

### Supported Features

<table>
  <tr>
    <td><strong>Feature</strong></td>
    <td><strong>Description</strong></td>
    <td><strong>Status</strong></td>
  </tr>
  <tr>
    <td><a href="multi-size.md">Multi-size</a></td>
    <td>Allows slots to specify multiple sizes.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="fluid.md">Fluid</a></td>
    <td>Fluid slots do not require a pre-specified size, but will instead fill up the width of their parent container and adjust their height accordingly.</td>
    <td>Beta</td>
  </tr>
  <tr>
    <td><a href="doubleclick-rtc.md">Real Time Config</a></td>
    <td>Allows Publishers to augment ad requests with targeting information that is retrieved at runtime.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="render-on-idle.md">Render on Idle</a></td>
    <td>Allows slots 3-12 viewports down to render while the AMP scheduler is idle.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="refresh.md">Refresh</a></td>
    <td>Enabled slots will periodically refetch new creatives.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="safeframe.md">Safeframe API</a></td>
    <td>An API-enabled Iframe for facilitating communication between publisher page and creative content.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="sra.md">SRA: Single Request Architecture</a></td>
    <td>When enabled, all eligible slots on the page will be serviced by a single ad request.</td>
    <td>Beta</td>
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
### Configuration

For semantics of configuration, please see [ad network documentation](https://developers.google.com/doubleclick-gpt/reference).


#### Ad size

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag. In order to explicitly request different ad dimensions from those values, pass the attributes `data-override-width` and `data-override-height` to the ad.

Example:

```html
<amp-ad width=320 height=50
    data-override-width=111
    data-override-height=222
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner">
</amp-ad>
```

For multi-size attributes, see the <a href="multi-size.md">multi-size documentation page</a>.

### Supported parameters

- `data-slot`: Full path of the ad unit with the network code and unit code.
- `data-multi-size`: See the <a href="multi-size.md">multi-size documentation page</a> for details.
- `data-multi-size-validation`

Supported via `json` attribute:

- `categoryExclusions`: Sets a slot-level category exclusion for the given label name.
- `cookieOptions`: Sets options for ignoring DFP cookies on the current page.
  - 0: Enables DFP cookies on ad requests on the page. This option is set by default.
  - 1: Ignores DFP cookies on subsequent ad requests and prevents cookies from being created on the page.
- `tagForChildDirectedTreatment`: Configures whether the slot should be treated as child-directed.
See the TFCD article for <a href="https://support.google.com/dfp_sb/answer/3721907">Small Business</a> or <a href="https://support.google.com/dfp_premium/answer/3671211">Premium</a> for more details and allowed values.
- `targeting`: Sets a custom targeting parameter for this slot. Values must of the form:
  - `"<key_string>":"<value_string>"` or
  - `"<key_string>":["<value1>", "<value2>", ...]`. See below for example.

Example with json attribute: 

```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner"
    json='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1}'>
</amp-ad>
```

### Supported DFP Formats
- Anchor Ads / Adhesion Units may be implemented using <a href="../../extensions/amp-ad-sticky-ad/amp-sticky-ad.md">amp-sticky-ads</a>.
- Expandable formats can now leverage the <a href="safeframe.md">Safeframe API</a>.

### Unsupported DFP Formats
- Interstitials
- Flash
- Creatives served over HTTP.
=======
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

### Render on idle
Slots not marked with data-loading-strategy attribute that are more than 3 viewports but less than 12 from current location are allowed to render when the AMP scheduler
is idle.  The result is an increase in impressions with a much smaller increase in
viewable impressions and clicks.  Publishers sensitive to viewability rate should
set data-loading-strategy=3 to keep the current viewport offset and disable idle render.  Publishers using data-loading-strategy=prefer-viewability-over-views will
use current 1.25 viewport offset with idle render disabled.

### AMP Ad Refresh

AMP Ad Refresh permits amp-ad tags using Fast Fetch to undergo periodic refresh events. Each such event re-issues a new ad request and attempts to display the returned creative.

#### Network-level Configuration

For a network to make use of Refresh, its corresponding implementation must create an instance of RefreshManager and call
`initiateRefreshCycle`. The simplest way to do so is to use the exported `getRefreshManager` function from refresh-manager.js:

```javascript
import {getRefreshManager} from '../../amp-a4a/0.1/refresh-manager';

// ...

const refreshManager = getRefreshManager(this);
refreshManager.initiateRefreshCycle();
```

While `getRefreshManager` is convenient, it does not allow for customization. It returns a RefreshManager with default configurations (specified in the table below). To customize the RefreshManager, you must invoke its constructor directly:

```javascript
import {
  getRefreshManager,
  getPublisherSpecifiedRefreshInterval,
} from '../../amp-a4a/0.1/refresh-manager';

// ...

const refreshConfig = { /* see table below for configuration parameters */ };
const refreshInterval = getPublisherSpecifiedRefreshInterval(this.element, this.win);
const refreshManager = new RefreshManager(this, refreshConfig, refreshInterval);
refreshManager.initiateRefreshCycle();
```

Optionally, a network may override AmpA4a's `refresh` method, which would allow it to insert custom logic in between refresh events. Note: RefreshManager passes a callback to `refresh` which must be invoked in order to reset the cycle; if it is not invoked, the RefreshManager will become idle until either the callback or `initiateRefreshCycle` is called. If `refresh` is not overridden, this is handled automatically by AmpA4a.

<table>
  <tr>
    <td>Parameter</td>
    <td>Description</td>
    <td>Permitted Values</td>
    <td>Default Value</td>
  <tr>
    <td>visiblePercentageMin</td>
    <td>The minimum ratio of creative pixels that must be on screen before the refresh timer is started.</td>
    <td>Must be an integer between 0 and 100, inclusive.</td>
    <td>50%</td>
  </tr>
  <tr>
    <td>continuousTimeMin</td>
    <td>The amount of continuous time, in seconds, that the creative must be on screen before the refresh timer is started.</td>
    <td>Any positive numerical value.</td>
    <td>1 s</td>
  </tr>
</table>

#### Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-refresh" content="network1=refresh_interval1,network2=refresh_interval2,...">`

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


### SRA: Single Request Architecture (beta)
Enabling SRA allows a publisher to make a single request for all ad slots on the AMP page which gives a publisher the ability to do roadblocking and competitive exclusions. This very similar to the behavior achieved on non-AMP pages when using [this](https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest) method in GPT.

In order to use this feature, add the following meta tag to the head of the AMP page:
`<meta name=”amp-ad-doubleclick-sra”/>`

Note that SRA is not available in the following cases:
1. If the AMP page is not served from a valid AMP cache
2. If publishers use [`remote.html`](https://github.com/ampproject/amphtml/blob/master/ads/README.md#1st-party-cookies)
3. The ad refresh feature is incompatible with SRA
4. Publishers don't use the amp-ad attribute [`useSameDomainRenderingUntilDeprecated`](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md#temporary-use-of-usesamedomainrenderinguntildeprecated)

### Fluid (beta)
A fluid ad slot does not require a publisher to specify its size. Instead, the publisher may simply declare an ad slot with the attributes `layout="fluid" height="fluid"`, and a creative of indeterminate size will be returned. The actual size of the slot will be determined by the given creative at render time. It will always occupy the maximum available width, and its height will be determined relative to that width. One benefit of this feature is that, like multi-size, it increases monetization potential by increasing the available pool of creatives that may be rendered in a particular slot. Moreover, this feature relieves the publisher of having to worry about determining what size a slot should use.

Note that due to AMP's no reflow policy, the fluid creative will not be rendered when the slot is within the viewport and it is therefore recommended that fluid be used for below the fold slots.

An example slot might look like:

```html
<amp-ad
    type="doubleclick"
    data-slot="/6355419/Travel"
    layout="fluid"
    height="fluid">
</amp-ad>
```

Note also that the width attribute is optional, and can be specified. When specified, the fluid creative will always occupy that width (unless used in conjunction with multi-size). Further, fluid creatives are fully compatible with multi-size creatives. When both features are turned on, either a fluid creative, or one matching one of the specified multi-size sizes may be given.
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
