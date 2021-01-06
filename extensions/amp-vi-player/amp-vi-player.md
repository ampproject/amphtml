---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Video Intelligence Player.
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-vi-player

## Usage

Displays a [Video Intelligence Player](https://www.vi.ai/).
The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.
For configuration information, please check [https://docs.vi.ai/general/integrations/amp-vi-player/](https://docs.vi.ai/general/integrations/amp-vi-player/).

### Example

```html
<amp-vi-player
  data-publisher-id="test_amp_vi_player"
  data-channel-id="test_channel"
  layout="responsive"
  width="480"
  height="270"
>
</amp-vi-player>
```

## Attributes

### `data-publisher-id`

Video Intelligence publisher id.

### `data-channel-id`

Video Intelligence channel id.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-vi-player rules](validator-amp-vi-player.protoascii) in the AMP validator specification.
