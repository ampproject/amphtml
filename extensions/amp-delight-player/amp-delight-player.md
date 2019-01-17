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

# <a name="amp-delight-player"></a> `amp-delight-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>The <code>amp-delight-player</code> element displays a cloud-hosted [Delight Player](https://delight-vr.com/).
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-delight-player" src="https://cdn.ampproject.org/v0/amp-delight-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.
The `data-content-id` attribute is required to load the correct video.

Example:

```html
<amp-delight-player
    data-content-id="-123456789AbCdEfGhIj"
    layout="responsive" 
    width="16" 
    height="9">    
</amp-delight-player>
```

Non-responsive layout is also supported.

Example:

```html
<amp-delight-player
    data-content-id="-123456789AbCdEfGhIj"
    width="460" 
    height="200">    
</amp-delight-player>
```

## Attributes

##### data-content-id (**Required**)

The video's content ID.

##### autoplay

If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, [which are outlined in the Video in AMP spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay).

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Actions
`amp-delight-player` exposes four self-explanatory actions: `play`, `pause`, `mute` and `unmute`.

## Validation
See [amp-delight-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-delight-player/validator-amp-delight-player.protoascii) in the AMP validator specification.
