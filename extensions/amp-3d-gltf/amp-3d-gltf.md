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

# <a name="`amp-3d-gltf`"></a> `amp-3d-gltf`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays GL Transmission Format (gITF) 3D models.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-3d-gltf" src="https://cdn.ampproject.org/v0/amp-3d-gltf-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
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

## Attributes

##### src [required]
A required attribute that specifies the URL to the gltf file.

##### alpha [optional]

A Boolean attribute that specifies whether free space on canvas is transparent. By default, free space is filled with black.
Default value is `false`.

##### antialiasing [optional]

A Boolean attribute that specifies whether to turn on antialiasing. Default value is `false`.

##### maxPixelRatio [optional]

A numeric value that specifies the upper limit for the pixelRatio render option. The default is `window.devicePixelRatio`.

##### autoRotate [optional]
A Boolean attribute that specifies whether to automatically rotate the camera around the model's center. Default value is `false`.

##### enableZoom [optional]

A Boolean attribute that specifies whether to turn on zoom. Default value is `true`.

## Validation
See [amp-3d-gltf rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-3d-gltf/validator-amp-3d-gltf.protoascii) in the AMP validator specification.
