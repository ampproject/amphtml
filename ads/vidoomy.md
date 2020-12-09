<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# Vidoomy

## Example

```html
<amp-ad
  width="300"
  height="200"
  type="vidoomy"
  data-zone-id="430"
  data-zone-id-mbl="431"
  data-unique-id="690712"
>
</amp-ad>
```

## Configuration

For more detailed parameters info, please contact [Vidoomy](https://www.vidoomy.com/#mod-c).

Supported parameters:

- `width`: Width in pixels of the ad container. Mandatory
- `height`: Height in pixels of the ad container. Mandatory
- `data-zone-id`: Unique identifier for zone of the web, when desktop. Mandatory
- `data-zone-id-mbl`: Unique identifier for zone of the web, when mobile. Mandatory
- `data-unique-id`: Unique identifier for match on our server with the site it is in. Mandatory

- `data-width-mbl`: Width in pixels of ad container when mobile. If not present, parameter `width` will be used.
- `data-height-mbl`: Height in pixels of ad container when mobile. If not present, parameter `height` will be used.
- `data-appear-at`: The ad can show from one of the borders of the container. If not present, right will be used.
