---
$category@: media formats:

- websites teaser:
  text: Displays a Truvid player.

---

# amp-truvid-player

## Example

```html

<amp-truvid-player
  data-org-id="73"
  data-playlist-id="229"
  data-widget-id="442"
  height="169"
  layout="responsive"
  width="300"
></amp-truvid-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-org-id (required)</strong></td>
    <td>Organization ID which owns the widget to load.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-widget-id (required)</strong></td>
    <td>The ID of the widget to load.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id (optional)</strong></td>
    <td>The ID of the playlist we want to embed with the widget</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-video-id (optional)</strong></td>
    <td>The ID of the video we want to embed with the widget</td>
  </tr>
<tr>
    <td width="40%"><strong>dock (optional)</strong></td>
    <td><strong>Requires `amp-video-docking` extension.</strong> If this attribute is present and the
video is playing manually, the video will be "minimized" and fixed to a corner
or an element when the user scrolls out of the video component's visual area.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-truvid-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-truvid-player/validator-amp-truvid-player.protoascii)
in the AMP validator specification.
