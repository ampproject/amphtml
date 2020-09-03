---
$category@: media
formats:
  - websites
teaser:
  text: Displays an embedded Hulu video.
---

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

# amp-hulu

## Usage

Displays an embedded Hulu video.

```html
<amp-hulu
  width="412"
  height="213"
  layout="responsive"
  data-eid="4Dk5F2PYTtrgciuvloH3UA"
>
</amp-hulu>
```

## Attributes

### data-eid

The id of the video. For example, `4Dk5F2PYTtrgciuvloH3UA` is the eid in the following URL: `https://player.hulu.com/site/dash/mobile_embed.html?eid=4Dk5F2PYTtrgciuvloH3UA`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-hulu rules](validator-amp-hulu.protoascii) in the AMP validator specification.
