---
$category@: media
formats:
  - websites
teaser:
  text: Displays a YouTube video.
experimental: true
bento: true
---

# amp-youtube

## Usage

Displays a YouTube video.

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-youtube
  data-videoid="mGENRKrdoGY"
  layout="responsive"
  width="480"
  height="270"
></amp-youtube>
```

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

#### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-youtube-1.0.css">
  <script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-1.0.js"></script>
</head>
<body>
  <amp-youtube
    style="aspect-ratio: 16/9"
    id="my-youtube-video"
    data-videoid="mGENRKrdoGY"
  ></amp-youtube>
  <script>
    (async () => {
      const video = document.querySelector('#my-youtube-video');
      await customElements.whenDefined('amp-youtube');
      const videoHandle = await video.getApi();

      // programatically call playback actions
      videoHandle.play();
      videoHandle.pause();
      videoHandle.requestFullscreen();
      videoHandle.mute();
      videoHandle.unmute();

      // get video state
      console.log({
        autoplay: videoHandle.autoplay,
        controls: videoHandle.controls,
        duration: videoHandle.duration,
        currentTime: videoHandle.currentTime,
        loop: videoHandle.loop,
      })
    })();
  </script>
</body>
```

[/example]

#### Interactivity and API usage

Bento are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-youtube` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined('amp-youtube');
const videoHandle = await video.getApi();
```

##### Actions

The `amp-youtube` API allows you to perform the following actions:

##### `play()`

Plays the video.

```js
videoHandle.play();
```

##### `pause()`

Pauses the video.

```js
videoHandle.pause();
```

##### `mute()`

Mutes the video.

```js
videoHandle.mute();
```

##### `unmute()`

Unmutes the video.

```js
videoHandle.unmute();
```

##### `requestFullscreen()`

Expands the video to fullscreen when possible.

```js
videoHandle.requestFullscreen();
```

#### Properties

It also exposes the following read-only properties:

##### `currentTime` (`number`)

The current playback time in seconds.

```js
console.log(videoHandle.currentTime);
```

##### `duration` (`number`)

The video's duration in seconds, when it's known (e.g. is not a livestream).

```js
console.log(videoHandle.duration);
```

##### `autoplay` (`boolean`)

Whether the video autoplays.

```js
console.log(videoHandle.autoplay);
```

##### `controls` (`boolean`)

Whether the video shows controls.

```js
console.log(videoHandle.controls);
```

##### `loop` (`boolean`)

Whether the video loops.

```js
console.log(videoHandle.loop);
```

### Migrating from 0.1

The experimental `1.0` version of `amp-youtube` does not automatically convert `data-param-controls` to `controls`. Instead it takes `controls` directly as an attribute.

## Attributes

### autoplay

If this attribute is present, and the browser supports autoplay:

<ul>
  <li>the video is automatically muted before autoplay starts
  </li>
  <li>when the video is scrolled out of view, the video is paused
  </li>
  <li>when the video is scrolled into view, the video resumes playback
  </li>
  <li>when the user taps the video, the video is unmuted
  </li>
  <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.
  </li>
</ul>

### loop

If this attribute is present, the video or playlist will play again (from the beginning) once it ends.

### data-videoid

The YouTube video id found in every YouTube video page URL.

For example, in this URL: `https://www.youtube.com/watch?v=Z1q71gFeRqM`, `Z1q71gFeRqM` is the video id.

### data-live-channelid

The Youtube channel id that provides a stable livestream url. For example, in this URL: `https://www.youtube.com/embed/live_stream?channel=UCB8Kb4pxYzsDsHxzBfnid4Q`, `UCB8Kb4pxYzsDsHxzBfnid4Q` is the channel id. You can provide a `data-live-channelid` instead of a `data-videoid` attribute to embed a stable url for a live stream instead of a video. Channels do not come with default placeholders. You can provide a placeholder for the video per example 2 above.

### data-param-\*

All `data-param-*` attributes (with the exception of `data-param-autoplay` and `data-param-loop`) will be added as query parameter to the YouTube iframe src. This may be used to pass custom values through to YouTube plugins, such as whether to show controls.

Keys and values will be URI encoded. Keys will be camel cased

### controls

See [YouTube Embedded Player Parameters](https://developers.google.com/youtube/player_parameters) for more parameter options for YouTube.

[tip type="note"]
Use the `autoplay` attribute instead of `data-param-autoplay` and the `loop` attribute instead of `data-param-loop` since both the autoplay and looping behaviors are handled internally by AMP instead of the Youtube player.
[/tip]

### credentials (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

-   Supported values: `omit`, `include`
-   Default: `include`

If you want to use the [YouTube player in privacy-enhanced mode](http://www.google.com/support/youtube/bin/answer.py?answer=141046), pass the value of `omit`.

Usually YouTube sets its cookies when the player is loaded. In privacy-enhanced mode cookies are set when the user has clicked on the player.

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"YouTube video"`.

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.
