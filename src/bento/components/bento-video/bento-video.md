---
$category@: media
formats:
  - websites
teaser:
  text: Replaces the HTML5 video tag.
experimental: true
bento: true
---

# bento-video

## Usage

A replacement for the HTML5 `video` tag; only to be used for direct HTML5 video file embeds.

The `bento-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. You can control an `bento-video` component much the same way as a standard HTML5 `<video>` tag.

The `bento-video` component accepts up to four unique types of HTML nodes as children:

-   `source` tags: Just like in the HTML `<video>` tag, you can add `<source>` tag children to specify different source media files to play.
-   `track` tags to enable subtitles in the video. If the track is hosted on a different origin than the document, you must add the `crossorigin` attribute to the `<bento-video>` tag. Whenever the video has narration or important audio information, make sure to include subtitles/captions for users who may not be able to hear it or have their sound turned off.
-   a placeholder for before the video starts
-   a fallback if the browser doesn’t support HTML5 video: One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that displays if HTML5 video is not supported on the user’s browser.

[example preview="inline" playground="true" imports="bento-video:1.0"]

```html
<bento-video {% if format=='stories'%}autoplay {% endif %}controls
  width="640"
  height="360"
  layout="responsive"
  poster="{{server_for_email}}/static/inline-examples/images/kitten-playing.png">
  <source src="{{server_for_email}}/static/inline-examples/videos/kitten-playing.webm"
    type="video/webm" />
  <source src="{{server_for_email}}/static/inline-examples/videos/kitten-playing.mp4"
    type="video/mp4" />
  <div fallback>
    <p>This browser does not support the video element.</p>
  </div>
</bento-video>
```

[/example]

#### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Interactivity and API usage

Bento components are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `bento-video` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined('bento-video');
const videoHandle = await video.getApi();
```

##### Actions

The `bento-video` API allows you to perform the following actions:

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

## Attributes

### src

Required if no `<source>` children are present. Must be HTTPS.

### poster

The image for the frame to be displayed before video playback has started. By
default, the first frame is displayed.

Alternatively, you can present a click-to-play overlay.

### autoplay

If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, [which are outlined in the Video in AMP spec](../../../../docs/spec/amp-video-interface.md#autoplay).

### controls

This attribute is similar to the `controls` attribute in the HTML5 `video`. If this attribute is present, the browser offers controls to allow the user to control video playback.

### controlsList

Same as [controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList) attribute of HTML5 video element. Only supported by certain browsers.

### loop

If present, the video will automatically loop back to the start upon reaching the end.

### crossorigin

Required if a `track` resource is hosted on a different origin than the document.

### disableremoteplayback

Determines whether the media element is allowed to have a remote playback UI such as Chromecast or AirPlay.

### muted (deprecated)

The `muted` attribute is deprecated and no longer has any effect. The `autoplay` attribute automatically controls the mute behavior.

### noaudio

Annotates the video as having no audio. This has the following effects:

-   An equalizer icon will **not** be drawn when setting [`autoplay`](#autoplay).

-   An `<amp-story>` that includes this video will **not** draw an unnecessary mute button.

### rotate-to-fullscreen

If the video is visible, the video displays fullscreen after the user rotates their device into landscape mode. For more details, see the [Video in AMP spec](../../../../docs/spec/amp-video-interface.md#rotate-to-fullscreen).

This attribute can be configured to based on a [media query](./../../../../docs/spec/amp-html-responsive-attributes.md).

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

### Media Session API attributes

The `amp-video` component implements the [Media Session API](https://developers.google.com/web/updates/2017/02/media-session), which enables developers to specify more information about the video file. The additional information for the video displays in the notification center of the user's device (along with the play/pause controls).

This example contains both the `poster` and `artwork` attributes. The `poster` serves as the placeholder image before the video plays, while `artwork` is the image that displays in the notification via the MediaSession API.

```html
<bento-video
  width="720"
  height="305"
  layout="responsive"
  src="https://yourhost.com/videos/myvideo.mp4"
  poster="https://yourhost.com/posters/poster.png"
  artwork="https://yourhost.com/artworks/artwork.png"
  title="Awesome video"
  artist="Awesome artist"
  album="Amazing album"
>
</bento-video>
```

#### artwork

Specifies a URL to a PNG/JPG/ICO image serving as the video's artwork. If `artwork` is not present, the Media Session API helper uses either the `image` field in the `schema.org` definition, the `og:image`, or the website's `favicon`.

#### artist

Indicates the author of the video file, specified as a string.

#### album

Indicates the album/collection the video was taken from, specified as a string.

#### title

Indicates the name/title of the video, specified as a string. If not provided, the Media Session API helper uses either the `aria-label` attribute or falls back to the page's title.

## Analytics

`bento-video` supports analytics out of the box. See [video analytics](../../../../extensions/amp-analytics/amp-video-analytics.md) for more information.

## Styling

### Click-to-Play overlay

Providing a click-to-play overlay is a common UX feature for video players on the web. For example, you could display a custom play icon that the user can click, as well as include the title of the video, different sized poster images, and so on. Because the `bento-video` component supports the standard `play` AMP action, you can easily implement click-to-play.
