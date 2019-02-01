<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-movingplay"></a> `amp-movingplay`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a native <a href="http://movingup.it/movingplay/">MovingPlay Video Player</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-movingplay" src="https://cdn.ampproject.org/v0/amp-movingplay-0.1.js">&lt;/script></code></td>
  </tr>

</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-movingplay
  data-player-id="3e1eee5a68d65bf24db48d994ab6a7a7"
  data-media-id="5678WxYz"
  data-vp-id="0"
  data-o-id=""
  layout="responsive"
  width="160" height="90">
</amp-movingplay>
```

## Attributes

##### data-player-id

Movingplay player id. This is an alphanumeric sequence that can be found after video upload in the Movingplay Dashboard. (**Required**)

##### data-media-id

The Movingplay media id. This is an alphanumeric sequence that can be found in after video upload


##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.
