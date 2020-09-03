---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted JW Player.
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

# amp-jwplayer

## Usage

Use `amp-jwplayer` to display a [cloud-hosted JW Player](https://www.jwplayer.com/).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<amp-jwplayer
  data-player-id="aBcD1234"
  data-media-id="5678WxYz"
  layout="responsive"
  width="16"
  height="9"
>
</amp-jwplayer>
```

Non-responsive layout is also supported.

```html
<amp-jwplayer
  data-player-id="aBcD1234"
  data-playlist-id="5678WxYz"
  width="160"
  height="90"
>
</amp-jwplayer>
```

## Attributes

### data-player-id (required)

JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the [Players](https://dashboard.jwplayer.com/#/players) section in your JW Player Dashboard.

### data-media-id

The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the [Content](https://dashboard.jwplayer.com/#/content) section in your JW Player Dashboard. Required if `data-playlist-id` is not defined.

### data-playlist-id

The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the [Playlists](https://dashboard.jwplayer.com/#/content/playlists) section in your JW Player Dashboard. If both `data-playlist-id` and `data-media-id` are specified, `data-playlist-id` takes precedence. Required if `data-media-id` is not defined.

### data-content-search

Denotes the type of the playlist. If contextual article matching is desired, use the value `__CONTEXTUAL__`. If a search playlist is desired, input a keyword or phrase used to generate the search playlist.

### data-content-backfill

Ensures that a search or contextual playlist always returns a result. If there are no relevant results for the given query, this parameter ensures that a list of trending videos are served instead. Boolean with default: `true`.

### autoplay

If this attribute is present, and the browser supports autoplay, the video will be automatically played as soon as it becomes visible. There are some conditions that the component needs to meet to be played, [which are outlined in the Video in AMP spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay).

### dock

Requires [`amp-video-docking` component](https://amp.dev/documentation/components/amp-video-docking). If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.

### Common attributes</strong></td>

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-jwplayer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-jwplayer/validator-amp-jwplayer.protoascii) in the AMP validator specification.
