---
$category@: media
formats:
  - websites
teaser:
  text: The amp-delight-player element displays a cloud-hosted Delight Player.
---

<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# amp-delight-player

## Usage

The `amp-delight-player` element displays a cloud-hosted [Delight Player](https://delight-vr.com/).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.
The `data-content-id` attribute is required to load the correct video.

```html
<amp-delight-player
  data-content-id="-123456789AbCdEfGhIj"
  layout="responsive"
  width="16"
  height="9"
>
</amp-delight-player>
```

Non-responsive layout is also supported.

Example:

```html
<amp-delight-player
  data-content-id="-123456789AbCdEfGhIj"
  width="460"
  height="200"
>
</amp-delight-player>
```

## Attributes

### `data-content-id`

The video's content ID.

### `dock`

**Requires `amp-video-docking` extension.** If this attribute is present and the
video is playing manually, the video will be "minimized" and fixed to a corner
or an element when the user scrolls out of the video component's visual area.

For more details, see [documentation on the docking extension itself](https://amp.dev/documentation/components/amp-video-docking).

### `autoplay` (optional)

If this attribute is present, and the browser supports autoplay, the video will
be automatically played as soon as it becomes visible. There are some conditions
that the component needs to meet to be played,
[which are outlined in the Video in AMP spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay).

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Actions

### `play`

Plays the video.

### `pause`

Pauses the video.

### `mute`

Mutes the video.

### `unmute`

Unmutes the video.

## Validation

See [amp-delight-player rules](validator-amp-delight-player.protoascii) in the AMP validator specification.
