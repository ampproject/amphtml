---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Empower video.
---

<!---
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

# amp-empower

Displays an embedded <a href="https://www.empower.net/">Empower</a> video.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-empower" src="https://cdn.ampproject.org/v0/amp-empower-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
</table>

[TOC]

## Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-empower
  data-video="c2abd452-453d-47e6-ab96-3796f98857d0"
  layout="responsive"
  width="480"
  height="270"
></amp-empower>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-video (required)</strong></td>
    <td>The ID of the Empower video, which can be found on the Empower Console.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-player (optional)</strong></td>
    <td>The ID of the Empower player configuration, which can be found on the Empower Console.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-site (optional)</strong></td>
    <td>The ID of the Empower site definition, which can be found on the Empower Console.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-sitename (optional)</strong></td>
    <td>The site name string provided by Empower, based on your domain name.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>
      <p>If this attribute is present, and the browser supports autoplay:</p>
      <ul>
        <li>the video is automatically muted before autoplay starts</li>
        <li>when the video is scrolled out of view, the video is paused</li>
        <li>when the video is scrolled into view, the video resumes playback</li>
        <li>when the user taps the video, the video is unmuted</li>
        <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>rotate-to-fullscreen</strong></td>
    <td>If the video is visible, the video displays fullscreen after the user rotates their device into landscape mode. For more details, see the <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#rotate-to-fullscreen">Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-empower rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-empower/validator-amp-empower.protoascii) in the AMP validator specification.
