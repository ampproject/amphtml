---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Beachfront Reach video player.
---

# amp-reach-player

Displays the Reach Player configured in the [Beachfront Reach](http://beachfrontreach.com) platform.

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-reach-player
  data-embed-id="default"
  layout="responsive"
  width="560"
  height="315"
>
</amp-reach-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-embed-id</strong></td>
    <td>The Reach player embed id found in the "players" section or in the generated embed itself.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.
</td>
  </tr>
</table>

## Validation

See [amp-reach-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-reach-player/validator-amp-reach-player.protoascii) in the AMP validator specification.
