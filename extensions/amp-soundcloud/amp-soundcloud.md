---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Soundcloud clip.
---

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

# amp-soundcloud

## Examples

With the responsive layout, the `width` and `height` from the example should yield correct layouts for 1:1 aspect ratio embeds:

Visual Mode:

```html
<amp-soundcloud
  width="480"
  height="480"
  layout="responsive"
  data-trackid="243169232"
  data-visual="true"
></amp-soundcloud>
```

Classic Mode:

```html
<amp-soundcloud
  width="480"
  height="480"
  layout="responsive"
  data-trackid="243169232"
  data-color="ff5500"
></amp-soundcloud>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>This attribute is required if <code>data-playlistid</code> is not defined.<br />
The value for this attribute is the ID of a track, an integer.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>This attribute is required if <code>data-trackid</code> is not defined.
The value for this attribute is the ID of a playlist, an integer.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (optional)</strong></td>
    <td>The secret token of the track, if it is private.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (optional)</strong></td>
    <td>If set to <code>true</code>, displays full-width "Visual" mode; otherwise, it displays as "Classic" mode. The default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (optional)</strong></td>
    <td>This attribute is a custom color override for the "Classic" mode. The attribute is ignored in "Visual" mode. Specify a hexadecimal color value, without the leading # (e.g., <code>data-color="e540ff"</code>).</td>
  </tr>
  <tr>
    <td width="40%"><strong>width and height</strong></td>
    <td>The layout for <code>amp-soundcloud</code> is set to <code>fixed-height</code> and it fills all of the available horizontal space. This is ideal for the "Classic" mode, but for "Visual" mode, it's recommended that the height is 300px, 450px or 600px, as per Soundcloud embed code. This will allow the clip's internal elements to resize properly on mobile.</td>
  </tr>
</table>

## Validation

See [amp-soundcloud rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-soundcloud/validator-amp-soundcloud.protoascii) in the AMP validator specification.
