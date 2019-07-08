---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Dailymotion video.
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

# amp-dailymotion

Displays a <a href="http://www.dailymotion.com/">Dailymotion</a> video.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-dailymotion" src="https://cdn.ampproject.org/v0/amp-dailymotion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-dailymotion/">Annotated code example for amp-dailymotion</a></td>
  </tr>
</table>

[TOC]

## Example

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos.

```html
<amp-dailymotion
    data-videoid="x2m8jpp"
    layout="responsive"
    width="480" height="270"></amp-dailymotion>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay:</p>
<ul>
  <li>the video is automatically muted before autoplay starts</li>
  <li>when the video is scrolled out of view, the video is paused</li>
  <li>when the video is scrolled into view, the video resumes playback</li>
  <li>when the user taps the video, the video is unmuted</li>
  <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid (required)</strong></td>
    <td>The Dailymotion video id found in every video page URL. For example, <code>"x2m8jpp"</code> is the video id for <code>https://www.dailymotion.com/video/x2m8jpp_dailymotion-spirit-movie_creation</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-mute (optional)</strong></td>
    <td>Indicates whether to mute the video.</p>
<ul>
  <li>Value: `"true"` or `"false"`</li>
  <li>Default value: `"false"`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-endscreen-enable (optional)</strong></td>
    <td>Indicates whether to enable the end screen.</p>
<ul>
  <li>Value: `"true"` or `"false"`</li>
  <li>Default value: `"true"`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-sharing-enable (optional)</strong></td>
    <td>Indicates whether to display the sharing button.</p>
<ul>
  <li>Value: `"true"` or `"false"`</li>
  <li>Default value: `"true"`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-start (optional)</strong></td>
    <td>Specifies the time (in seconds) from which the video should start playing.</p>
<ul>
  <li>Value: integer (number of seconds). For example, `data-start=45`.</li>
  <li>Default value: `0`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-ui-highlight (optional)</strong></td>
    <td>Change the default highlight color used in the controls.</p>
<ul>
  <li>alue: Hexadecimal color value (without the leading #). For example, `data-ui-highlight="e540ff"`.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-ui-logo (optional)</strong></td>
    <td>Indicates whether to display the Dailymotion logo.</p>
<ul>
  <li>Value: `"true"` or `"false"`</li>
  <li>Default value: `"true"`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-info (optional)</strong></td>
    <td>Indicates whether to show video information (title and owner) on the start screen.</p>
<ul>
  <li>Value: `"true"` or `"false"`</li>
  <li>Default value: `"true"`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-* (optional)</strong></td>
    <td><p>All data-param-* attributes are added as query parameters to the src value of the embedded Dailymotion iframe. You can use this attribute to pass custom values not explicitly declared.<br>Keys and values will be URI encoded.</p>
<ul>
  <li>`data-param-origin="example.com"`</li>
</ul>
<p>Please read <a href="https://developer.dailymotion.com/player#player-parameters">Dailymotion's video player documentation</a> to know more about parameters and options.</p></td>
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

See [amp-dailymotion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-dailymotion/validator-amp-dailymotion.protoascii) in the AMP validator specification.
