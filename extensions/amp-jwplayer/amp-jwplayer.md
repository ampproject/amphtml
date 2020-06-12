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

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

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

Example:

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

<table>
  <tr>
    <td width="40%"><strong>data-player-id</strong></td>
    <td>JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/players">Players</a> section in your JW Player Dashboard. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-media-id</strong></td>
    <td>The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content">Content</a> section in your JW Player Dashboard. (<strong>Required if <code>data-playlist-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id</strong></td>
    <td>The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content/playlists">Playlists</a> section in your JW Player Dashboard. If both <code>data-playlist-id</code> and <code>data-media-id</code> are specified, <code>data-playlist-id</code> takes precedence. (<strong>Required if <code>data-media-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-search</strong></td>
    <td>Denotes the type of the playlist. If contextual article matching is desired, use the value <code>`__CONTEXTUAL__`</code>. If a search playlist is desired, input a keyword or phrase used to generate the search playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-backfill</strong></td>
    <td>Ensures that a search or contextual playlist always returns a result. If there are no relevant results for the given query, this parameter ensures that a list of trending videos are served instead. (Boolean with default: <code>true</code>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically played as soon as it becomes visible. There are some conditions that the component needs to meet to be played, <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-jwplayer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-jwplayer/validator-amp-jwplayer.protoascii) in the AMP validator specification.
