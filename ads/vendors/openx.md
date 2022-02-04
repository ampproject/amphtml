# OpenX

## Examples

-   All OpenX `<amp-ad>` tags require the `width`, `height`, and `type="openx"` parameters.
-   Secure tags (HTTPS) are required for AMP.

### OpenX Ad Server

Display an OpenX Ad Unit.

**Required**:

-   `data-auid` - The ad unit ID to display
-   `data-host` - SSL-enabled OpenX delivery domain

**Optional**:

-   `json` - Additional json options.

    -   `customVars` - please refer to the [documentation](https://docs.openx.com/Content/developers/ad_request_api/custom_variables_in_ad_calls.html).

```html
<amp-ad
  width="728"
  height="90"
  type="openx"
  data-host="domain.openx.net"
  data-auid="12345"
  json='{"dfp":{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1},"openx":{"customVars":{"marco":"polo","fates":["clothos","lachesis","atropos"]}}}'
>
</amp-ad>
```

### OpenX Bidder

OpenX header bidding. Parameters noted in the DoubleClick amp-ad [documentation](https://github.com/ampproject/amphtml/blob/main/ads/google/doubleclick.md) can be forwarded to DoubleClick by the following rules:

1. Parameters like `data-dfp-{name}` will be converted to `data-{name}` and passed to DoubleClick
2. Everything under the json "dfp" key will be passed to DoubleClick

**Required**:

-   `data-host` - SSL-enabled OpenX delivery domain
-   `data-nc` - Network code '-' sitename
-   `data-auid` - Open X Ad unit id to display
-   `data-dfp-slot` - The DoubleClick slot

**Optional**:

-   `json` - Additional json options.

    -   `customVars` - please refer to the [documentation](https://docs.openx.com/Content/developers/ad_request_api/custom_variables_in_ad_calls.html). Also note that OpenX bidder limits these keys by the **allowlisted keys** set on your publisher settings.

```html
<amp-ad
  width="728"
  height="90"
  type="openx"
  data-host="domain.openx.net"
  data-auid="12345"
  data-nc="56789-MySite"
  data-dfp-slot="/12345/dfp_zone"
  json='{"dfp":{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1},"openx":{"customVars":{"marco":"polo","fates":["clothos","lachesis","atropos"]}}}'
>
</amp-ad>
```

### DoubleClick Fallback

If no OpenX parameters are detected, the tag falls back to a proxy for the DoubleClick ad type. The same rules for
parameter conversion apply here as for bidder.

**Required**:

-   `data-dfp-slot` - The DoubleClick slot

**Optional**:

-   `json` - Additional json options. Only the "dfp" is currently respected.

```html
<amp-ad
  width="728"
  height="90"
  type="openx"
  data-dfp-slot="12345/dfp_zone"
  json='{"dfp":{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1}}'
>
</amp-ad>
```
