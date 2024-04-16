---
$category@: media
formats:
  - websites
teaser:
  text: Displays GL Transmission Format (gITF) 3D models.
---

# amp-3d-gltf

## Usage

The `amp-3d-gltf` component displays 3D models that are in gITF format.

[tip type="note"]
You must use a [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)-capable browser to display 3D models.
[/tip]

### Example

```html
<amp-3d-gltf
  layout="responsive"
  width="320"
  height="240"
  alpha="true"
  antialiasing="true"
  src="path/to/model.glb"
></amp-3d-gltf>
```

### Compatibility

The component supports [glTF 2.0](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras),
with the following exceptions:

-   Embedded cameras
-   Animation

### Set CORS headers

The `amp-3d-gltf` component makes a fetch request to the origin from
`https://<random>.ampproject.net` when it requests the gltf file. Set
`access-control-allow-origin:*.ampproject.net` on the response header of the
`src` endpoint to avoid
[CORS issues when served from an AMP cache](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/?format=websites).
Use a wildcard character to address the `<random>` subdomain component.

## Attributes

### src

The `src` attribute specifies the gltf file location.

### alpha (optional)

Use the `alpha` attribute to specify the behavior of the canvas background.
This attribute takes a boolean value. To enable transparency instead of the
default white, set the value to `true`.

### antialiasing (optional)

Use the `antialiasing` attribute to specify whether to enable antialiasing. To
enable antialiasing, set the value to true.

### clearColor (optional)

The `clearColor` attribute specifies a CSS color, such as #FF8C00. This color
fills free space on the canvas.

### maxPixelRatio (optional)

The `maxPixelRatio` attribute specifies an upper limit for the `pixelRatio`
render option. It defaults to `window.devicePixelRatio`.

### autoRotate (optional)

Use the `autoRotate` attribute to enable automatic rotation around the model's
center. To enable rotation, set the value to `true`. `autorotate` defaults to
`false`.

### enableZoom (optional)

Use the `enableZoom` attribute to disable zooming in and out of the model. To
disable zoom, set the value to `false`. `autororate` defaults to `true`.

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"GLTF 3D model"`.

## Actions

### setModelRotation

The `setModelRotation` action specifies the model's rotation. The rotation order
is ZYX.

-   Specify the rotation value of the x, y, and/or z axis with `x`, `y`, and/or
    `z` arguments. This action accepts a number between 0 and 1. It defaults to the
    previous value.
-   Specify the angle of rotation in radians with `xMin`, `xMax`, `yMin`, `yMax`,
    and/or `zMin`, `zMax` arguments. Use a min and a max to define the target range.
    The angle range defaults to `0 / pi * 2`.

The following action changes the x axis of the component’s rotation to 1.57 when fired.

```json
setModelRotation((x = 0.5), (xMin = 0), (xMax = 3.14))
```

## Styling

Here are a few things to keep in mind for style:

-   The `alpha` attribute specifies transparency.
-   The `clearColor` attribute specifies the color of the background if it isn't transparent.
-   `amp-3d-gltf` defaults to a white background if you don't specify a background color.

## Validation

See [amp-3d-gltf rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-3d-gltf/validator-amp-3d-gltf.protoascii)
in the AMP validator specification.
