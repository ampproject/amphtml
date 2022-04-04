---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Brightcove Video Cloud or Perform player.
---

<!---
Copyright 2015 Brightcove. All Rights Reserved.

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

# bento-brightcove

## Usage

An `bento-brightcove` component displays the Brightcove Player as used in Brightcove's [Video Cloud](https://www.brightcove.com/en/online-video-platform) or [Brightcove Player](https://www.brightcove.com/en/player).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<bento-brightcove
  data-account="12345"
  data-player="default"
  data-embed="default"
  data-video-id="1234"
  layout="responsive"
  width="480"
  height="270"
>
</bento-brightcove>
```

### Player Configuration

Make sure you configure players used with the AMP Support plugin to support AMP's video interface. See [Brightcove's support documentation](https://support.brightcove.com/amp) for player configuration instructions.

## Component Attributes

### `data-account`

The Brightcove Video Cloud or Perform account id.

### `data-player` or `data-player-id`

The Brightcove player id. This is a GUID, shortid or "default". The default
value is "default".

`data-player` is preferred. `data-player-id` is also supported for
backwards-compatibility.

### `data-embed`

The Brightcove player id. This is a GUID or "default". The default value and
most common value is "default".

### `data-video-id`

The Video Cloud video id. Most Video Cloud players will need this.

This is not used for Perform players by default; use it if you have added a
plugin that expects a `videoId` param in the query string.

### `data-playlist-id`

The Video Cloud playlist id. For AMP HTML uses a video id will normally be used
instead. If both a playlist and a video are specified, the playlist takes
precedence.

This is not used for Perform players by default; use it if you have added a
plugin that expects a `playlistId` param in the query string.

### `data-referrer`

Sets the referrer to be used for the Video Cloud analytics within the player.
Requires Brightcove Player version v6.25.0+. This supports AMP variables such as
`EXTERNAL_REFERRER`.

### `data-param-*`

All `data-param-*` attributes will be added as query parameters to the player
iframe src. This may be used to pass custom values through to player plugins,
such as ad parameters or video ids for Perform players.

Keys and values will be URI encoded. Keys will be camel cased.

-   `data-param-language="de"` becomes `&language=de`
-   `data-param-custom-ad-data="key:value;key2:value2"` becomes
    `&customAdData=key%3Avalue%3Bkey2%3Avalue2`

### `autoplay`

If this attribute is present, and the browser supports autoplay, the video will
be automatically played as soon as it becomes visible. There are some conditions
that the component needs to meet to be played, [which are outlined in the Video
in AMP spec](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay).

### `dock`

**Requires `amp-video-docking` extension.** If this attribute is present and the
video is playing manually, the video will be "minimized" and fixed to a corner
or an element when the user scrolls out of the video component's visual area.

For more details, see
[documentation on the docking extension itself](https://amp.dev/documentation/components/amp-video-docking).

### `data-block-on-consent`

If [amp-consent](https://amp.dev/documentation/components/amp-consent/) is used, adding `data-block-on-consent="_till_responded"` will delay player load until the consent state is resolved. The consent state is passed to the player's iframe as query parameters for customisation of advertising implementations in the player. See [Brightcove's support documentation](https://support.brightcove.com/amp) for player configuration instructions.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [bento-brightcove rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-brightcove/validator-amp-brightcove.protoascii) in the AMP validator specification.
