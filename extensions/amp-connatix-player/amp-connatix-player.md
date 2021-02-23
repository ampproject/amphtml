---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted Connatix Player.
---

<!--
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

# amp-connatix-player

## Usage

Displays a cloud-hosted [Connatix Player](https://www.connatix.com/).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-connatix-player
  data-player-id="03ef71d8-0941-4bff-94f2-74ca3580b497"
  layout="responsive"
  width="16"
  height="9"
>
</amp-connatix-player>
```

## Attributes

### `data-player-id`

Connatix player id. This can be found at the Video Players section in the
Connatix management dashboard.

### `data-media-id` (optional)

Connatix media id. This represents the unique ID of any media in your Library.
This can be found at the Library section in the Connatix management dashboard.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-connatix-player rules](validator-amp-connatix-player.protoascii) in the AMP validator specification.
