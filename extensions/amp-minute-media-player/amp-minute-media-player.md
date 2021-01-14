---
$category: media
formats:
  - websites

teaser:
  text: Displays a Minute Media player.
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

# amp-minute-media-player

## Usage

Use `amp-minute-media-player` to display a [Minute Media](https://www.minutemedia.com/) player.

Example with `responsive` layout - width and height attributes determine the aspect ratio of the player embedded.

```html
<amp-minute-media-player
  data-content-type="curated"
  data-content-id="fSkmeWKF"
  width="500"
  height="334"
  layout="responsive"
  autoplay
>
</amp-minute-media-player>
```

Example with `fixed` layout - fixed width and height.

```html
  <amp-minute-media-player
    data-content-type="semantic"
    data-scanned-element-type="tag"
    data-scanned-element="post-body"
    layout="fixed" width="500" height="334"
  </amp-minute-media-player>
```

## Attributes

### data-content-type

The Minute Media player type. The options are `specific` or `semantic`. Choose `specific` in order to play specific content and insert the content id in the `data-content-id` attribute.

By choosing `semantic` the playlist will be automatically created and match the content of the article to the most relevant video in real time.

### data-content-id

The Minute Media player id. This data is required only if you choose playing `specific` content(in the `data-content-type`.

### data-scanned-element-type

Choose the defining characteristic (class-name, tag-name or id) when pairing content with the video. This data is reflected only if you choose playing `semantic` content in the `data-content-type`.

### data-scanned-element

Choose the specific element accoring to the choosen scanned element type to be considered when pairing content with the video. This data is reflected only if you choose playing `semantic` content in the `data-content-type`.

### data-tags

Tags that taken into consideration when the decision which video content to play is made in `semantic` content type. This data is reflected only if you choose playing `semantic` content in the `data-content-type`.

### data-minimum-date-factor

This data reflects the last number of days the engine should take into consideration when searching for a matching video. Older videos will receive a lower score. This data is reflected only if you choose playing `semantic` content in the `data-content-type`.

### data-scoped-keywords

This data is responsible to return only videos with the specified tags in the matching results. This data is reflected only if you choose playing `semantic` content in the data-content-type.

### autoplay

If this attribute is present, and the browser supports autoplay:

- The video is automatically muted before autoplay starts.
- When the video is scrolled out of view, the video is paused.
- When the video is scrolled into view, the video resumes playback.
- When the user taps the video, the video is unmuted.
- If the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

### dock

Requires [`amp-video-docking` component](https://amp.dev/documentation/components/amp-video-docking). If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner when the user scrolls out of the video component's visual area.

- The video can be dragged and repositioned by the user on a different corner.
- Multiple videos on the same page can be docked.

## Validation

See [amp-minute-media-player rules](validator-amp-minute-media-player.protoascii) in the AMP validator specification.
