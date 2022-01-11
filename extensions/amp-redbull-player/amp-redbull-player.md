---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Red Bull Video Player.
---

# amp-redbull-player

## Example

```html
<amp-redbull-player
  id="rbvideo"
  data-param-videoid="rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT"
  data-param-skinid="com"
  data-param-locale="en"
  height="360"
  width="640"
></amp-redbull-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-param-videoid (required)</strong></td>
    <td>The video ID</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-skinid (optional)</strong></td>
    <td>The ID of the skin to display. Value can be stv or com. Defaults to com</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-locale (optional)</strong></td>
    <td>String value for the tracking configuration.</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>id (optional)</strong></td>
    <td>Selector for the amp-analytics triggers configuration.</td>
  </tr>
</table>

## Validation

See [amp-redbull-player rules]`(https://github.com/ampproject/amphtml/blob/main/extensions/amp-redbull-player/validator-amp-player-player.protoascii)` in the AMP validator specification.
