<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-youtube"></a> `amp-youtube`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://www.youtube.com/">YouTube</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-youtube/">Annotated code example for amp-youtube</a></td>
  </tr>
</table>

## Example

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-youtube
    data-videoid="mGENRKrdoGY"
    layout="responsive"
    width="480" height="270"></amp-youtube>
```

## Attributes

**autoplay**

If this attribute is present, and the browser supports autoplay:

* the video is automatically muted before autoplay starts
* when the video is scrolled out of view, the video is paused
* when the video is scrolled into view, the video resumes playback
* when the user taps the video, the video is unmuted
* if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it.  For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused. 

**data-videoid**

The YouTube video id found in every YouTube video page URL.

For example, in this URL: https://www.youtube.com/watch?v=Z1q71gFeRqM, `Z1q71gFeRqM` is the video id.

**data-param-***

All `data-param-*` attributes will be added as query parameter to the YouTube iframe src. This may be used to pass custom values through to YouTube plugins, such as whether to show controls.

Keys and values will be URI encoded. Keys will be camel cased.

- `data-param-controls=1` becomes `&controls=1`

See [YouTube Embedded Player Parameters](https://developers.google.com/youtube/player_parameters) for more parameter options for YouTube.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-youtube rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube/0.1/validator-amp-youtube.protoascii) in the AMP validator specification.
