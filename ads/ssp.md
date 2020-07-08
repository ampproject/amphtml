<!---
 Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# SSP

## Example with one Ad

```html
<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-position='{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>
```

## Example with two Ads

```html
<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-position='{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>

<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-position='{ "id": "id-2", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>
```

## Configuration

Required parameters:

| Attribute     | Description                          | Example                                                               |
| ------------- | ------------------------------------ | --------------------------------------------------------------------- |
| width         | Width of AMP Ad (grey fixed border)  | `200`                                                                 |
| height        | Height of AMP Ad (grey fixed border) | `200`                                                                 |
| type          | Type of amp-ad                       | `ssp`                                                                 |
| data-position | JSON stringified position object     | `{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }` |

### `data-position`

- Object must have required keys `id`, `width`, `height`, `zoneId` (Watch out for uppercase "I" in "id").
- Every position MUST have unique `id`, if you duplicate some id, Ad may be used from another position.
- Attributes `width` and `height` are from AMP specification, and they will set fixed border around Ad.
- Attributes `data-width` and `data-height` are used to fetch SSP Ads on the server (They can different).

## Contact

seznam.partner@firma.seznam.cz
