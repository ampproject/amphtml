---
$category@: media
formats:
  - websites
teaser:
  text: Displays a TargetVideo player.
---

# amp-target-video-player

An `amp-target-video-player` displays the TargetVideo Player used in [TargetVideo](https://www.target-video.com/) Video Platform.

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<amp-target-video-player
  data-partner="264"
  data-player="4144"
  data-video="13663"
  layout="responsive"
  width="480"
  height="270"
>
</amp-target-video-player>
```

### `autoplay`

If this attribute is present, and the browser supports autoplay:

-   the video is automatically muted before autoplay starts
-   when the video is scrolled out of view, the video is paused
-   when the video is scrolled into view, the video resumes playback
-   when the user taps the video, the video is unmuted
-   if the user has interacted with the video (e.g., mutes/unmutes,
    pauses/resumes, etc.), and the video is scrolled in or out of view, the
    state of the video remains as how the user left it. For example, if the user
    pauses the video, then scrolls the video out of view and returns to the
    video, the video is still paused.

### `data-partner`

The TargetVideo partner ID.

### `data-player`

The TargetVideo player ID. Specific to every partner.

### `data-video`

The TargetVideo video ID. Embed code must either have `video`, `playlist`, `carousel`
or `outstream` attribute.

### `data-playlist`

The TargetVideo playlist ID or custom string value for dynamic playlists. Embed code
must either have `video`, `playlist`, `carousel` or `outstream` attribute.

### `data-carousel`

The TargetVideo carousel ID. Embed code must either have `video`, `playlist`, `carousel`
or `outstream` attribute.

### `data-outstream`

The TargetVideo outstream unit ID. Embed code must either have `video`, `playlist`, `carousel`
or `outstream` attribute.

### `data-dynamic`

Parameter used to specify type of dynamic playlist, e.g. latest, channel, tag.

### `dock`

**Requires `amp-video-docking` extension.** If this attribute is present and the
video is playing manually, the video will be "minimized" and fixed to a corner
or an element when the user scrolls out of the video component's visual area.

For more details, see [documentation on the docking extension itself](https://amp.dev/documentation/components/amp-video-docking).

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Actions

### `play`

Plays the video.

### `pause`

Pauses the video.

### `mute`

Mutes the video.

### `unmute`

Unmutes the video.

### `fullscreenenter`

Takes the video to fullscreen.

## Validation

See [amp-target-video-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-target-video-player/validator-amp-target-video-player.protoascii) in the AMP validator specification.
