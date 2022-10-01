---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Ooyala video.
---

# amp-ooyala-player

## Example

```html
<amp-ooyala-player
  data-embedcode="Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ"
  data-pcode="5zb2wxOlZcNCe_HVT3a6cawW298X"
  data-playerid="6440813504804d76ba35c8c787a4b33c"
  width="640"
  height="360"
></amp-ooyala-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-embedcode (required)</strong></td>
    <td>The video embed code from <a href="https://backlot.ooyala.com">Backlot</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playerid (required)</strong></td>
    <td>The ID of the player to load from <a href="https://backlot.ooyala.com">Backlot</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-pcode (required)</strong></td>
    <td>The provider code for the account owning the embed code and player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playerversion (optional)</strong></td>
    <td>Specifies which version of the Ooyala player to use, V3 or V4. Defaults to V3.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-config (optional)</strong></td>
    <td>Specifies a skin.json config file URL for player V4.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-ooyala-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ooyala-player/validator-amp-ooyala-player.protoascii) in the AMP validator specification.
