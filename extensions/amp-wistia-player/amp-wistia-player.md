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

# <a name="amp-wistia-player"></a> `amp-wistia-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://wistia.com">Wistia</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-wistia-player" src="https://cdn.ampproject.org/v0/amp-wistia-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
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

##### data-media-hashed-id (required)

The Wistia media id is found in every Wistia media page URL. If the media page URL is https://support.wistia.com/medias/u8p9wq6mq8, the data-media-hashed-id is `u8p9wq6mq8`.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-wistia-player rules](validator-amp-wistia-player.protoascii) in the AMP validator specification.
