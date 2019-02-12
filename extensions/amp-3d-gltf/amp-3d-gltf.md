---
$category@: media
formats:
  - websites
teaser:
  text: Displays GL Transmission Format (gITF) 3D models.
---
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

# amp-3d-gltf
Displays GL Transmission Format (gITF) 3D models.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-3d-gltf" src="https://cdn.ampproject.org/v0/amp-3d-gltf-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-3d-gltf/">amp-3d-gltf example</a>.</td>
  </tr>
</table>

## Usage

The `amp-3d-gltf` component displays 3D models that are in gITF format.

**Note**: A WebGL capable browser is required to display these models.

###  Example

```html
<amp-3d-gltf
    layout="responsive"
    width="320"
    height="240"
    alpha="true"
    antialiasing="true"
    src="path/to/model.glb"></amp-3d-gltf>
```

### Limitations

Currently, only works with glTF 2.0.

Unsupported features:
- embeded cameras
- animation

### CORS

`amp-3d-gltf` makes a `fetch` request from the origin `https://<random>.ampproject.net` so `access-control-allow-origin: *.ampproject.net` must be set on the response header of the endpoint specified as `src`. Wildcard is needed since the origin has a random sub-domain component to it.


## Attributes
<table>
  <tr>
    <td width="40%"><strong>src [required]</strong></td>
    <td>A required attribute that specifies the URL to the gltf file.</td>
  </tr>
  <tr>
    <td width="40%"><strong>alpha [optional]</strong></td>
    <td>A Boolean attribute that specifies whether free space on canvas is transparent. By default, free space is filled with black.
Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>antialiasing [optional]</strong></td>
    <td>A Boolean attribute that specifies whether to turn on antialiasing. Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>clearColor [optional]</strong></td>
    <td>A string that must contain valid CSS color, that will be used to fill free space on canvas.</td>
  </tr>
  <tr>
    <td width="40%"><strong>maxPixelRatio [optional]</strong></td>
    <td>A numeric value that specifies the upper limit for the pixelRatio render option. The default is <code>window.devicePixelRatio</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoRotate [optional]</strong></td>
    <td>A Boolean attribute that specifies whether to automatically rotate the camera around the model's center. Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>enableZoom [optional]</strong></td>
    <td>A Boolean attribute that specifies whether to turn on zoom. Default value is <code>true</code>.</td>
  </tr>
</table>

## Actions
<table>
  <tr>
    <td width="40%"><strong>setModelRotation(x, y, z, xMin, xMax, yMin, yMax, zMin, zMax)</strong></td>
    <td>sets model rotation. rotation order is ZYX
    <ul>
      <li>x/y/z - number 0..1, defaults to previous value of model rotation.</li>
      <li>min/max - angle in radians, defaults to 0 / pi * 2, defines target range</li>
      </ul>
    for example `setModelRotation(x=0.5, xMin=0, xMax=3.14)` will change `x` component of rotation to `1.57`.</td>
  </tr>
</table>

## Validation
See [amp-3d-gltf rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-3d-gltf/validator-amp-3d-gltf.protoascii) in the AMP validator specification.
