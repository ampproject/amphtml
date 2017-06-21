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

# <a name="amp-nexxtv-player"></a> `amp-nexxtv-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a media stream from the nexxOMNIA platform.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-nexxtv-player" src="https://cdn.ampproject.org/v0/amp-nexxtv-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Example

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-nexxtv-player
    data-mediaid="PTPFEC4U184674"
    data-client="583"
    data-streamtype="video"
    data-seek-to="2"
    data-mode="static"
    data-origin="https://embed.nexx.cloud/"
    data-disable-ads="1"
    layout="responsive"
    width="480" height="270"></amp-nexxtv-player>
```

## Attributes

**data-mediaid** (required)

Represents the ID of the media you want to play.

**data-client** (required)

Your domain ID.

**data-streamtype** (optional)

Indicates the media streaming type, which can be one of the following:

* `video` (default)
* `audio`
* `playlist`
* `playlist-masked`: A playlist without the option to skip or choose video.
* `live`
* `album`: An audio playlist.


**data-seek-to** (optional)

Indicates the starting point of your media (in seconds).  For example, video starting 1:30min.

**data-mode** (optional)

Indicates the data mode, which can be `static` (default) or `api`.

**data-origin** (optional)

Indicates the source from which the embedded domain media is played. By default this is set to `https://embed.nexx.cloud/`.

**data-disable-ads** (optional)

Ads are enabled by default. Set value to 1 to disable.


**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-nexxtv-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-nexxtv-player/validator-amp-nexxtv-player.protoascii) in the AMP validator specification.
