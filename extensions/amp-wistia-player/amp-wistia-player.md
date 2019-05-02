---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Wistia video.
---
<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# amp-wistia-player

Displays a <a href="https://wistia.com">Wistia</a> video.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-wistia-player" src="https://cdn.ampproject.org/v0/amp-wistia-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
</table>

[TOC]

## Example

```html
<amp-wistia-player
    data-media-hashed-id="u8p9wq6mq8"
    width="512" height="360"></amp-wistia-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-media-hashed-id (required)</strong></td>
    <td>The Wistia media id is found in every Wistia media page URL. If the media page URL is https://support.wistia.com/medias/u8p9wq6mq8, the data-media-hashed-id is <code>u8p9wq6mq8</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-wistia-player rules](validator-amp-wistia-player.protoascii) in the AMP validator specification.
