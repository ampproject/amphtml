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

# <a name="amp-google-vrview-image"></a> `amp-google-vrview-image`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>VR image</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</div><div>Work in progress.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-google-vrview-image" src="https://cdn.ampproject.org/v0/amp-google-vrview-image-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, fixed-height, responsive, fill, flex-item</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-google-vrview-image/">amp-google-vrview-image example</a>.</td>
  </tr>
</table>

[TOC]

## Overview

See [Google VR View](https://developers.google.com/vr/concepts/vrview) for more details.

VR view supports mono and stereo 360 images. Note:

- VR view images can be stored as png, jpeg, or gif. Recommend is jpeg for improved compression.
- For maximum compatibility and performance, image dimensions should be powers of two (e.g., 2048 or 4096).
- Mono images should be 2:1 aspect ratio (e.g. 4096 x 2048).
- Stereo images should be 1:1 aspect ratio (e.g. 4096 x 4096).

## Example

```html
<amp-google-vrview-image
    src="https://storage.googleapis.com/vrview/examples/coral.jpg"
    stereo
    width="400" height="300" layout=responsive>
</amp-google-vrview-image>
```

## Attributes

##### src

The source URL of a stereo image. Must resolve to https. See notes above on what
kind of image can be passed here.

##### stereo

If specified, the image provided by the `src` attribute is considered to be a stereo
image (see above), otherwise it's a mono image.

##### yaw

Initial yaw of viewer, in degrees. Defaults to 0.

##### yaw-only

Can be specified to restrict motion to yaw only.
