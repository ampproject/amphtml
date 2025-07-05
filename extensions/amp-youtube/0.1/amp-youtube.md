
$category@: media
formats:
  - websites
  - ads
teaser:
  text: Displays a YouTube video or playlist.
---
```

# amp-youtube

## Usage

Displays a YouTube video, playlist, or live stream.

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

### Example: Embed a Video

```html
<amp-youtube
  data-videoid="mGENRKrdoGY"
  layout="responsive"
  width="480"
  height="270"
></amp-youtube>
```

### Example: Embed a Live Channel

```html
<amp-youtube
  id="myLiveChannel"
  data-live-channelid="UCB8Kb4pxYzsDsHxzBfnid4Q"
  width="358"
  height="204"
  layout="responsive"
>
  <amp-img
    src="https://i.ytimg.com/vi/Wm1fWz-7nLQ/hqdefault_live.jpg"
    placeholder
    layout="fill"
  />
</amp-youtube>
```

### Example: Embed a Playlist

```html
<amp-youtube
  data-playlistid="PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI"
  layout="responsive"
  width="480"
  height="270"
></amp-youtube>
```

## Attributes

### autoplay

If this attribute is present, and the browser supports autoplay:

<ul>
  <li>The video is automatically muted before autoplay starts.</li>
  <li>When the video is scrolled out of view, it is paused.</li>
  <li>When the video is scrolled into view, it resumes playback.</li>
  <li>When the user taps the video, it is unmuted.</li>
  <li>If the user interacts with the video (e.g., pauses or unmutes it), AMP respects that state on further viewport changes.</li>
</ul>

### loop

If this attribute is present:

* A video will restart from the beginning when it ends.
* A playlist will loop automatically using the YouTube native looping mechanism.

### data-videoid

The YouTube video ID found in the URL of a YouTube video.

Example:

```
https://www.youtube.com/watch?v=Z1q71gFeRqM
                           ↑ this is the video ID
```

Use either `data-videoid`, `data-live-channelid`, or `data-playlistid`, but not more than one at a time.

### data-live-channelid

The YouTube channel ID for a live stream.

For example:

```
https://www.youtube.com/embed/live_stream?channel=UCB8Kb4pxYzsDsHxzBfnid4Q
                                                      ↑ this is the channel ID
```

You can provide a `placeholder` using `<amp-img>` as shown in the live channel example above.

### data-playlistid

The ID of a YouTube playlist.

For example:

```
https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI
                                        ↑ this is the playlist ID
```

This embeds the full playlist in the player. If the `loop` attribute is present, the playlist will repeat automatically.

### data-param-\*

All `data-param-*` attributes (except `data-param-autoplay` and `data-param-loop`) will be passed as query parameters to the YouTube iframe source URL.

For example:

```html
<amp-youtube
  data-videoid="Z1q71gFeRqM"
  data-param-controls="1"
></amp-youtube>
```

Results in:

```
https://www.youtube.com/embed/Z1q71gFeRqM?controls=1&enablejsapi=1&...
```

\[tip type="note"]
Use the `autoplay` and `loop` AMP attributes instead of `data-param-autoplay` and `data-param-loop`, since AMP manages those behaviors internally.
\[/tip]

### dock

Requires [`amp-video-docking`](../../amp-video-docking/amp-video-docking.md). If this attribute is present and the video is playing manually, it will "dock" to a corner when the user scrolls out of view.

### credentials (optional)

Defines a `credentials` option as per the [Fetch API](https://fetch.spec.whatwg.org/):

* Supported values: `omit`, `include`
* Default: `include`

Setting `omit` enables YouTube's [privacy-enhanced mode](https://support.google.com/youtube/answer/171780?hl=en).

### title (optional)

Defines the `title` for the embedded iframe. Defaults to `"YouTube video"`.

### common attributes

This element includes [common AMP attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes).

---

## Validation

See [`amp-youtube` validator rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-youtube/validator-amp-youtube.protoascii).

---
