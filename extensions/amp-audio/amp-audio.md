---
$category@: media
bento: true
experimental: true
formats:
  - websites
  - stories
  - ads
teaser:
  text: Replaces the HTML5 audio tag.
---

# amp-audio

## Usage

Use the `amp-audio` components with direct HTML5 audio file embeds.

The `amp-audio` component loads the audio resource specified by its `src` attribute at a time determined by the runtime. It can be controlled in much the same way as a standard HTML5 `audio` tag.
Like all embedded external resources in an AMP file, the audio is "lazily" loaded, only when the `amp-audio` element is in or near the viewport

The `amp-audio` component accepts up to three unique types of HTML nodes as children:

-   `source` tags: Just like in the HTML `<audio>` tag, you can add `<source>` tag children to specify different source media files to play.
-   a placeholder for before the audio starts: One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the audio. A click or tap anywhere inside of the `amp-audio` container will replace the placeholder with the audio itself.
-   a fallback if the browser doesn’t support HTML5 audio: One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that displays if HTML5 audio is not supported on the user’s browser.

For example:

```html
<amp-audio
  width="400"
  height="300"
  src="https://yourhost.com/audios/myaudio.mp3"
>
  <div fallback>
    <p>Your browser doesn’t support HTML5 audio</p>
  </div>
  <source type="audio/mpeg" src="foo.mp3" />
  <source type="audio/ogg" src="foo.ogg" />
</amp-audio>
```

## Attributes

### `src`

Required if no `<source>` children are present. Must be HTTPS.

### `preload`

If present, sets the preload attribute in the html `<audio>` tag which specifies
if the author thinks that the audio file should be loaded when the page loads.

### `autoplay`

If present, the attribute implies that the audio will start playing as soon as
it is ready.

### `loop`

If present, the audio will automatically loop back to the start upon reaching
the end.

### `muted`

If present, will mute the audio by default.

### `controlsList`

Same as
[controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList)
attribute of HTML5 audio element. Only supported by certain browsers. Please
see [https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList)
for details.

### Media Session Attributes

`amp-audio` implements the
[Media Session API](https://developers.google.com/web/updates/2017/02/media-session)
enabling developers to specify more information about the audio file that is
playing to be displayed in the notification center of user's devices (along with
play/pause controls).

Example:

```html
<amp-audio
  width="400"
  height="300"
  src="https://yourhost.com/audios/myaudio.mp3"
  artwork="https://yourhost.com/artworks/artwork.png"
  title="Awesome music"
  artist="Awesome singer"
  album="Amazing album"
>
  <source type="audio/mpeg" src="foo.mp3" />
</amp-audio>
```

#### `artwork`

URL to a PNG/JPG/ICO image serving as the audio's artwork. If not present, the
MediaSessionAPI Helper will use either the `image` field in the `schema.org`
definition, the `og:image` or the website's `favicon`.

#### `artist`

(string) indicates the author of the audio.

#### `album`

(string) indicates the album the audio was taken from.

#### `title`

(string) part of the
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes),
doubles as the audio's name displayed in the MediaSession notification. If not
provided, the MediaSessionAPI Helper will use either the `aria-label` attribute
or fall back to the page's title.

## Analytics

AMP audio analytics gathers data about how users interact with audios in AMP
documents. AMP audio extension issues analytics events during their lifecycle.
These events can be reported through the analytics configuration using `audio-*`
triggers. `audio-play` and `audio-pause` are the two analytics events supported
now.

See the [AMP Analytics component](https://amp.dev/documentation/components/amp-analytics/)
for details on amp-analytics configuration.

### Audio play trigger (`"on": "audio-play"`)

The `audio-play` trigger is fired when the audio begins playing from a user
clicking play or from autoplay beginning or resuming. Use these configurations
to fire a request for this event.

```javascript
"triggers": {
  "audioPlay": {
    "on": "audio-play",
    "request": "event",
    "selector": "#audio1"
  }
}
```

### Audio pause trigger (`"on": "audio-pause"`)

The `audio-pause` trigger is fired when the audio stops playing from a user
clicking pause, from autoplay pausing, or from the audio reaching the end.
Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "audioPause": {
    "on": "audio-pause",
    "request": "event",
    "selector": "#audio1"
  }
}
```

## Validation

See [amp-audio rules](validator-amp-audio.protoascii) in the AMP validator specification.
