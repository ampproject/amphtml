# UAS

## Examples

### Basic

```html
<amp-ad
  width="728"
  height="90"
  type="uas"
  json='{"accId": "132109", "adUnit": "10002912", "sizes": [[728, 90]]}'
>
</amp-ad>
```

### Multi-size Ad

```html
<amp-ad
  width="728"
  height="90"
  type="uas"
  json='{"accId": "132109", "adUnit": "10002912", "sizes": [[728, 90], [700, 90], [700, 60]]}'
>
</amp-ad>
```

Note that the `width` and `height` mentioned should be maximum of the width-hight combinations mentioned in `json.sizes`.

### Targetings

```html
<amp-ad
  width="728"
  height="90"
  type="uas"
  json='{"accId": "132109", "adUnit": "10002912", "sizes": [[728, 90]], "targetings": {"country": ["India", "USA"], "car": "Civic"}}'
>
</amp-ad>
```

### Sample tag

```html
<amp-ad
  width="300"
  height="250"
  type="uas"
  json='{"accId": "132109", "adUnit": "10002912", "sizes": [[300, 250]], "targetings": {"country": ["India", "USA"], "car": "Civic"}, "locLat": "12.24", "locLon": "24.13", "locSrc": "1", "pageURL": "http://mydomain.com"}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Supported parameters via `json` attribute

-   `accId` Account Id (mandatory)
-   `adUnit` AdUnitId (mandatory)
-   `sizes` Array of sizes (mandatory)
-   `locLat` Geo-location latitude
-   `locLon` Geo-location longitude
-   `locSrc` Geo-location source
-   `pageURL` Set custom page URL
-   `targetings` key-value pairs
-   `extraParams` key-value pairs to be passed to PubMatic SSP

### Unsupported Ad Formats

-   Interstitials
-   Expandables. Work is in progress
-   Flash
-   Creatives served over HTTP
