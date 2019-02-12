---
$category@: media
formats:
  - websites
  - ads
teaser:
  text: Displays a YouTube video.
---
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

# amp-youtube

Displays a <a href="https://www.youtube.com/">YouTube</a> video.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">&lt;/script></code></td>
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

[TOC]

## Example

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-youtube
    data-videoid="mGENRKrdoGY"
    layout="responsive"
    width="480" height="270"></amp-youtube>
```

```html
  <amp-youtube
      id="myLiveChannel"
      data-live-channelid="UCB8Kb4pxYzsDsHxzBfnid4Q"
      width="358"
      height="204"
      layout="responsive">
    <amp-img
      src="https://i.ytimg.com/vi/Wm1fWz-7nLQ/hqdefault_live.jpg"
      placeholder
      layout="fill"
      />
  </amp-youtube>
```
## Attributes

<table>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay:</p>
<ul>
  <li>the video is automatically muted before autoplay starts
  </li>
  <li>when the video is scrolled out of view, the video is paused
  </li>
  <li>when the video is scrolled into view, the video resumes playback
  </li>
  <li>when the user taps the video, the video is unmuted
  </li>
  <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.
  </li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid</strong></td>
    <td><p>The YouTube video id found in every YouTube video page URL.</p>
<p>For example, in this URL: https://www.youtube.com/watch?v=Z1q71gFeRqM, <code>Z1q71gFeRqM</code> is the video id.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-live-channelid</strong></td>
    <td>The Youtube channel id that provides a stable livestream url. For example, in this URL: https://www.youtube.com/embed/live_stream?channel=UCB8Kb4pxYzsDsHxzBfnid4Q, <code>UCB8Kb4pxYzsDsHxzBfnid4Q</code> is the channel id. You can provide a <code>data-live-channelid</code> instead of a <code>data-videoid</code> attribute to embed a stable url for a live stream instead of a video. Channels do not come with default placeholders. You can provide a placeholder for the video per example 2 above.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-&#42;</strong></td>
    <td><p>All <code>data-param-*</code> attributes will be added as query parameter to the YouTube iframe src. This may be used to pass custom values through to YouTube plugins, such as whether to show controls.</p>
<p>Keys and values will be URI encoded. Keys will be camel cased.</p>
<ul>
  <li>`data-param-controls=1` becomes `&controls=1`</li>
</ul>
<p>See <a href="https://developers.google.com/youtube/player_parameters">YouTube Embedded Player Parameters</a> for more parameter options for YouTube.</p>
</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-video-docking/amp-video-docking.md">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>credentials (optional)</strong></td>
    <td><p>Defines a <code>credentials</code> option as specified by the <a href="https://fetch.spec.whatwg.org/">Fetch API</a>.</p>
<ul>
  <li>Supported values: `omit`, `include`</li>
  <li>Default: `include`</li>
</ul>
<p>If you want to use the <a href="http://www.google.com/support/youtube/bin/answer.py?answer=141046">YouTube player in privacy-enhanced mode</a>, pass the value of <code>omit</code>.
  Usually YouTube sets its cookies when the player is loaded. In privacy-enhanced mode cookies are set when the user has clicked on the player.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-youtube rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube/validator-amp-youtube.protoascii) in the AMP validator specification.
