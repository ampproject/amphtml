# Google Ad Manager

### <a name="amp-ad-network-doubleclick-impl"></a> `amp-ad-network-doubleclick-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Google Ad Manager implementation of the AMP Ad tag.  Click <a href="https://github.com/ampproject/amphtml/blob/main/ads/google/a4a/docs/Network-Impl-Guide.md">here</a>
    for Fast Fetch details, and <a href="https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/amp-a4a-format.md">here</a>
    for AMPHTML ad format details. This tag should
    not be directly referenced by pages and instead is dynamically loaded
    via the amp-ad tag.  However, in order to remove an async script load
    of this library, publishers can include its script declaration.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Launched</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
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
    <td>Launched</td>
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
    <td><a href="lazy-fetch.md">Lazy Fetch</a></td>
    <td>Allows for delaying ad request until slot is within a configurable distance from the viewport.</td>
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
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="single-page-ad.md">Single Page Ads</a></td>
    <td>Ads that appear within an AMP story, the new ad format for visual storytelling.</td>
    <td>Launched</td>
  <tr>
    <td><a href="amp-consent.md">AMP Consent Integration</a></td>
    <td>Integration with AMP Consent extension.</td>
    <td>Launched</td>
  </tr>
  <tr>
    <td><a href="always-serve-npa.md">Always Serve NPA</a></td>
    <td>Utilizes <code>&lt;amp-geo></code> to detect user's geo location to decide if a non-personalized ad should be requested regardless of user consent.</td>
    <td>Beta</td>
  </tr>
</table>

#### Examples

Example - Google Ad Manager Ad

```html
<amp-ad width="728" height="90" type="doubleclick" data-slot="/6355419/Travel">
</amp-ad>
```

### Configuration

For semantics of configuration, please see [ad network documentation](https://developers.google.com/doubleclick-gpt/reference).

#### Ad size

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag. In order to explicitly request different ad dimensions from those values, pass the attributes `data-override-width` and `data-override-height` to the ad.

Example:

```html
<amp-ad
  width="320"
  height="50"
  data-override-width="111"
  data-override-height="222"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
>
</amp-ad>
```

For multi-size attributes, see the <a href="multi-size.md">multi-size documentation page</a>.

### Supported parameters

-   `data-slot`: Full path of the ad unit with the network code and unit code.
-   `data-multi-size`: See the <a href="multi-size.md">multi-size documentation page</a> for details.
-   `data-multi-size-validation`

Supported via `json` attribute:

-   `categoryExclusions`: Sets a slot-level category exclusion for the given label name.
-   `cookieOptions`: Sets options for ignoring DFP cookies on the current page.
    -   0: Enables DFP cookies on ad requests on the page. This option is set by default.
    -   1: Ignores DFP cookies on subsequent ad requests and prevents cookies from being created on the page.
-   `tagForChildDirectedTreatment`: Configures whether the slot should be treated as child-directed.
    See the TFCD article for <a href="https://support.google.com/dfp_sb/answer/3721907">Small Business</a> or <a href="https://support.google.com/dfp_premium/answer/3671211">Premium</a> for more details and allowed values.
-   `tagForUnderAgeTreatment`: Configures whether the slot should be treated as under-age of consent.
    See <a href="https://support.google.com/dfp_sb/answer/9004919">This article</a> for more details on this and the TFCD signal.
-   `targeting`: Sets a custom targeting parameter for this slot. Values must of the form:
    -   `"<key_string>":"<value_string>"` or
    -   `"<key_string>":["<value1>", "<value2>", ...]`. See below for example.
-   `ppid`: Sets a custom provided user ID for targeting. Do not set when
    serving responses to crawlers since this value is expected to be dynamic.

Example with json attribute:

```html
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  json='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1}'
>
</amp-ad>
```

### Supported DFP Formats

-   Anchor Ads / Adhesion Units may be implemented using <a href="../../extensions/amp-sticky-ad/amp-sticky-ad.md">amp-sticky-ads</a>.
-   Expandable formats can now leverage the <a href="safeframe.md">Safeframe API</a>.

### Unsupported DFP Formats

-   Interstitials
-   Flash
-   Creatives served over HTTP.
