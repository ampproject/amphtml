---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Springboard Platform video player.
---

# amp-springboard-player

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<amp-springboard-player
  data-site-id="261"
  data-mode="video"
  data-content-id="1578473"
  data-player-id="test401"
  data-domain="test.com"
  data-items="10"
  layout="responsive"
  width="480"
  height="270"
>
</amp-springboard-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-site-id (required)</strong></td>
    <td>The SpringBoard site ID. Specific to every partner.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-mode (required)</strong></td>
    <td>The SpringBoard player mode: <code>video</code> or <code>playlist</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-id (required)</strong></td>
    <td>The SpringBoard player content ID (video or playlist ID).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-player-id (required)</strong></td>
    <td>The Springboard player ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-domain (required)</strong></td>
    <td>The Springboard partner domain.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-items (required)</strong></td>
    <td>The number of videos in the playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-springboard-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-springboard-player/validator-amp-springboard-player.protoascii) in the AMP validator specification.
