---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Brid.tv player.
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

# amp-brid-player
An <code>amp-brid-player</code> displays the Brid Player used in <a href="https://www.brid.tv/">Brid.tv</a> Video Platform.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-brid-player" src="https://cdn.ampproject.org/v0/amp-brid-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-brid-player/"> Annotated code example for amp-brid-player</a></td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-brid-player
    data-partner="264"
    data-player="4144"
    data-video="13663"
    layout="responsive"
    width="480" height="270">
</amp-brid-player>
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
    <td width="40%"><strong>data-partner</strong></td>
    <td>The Brid.tv partner ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-player</strong></td>
    <td>The Brid.tv player ID. Specific to every partner.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-video</strong></td>
    <td>The Brid.tv video ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist</strong></td>
    <td>The Brid.tv playlist ID or custom string value for dynamic playlists.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-outstream</strong></td>
    <td>The Brid.tv outstream unit ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-dynamic</strong></td>
    <td>Parameter used to specify type of dynamic playlist, e.g. latest, channel, tag.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

Embed code must either have video, playlist or outstream attribute.

## Validation

See [amp-brid-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-brid-player/validator-amp-brid-player.protoascii) in the AMP validator specification.
