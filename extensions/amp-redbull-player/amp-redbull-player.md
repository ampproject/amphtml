---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Red Bull video.
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

# amp-redbull-player

Displays a <a href="https://player.redbull.com/demo/index.html">Red Bull Video Player</a>.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-redbull-player" src="https://cdn.ampproject.org/v0/amp-redbull-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Example

```html
<amp-redbull-player
  id="rbvideo"
  data-param-videoid="rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT"
  data-param-skinid="com"
  data-param-locale="en"
  height="360"
  width="640"
></amp-redbull-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-param-videoid (required)</strong></td>
    <td>The video ID</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-skinid (optional)</strong></td>
    <td>The ID of the skin to display. Value can be stv or com. Defaults to com</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-locale (optional)</strong></td>
    <td>String value for the tracking configuration.</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>id (optional)</strong></td>
    <td>Selector for the amp-analytics triggers configuration.</td>
  </tr>
</table>

## Validation

See [amp-redbull-player rules]`(https://github.com/ampproject/amphtml/blob/master/extensions/amp-redbull-player/validator-amp-player-player.protoascii)` in the AMP validator specification.
