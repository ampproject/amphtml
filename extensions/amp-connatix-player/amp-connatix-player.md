---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted Connatix Player.
---

# amp-connatix-player

## Usage

Displays a cloud-hosted [Connatix Player](https://www.connatix.com/).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-connatix-player
  data-player-id="03ef71d8-0941-4bff-94f2-74ca3580b497"
  layout="responsive"
  width="16"
  height="9"
>
</amp-connatix-player>
```

## Attributes

### `data-player-id`

Connatix player id. This can be found at the Video Players section in the
Connatix management dashboard.

### `data-media-id` (optional)

Connatix media id. This represents the unique ID of any media in your Library.
This can be found at the Library section in the Connatix management dashboard.

### `data-param-\*`

All `data-param-*` prefixed attributes are turned into URL parameters and passed to iframe src.

### `dock`
Requires `amp-video-docking` extension. If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
For more details, see [documentation on the docking extension itself](https://github.com/ampproject/amphtml/blob/master/extensions/amp-video-docking/amp-video-docking.md).

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-connatix-player rules](validator-amp-connatix-player.protoascii) in the AMP validator specification.
