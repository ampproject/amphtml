---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Soundcloud clip.
experimental: true
bento: true
---

# bento-soundcloud

## Usage

Display a Soundcloud clip.

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `bento-soundcloud`, see [**`bento-soundcloud`**](./1.0/README.md).

## Examples

With the responsive layout, the `width` and `height` from the example should yield correct layouts for 1:1 aspect ratio embeds:

Visual Mode:

```html
<bento-soundcloud
  width="480"
  height="480"
  layout="responsive"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
```

Classic Mode:

```html
<bento-soundcloud
  width="480"
  height="480"
  layout="responsive"
  data-trackid="243169232"
  data-color="ff5500"
></bento-soundcloud>
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
    <td>The layout for <code>bento-soundcloud</code> is set to <code>fixed-height</code> and it fills all of the available horizontal space. This is ideal for the "Classic" mode, but for "Visual" mode, it's recommended that the height is 300px, 450px or 600px, as per Soundcloud embed code. This will allow the clip's internal elements to resize properly on mobile.</td>
  </tr>
</table>

## Validation

See [bento-soundcloud rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-soundcloud/validator-amp-soundcloud.protoascii) in the AMP validator specification.
