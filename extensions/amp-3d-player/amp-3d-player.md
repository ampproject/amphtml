<!--
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

# <a name="`amp-3d-player`"></a> `amp-3d-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>glTF 3d-model viewer</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>WebGL capable browser required</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-3d-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
</table>

## Example
```html
<amp-3d-player
    layout="responsive"
    width="320"
    height="240"
    alpha="true"
    antialiasing="true"
    src="path/to/model.glb"></amp-3d-player>
```

## Limitations
Currently only works with glTF 2.0.

Unsupported features:
- embeded cameras
- animation

## Attributes

##### src: URL
Path to gltf file

##### alpha (optional, default="false"): boolean
See through free space on canvas, by default free space is filled with black

##### antialiasing (optional, default="false")
Turn on/off antialiasing

##### maxPixelRatio (optional, default=window.devicePixelRatio): number 
Set upper limit for pixelRatio render option

##### autoRotate (optional, default="false"): boolean
Automatically rotate camera around model's center

##### enableZoom (optional, default="true"): boolean
Turn on/off zoom


## Validation
See [amp-3d-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-3d-player/validator-amp-3d-player.protoascii) in the AMP validator specification.
