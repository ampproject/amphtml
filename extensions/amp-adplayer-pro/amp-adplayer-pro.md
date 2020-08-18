---
$category@: media
formats:
  - websites
teaser:
  text: Displays an AdPlayer.Pro player.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# `amp-adplayer-pro`

An `amp-adplayer-pro` displays the video ad player by [AdPlayer.Pro](https://adplayer.pro/).

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-adplayer-pro
  data-placement="caUcvGy0dPEMAR1oJizSGMlwDI5a4bBErmG2m_XCYrPFQbT79KXs"
  layout="responsive"
  width="16"
  height="9"
>
</amp-adplayer-pro>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-placement</strong></td>
    <td>This is a Placement ID. It can be found in the Ad Placement settings - in the Supply section of your account <a href="https://adplayer.pro/login">dashboard</a>.
    If you have difficulty finding the Placement ID, please <a href="https://adplayer.pro/contacts">contact AdPlayer.Pro</a> for more assistance.</td>
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

See [amp-adplayer-pro rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-adplayer-pro/validator-amp-adplayer-pro.protoascii) in the AMP validator specification.
