---
$category@: media
formats:
  - websites
teaser:
  text: Embeds videos from 3Q SDN.
---

# amp-3q-player

Enables AMP to embed videos from 3Q SDN into your websites.

## Usage

The `amp-3q-player` component embeds videos from 3Q SDN onto an AMP page. The
component includes a video interface, and you can customize the `width` and
`height` of the player. Specify a `responsive` layout to maintain a 16:9 video
aspect ratio.

### Example

```html
<amp-3q-player
  data-id="c8dbe7f4-7f7f-11e6-a407-0cc47a188158"
  layout="responsive"
  width="480"
  height="270"
></amp-3q-player>
```

## Attributes

### data-id

The `data-id` attribute specifies the appropriate `sdnPlayoutId` from 3Q SDN.

### autoplay (optional)

If the `autoplay` attribute is present, and the browser supports autoplay, the
following behaviors are enabled:

-   The video automatically mutes before autoplay starts.
-   When the user scrolls the video out of view, the video pauses.
-   When the user scrolls the video into view, the video resumes.
-   The video unmutes when the user taps it.

If the user interacts with the video and then scrolls it into or out of view,
the state of the video remains the same. For example, if the user pauses the
video, scrolls the video out of view and then scrolls back up to it, the video
remains paused.

### Common attributes

The `amp-3q-player` component includes the [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
that are extended to all AMP components.

## Validation

See [amp-3q-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-3q-player/validator-amp-3q-player.protoascii)
in the AMP validator specification.
