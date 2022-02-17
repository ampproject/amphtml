---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Dailymotion video.
experimental: true
bento: true
---

# bento-dailymotion

## Usage

Displays a [Dailymotion](https://www.dailymotion.com/) video.

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos.

```html
<bento-dailymotion
  data-videoid="x2m8jpp"
  layout="responsive"
  width="480"
  height="270"
></bento-dailymotion>
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

### `data-videoid`

The Dailymotion video id found in every video page URL. For example, `"x2m8jpp"`
is the video id for
`https://www.dailymotion.com/video/x2m8jpp_dailymotion-spirit-movie_creation`.

### `data-mute` (optional)

Indicates whether to mute the video.

-   Value: `"true"` or `"false"`
-   Default value: `"false"`

### `data-endscreen-enable` (optional)

Indicates whether to enable the end screen.

-   Value: `"true"` or `"false"`
-   Default value: `"true"`

### `data-sharing-enable` (optional)

Indicates whether to display the sharing button.

-   Value: `"true"` or `"false"`
-   Default value: `"true"`

### `data-start` (optional)

Specifies the time (in seconds) from which the video should start playing.

-   Value: integer (number of seconds). For example, `data-start=45`.
-   Default value: `0`

### `data-ui-highlight` (optional)

Change the default highlight color used in the controls.

-   Value: Hexadecimal color value (without the leading #). For example,
    `data-ui-highlight="e540ff"`.

### `data-ui-logo` (optional)

Indicates whether to display the Dailymotion logo.

-   Value: `"true"` or `"false"`
-   Default value: `"true"`

### `data-info` (optional)

Indicates whether to show video information (title and owner) on the start
screen.

-   Value: `"true"` or `"false"`
-   Default value: `"true"`

### `data-param-*` (optional)

All `data-param-*` attributes are added as query parameters to the `src` value
of the embedded Dailymotion iframe. You can use this attribute to pass custom
values not explicitly declared.

Keys and values will be URI encoded.

-   `data-param-origin="example.com"`

Please read [Dailymotion's video player documentation](https://developer.dailymotion.com/player#player-parameters)
to know more about parameters and options.

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

See [bento-dailymotion rules](../../../../extensions/amp-dailymotion/validator-amp-dailymotion.protoascii) in the AMP validator specification.
