---
$category@: media
formats:
  - websites
teaser:
  text: Displays a media stream from the nexxOMNIA platform.
---
<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# amp-nexxtv-player

Displays a media stream from the nexxOMNIA platform.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-nexxtv-player" src="https://cdn.ampproject.org/v0/amp-nexxtv-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Example

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-nexxtv-player
    data-mediaid="71QQG852413DU7J"
    data-client="761"
    data-streamtype="video"
    data-seek-to="2"
    data-mode="static"
    data-origin="https://embed.nexx.cloud/"
    data-disable-ads="1"
    data-streaming-filter="nxp-bitrate-2500"
    layout="responsive"
    width="480" height="270"></amp-nexxtv-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><p><strong>data-mediaid (required)</strong></p></td>
    <td><p>Represents the ID of the media you want to play.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-client (required)</strong></p></td>
    <td><p>Your domain ID.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-streamtype (optional)</strong></p></td>
    <td><p>Indicates the media streaming type, which can be one of the following:</p>
<ul>
  <li>`video` (default)</li>
  <li>`audio`</li>
  <li>`playlist`</li>
  <li>`playlist-masked`: A playlist without the option to skip or choose video.</li>
  <li>`live`</li>
  <li>`album`: An audio playlist.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-seek-to (optional)</strong></p></td>
    <td><p>Indicates the starting point of your media (in seconds). For example, video starting 1:30min.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-mode (optional)</strong></p></td>
    <td><p>Indicates the data mode, which can be <code>static</code> (default) or <code>api</code>.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-origin (optional)</strong></p></td>
    <td><p>Indicates the source from which the embedded domain media is played. By default this is set to <code>https://embed.nexx.cloud/</code>.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-disable-ads (optional)</strong></p></td>
    <td><p>Ads are enabled by default. Set value to 1 to disable.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>data-streaming-filter (optional)</strong></p></td>
    <td><p>Set streaming filter e.g. "nxp-bitrate-0750" for max 750kbit max bitrate.</p></td>
  </tr>
  <tr>
    <td width="40%"><p><strong>common attributes</strong></p></td>
    <td><p>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</p></td>
  </tr>
</table>

## Validation

See [amp-nexxtv-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-nexxtv-player/validator-amp-nexxtv-player.protoascii) in the AMP validator specification.
