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

# Trugaze

## Supported parameters in the amp-ad tag

| Parameter name  | Description                         | Required |
|-----------------|-------------------------------------|----------|
| width           | Primary size width                  | Yes      |
| height          | Primary size height                 | Yes      |
| data-public-id  | Application public id               | Yes      |
| data-slot       | Ad unit code                        | Yes      |
| data-multi-size | Comma separated list of other sizes | No       |
| json            | Custom targeting map                | No       |

Note: if any of the required parameters is not present, the ad slot will not be filled.

## Example

### Basic sample

```html
  <amp-ad width=300 height=250
      type="trugaze"
      data-public-id="4WMPI6PV"
      data-slot="/134642692/amp-samples">
  </amp-ad>
```

### Sample with multisize

```html
  <amp-ad width=300 height=250
      type="trugaze"
      data-public-id="4WMPI6PV"
      data-slot="/134642692/amp-samples"
      data-multi-size="320x50">
  </amp-ad>
```

### Sample with targeting

```html
  <amp-ad width=320 height=50
      type="trugaze"
      data-public-id="4WMPI6PV"
      data-slot="/134642692/amp-samples"
      json='{"targeting":{"target":["sample"],"pos":["amp"]}}'>
  </amp-ad>
```
