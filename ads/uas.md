<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# UAS

## Example

### Basic

```html
<amp-ad width=728 height=90
    type="uas"
    json='{"accountId": "132109", "adUnit": "10002912", "sizes": [[728, 90]]}'>
</amp-ad> 
```

### Multi-size Ad

```html
<amp-ad width=728 height=90
    type="uas"
    json='{"accId": "132109", "adUnit": "10002912", "sizes": [[728, 90], [700, 90], [700, 60]]}'>
</amp-ad> 
```
Note that the `width` and `height` mentioned should be maximum of the width-hight combinations mentioned in `json.sizes`.

### Targetings
```html
<amp-ad width=728 height=90
    type="uas"
    json='{"accId": "132109", "adUnit": "10002912", "sizes": [[728, 90]], "targetings": {"country": ["India", "USA"], "car": "Civic"}}'>
</amp-ad>
```

### Supported parameters via `json` attribute:

- `accId` Account Id (mandatory)
- `adUnit` AdUnitId (mandatory)
- `sizes` Array of sizes (mandatory)
- `locLat` Geo-location lattitude
- `locLon` Geo-location longitude
- `locSrc` Geo-location source
- `pageURL` Set custom page URL
- `targetings` key-value pairs
- `extraParams` key-value pairs to be passed to PubMatic SSP

### Sample tag
```html
<amp-ad 
    width=300 height=250
    type="uas"
    json='{"accId": "132109", "adUnit": "10002912", "sizes": [[300, 250]], "targetings": {"country": ["India", "USA"], "car": "Civic"}, "locLat": "12.24", "locLon": "24.13", "locSrc": "wifi", "pageURL": "http://mydomain.com"}'
></amp-ad>
```

### Unsupported Ad Formats
- Interstitials
- Expandables. Work is in progress
- Flash
- Creatives served over HTTP



