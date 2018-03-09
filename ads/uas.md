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
    json='{"accountId": "132109", "adUnit": "10002912", "sizes": [[728, 90], [700, 90], [700, 60]]}'>
</amp-ad>
```


### Supported parameters via `json` attribute:

- `targeting`

### Unsupported Ad Formats
- Interstitials
- Expandables. Although expandables on interaction/click is a format that is work in progress.
- Flash
- Anchor Ads / Adhesion Units
- Creatives served over HTTP.





