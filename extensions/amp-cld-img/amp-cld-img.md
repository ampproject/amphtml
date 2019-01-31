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

# `amp-cld-img`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an optimized Cloudinary image.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-cld-img" src="https://cdn.ampproject.org/v0/amp-cld-img-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, fixed_height, responsive, fill, flex_item, intrinsic</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-cld-img.amp.html">Examples</a><td>
  </tr>
</table>

## Behavior

This extension allows embedding a Cloudinary image, supporting on-the-fly transformations and 
automatic responsive images. The extension combines the attributes and runtime dimensions of the 
element, and generates an optimized responsive image url.

The page should contain a configuration script tag. The value is a json containing global configuration applied to all
cloudinary image tags in the page. The only required value `cloudName`, and in case the Cloudinary account is 
configured with advanced delivery options, the relevant values go here as well. Default 
transformations values can also go here, and will be applied to all tags. 
```
<script id="amp-cld-config" type="application/json">
    {
      "cloudName": "your-cloud-name",
      "fetchFormat": "auto",
      "quality": "auto",
      "dpr": "auto"
    }
  </script>
```

Note: All  values can be provided as attributes to the tag, and will override any global value. 
## Attributes


##### data-public-id

Required. The public id of the Cloudinary image.
##### data-cloud-name

The cloud name of the image.Can be provided in the global config tag, otherwise it's required.
##### quality

The quality settings for the delivered image. Use 'auto' for optimized quality. See [quality](https://cloudinary.com/documentation/image_transformation_reference#quality_parameter).
##### format

The format of the delivered image. Use 'auto' for the optimal format. See [format](https://cloudinary.com/documentation/image_transformation_reference#format_parameter).
##### crop

The crop mode of the delivered images. See [crop modes](https://cloudinary.com/documentation/image_transformation_reference#crop_parameter).
##### gravity

The gravity of the cropping, if applies. See [gravity](https://cloudinary.com/documentation/image_transformation_reference#gravity_parameter).
##### background

The background of the image, in case of cropping and/or transparent images. See [background](https://cloudinary.com/documentation/image_transformation_reference#background_parameter).
##### effect

An effect to apply to the delivered image. See [effect](https://cloudinary.com/documentation/image_transformation_reference#effect_parameter).
##### border

A border to apply to the delivered image. See [border](https://cloudinary.com/documentation/image_transformation_reference#border_parameter).
##### aspect-ratio

An aspect ratio to use when cropping or resizing the delivered image. See [aspect ratio](https://cloudinary.com/documentation/image_transformation_reference#aspect_ratio_parameter).
##### dpr

The device-pixel-ratio for the delivered image. Use 'auto' to automatically use the user's actual runtime DPR.  See [dpr](https://cloudinary.com/documentation/image_transformation_reference#dpr_parameter).
##### transformation-width

Set to a fixed value override the responsive width. Use 'iw' (=initial width) to get the original image width. 
##### transformation-height

Set to a fixed value override the responsive height. Use 'ih' (=initial height) to get the original image height.

##### raw-transformation

Add a pre-generated transformation string to the delivered image. This will be combined with the other attributes (see examples).
##### src

Useful if there's a pre-generated cloudinary url. Other attributes will be ignored. If the url contains `w_auto` and/or `h_auto` they will be replaced with runtime dimensions.
##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-cld-img rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-cld-img/validator-amp-cld-img.protoascii) in the AMP validator specification.

