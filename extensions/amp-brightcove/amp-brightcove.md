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

# amp-brightcove

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>An <code>amp-brightcove</code> component displays the Brightcove Player as used in Brightcove's <a href="https://www.brightcove.com/en/online-video-platform">Video Cloud</a> or <a href="https://www.brightcove.com/en/player">Brightcove Player</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-brightcove" src="https://cdn.ampproject.org/v0/amp-brightcove-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-brightcove/">Annotated code example for amp-brightcove</a></td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-brightcove
    data-account="12345"
    data-player="default"
    data-embed="default"
    data-video-id="1234"
    layout="responsive"
    width="480" height="270">
</amp-brightcove>
```

## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-account</strong></td>
    <td>The Brightcove Video Cloud or Perform account id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-player or data-player-id</strong></td>
    <td>The Brightcove player id. This is a GUID, shortid or "default". The default value is "default".<br><code>data-player</code> is preferred. <code>data-player-id</code> is also supported for backwards-compatibility.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embed</strong></td>
    <td>The Brightcove player id. This is a GUID or "default". The default value and most common value is "default".</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-video-id</strong></td>
    <td>The Video Cloud video id. Most Video Cloud players will need this.<br>This is not used for Perform players by default; use it if you have added a plugin that expects a <code>videoId</code> param in the query string.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id</strong></td>
    <td><p>The Video Cloud playlist id. For AMP HTML uses a video id will normally be used instead. If both a playlist and a video are specified, the playlist takes precedence.</p>
<p>This is not used for Perform players by default; use it if you have added a plugin that expects a <code>playlistId</code> param in the query string.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-referrer</strong></td>
    <td>Sets the referrer to be used for the Video Cloud analytics within the player. Requires Brightcove Player version v6.25.0+. This supports AMP varables such as <code>EXTERNAL_REFERRER</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-*</strong></td>
    <td>All <code>data-param-*</code> attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.
<br>
Keys and values will be URI encoded. Keys will be camel cased.</p>
<ul>
  <li>`data-param-language="de"` becomes `&language=de`</li>
  <li>`data-param-custom-ad-data="key:value;key2:value2"` becomes `&customAdData=key%3Avalue%3Bkey2%3Avalue2`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-video-docking/amp-video-docking.md">documentation on the docking extension itself.</a></td>
  </tr>
</table>


## Player configuration

To support AMP's video interface, which is recommended, make sure you configure players used with the AMP Support plugin. See [Brightcove's support documentation](https://support.brightcove.com/amp) for player configuration instructions.

## Validation

See [amp-brightcove rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-brightcove/validator-amp-brightcove.protoascii) in the AMP validator specification.
