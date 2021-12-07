# Bento Youtube

Embeds [Youtube](https://youtube.com) videos.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/youtube
```

```javascript
import {defineElement as defineBentoYoutube} from '@bentoproject/youtube';
defineBentoYoutube();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-youtube-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-youtube-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-youtube-1.0.css" crossorigin="anonymous">
```

### Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-youtube-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-youtube-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-youtube-1.0.css"
    />
    <style>
      bento-youtube {
        width: 320px;
        height: 180px;
      }
    </style>
  </head>
  <body>
    <bento-youtube data-videoid="dQw4w9WgXcQ"></bento-youtube>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-youtube-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-youtube {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-youtube` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-youtube {
  height: 100px;
  width: 100%;
}
```

### Attributes

<table>
  <tr>
    <td width="40%"><strong>autoplay (optional)</strong></td>
    <td>
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
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>loop (optional)</strong></td>
    <td>If this attribute is present, the video or playlist will play again (from the beginning) once it ends.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid (optional)</strong></td>
    <td>
      The YouTube video id found in every YouTube video page URL.
      <br/>
      For example, in this URL: <code>https://www.youtube.com/watch?v=Z1q71gFeRqM</code>, <code>Z1q71gFeRqM</code> is the video id.
      <br/>
      If <code>data-videoid</code> is not provided, <code>data-live-channelid</code> should be provided.
    </td>  
  </tr>
  <tr>
    <td width="40%"><strong>data-live-channelid</strong></td>
    <td>
      The Youtube channel id that provides a stable livestream url. For example, in this URL: <code>https://www.youtube.com/embed/live_stream?channel=UCB8Kb4pxYzsDsHxzBfnid4Q</code>, <code>UCB8Kb4pxYzsDsHxzBfnid4Q</code> is the channel id.
      <br />
      You can provide a <code>data-live-channelid</code> instead of a <code>data-videoid</code> attribute to embed a stable url for a live stream instead of a video. Channels do not come with default placeholders. You can provide a placeholder for the video per example 2 above.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-* (optional)</strong></td>
    <td>
      All <code>data-param-*</code> attributes (with the exception of <code>data-param-autoplay</code> and <code>data-param-loop</code>) will be added as query parameter to the YouTube iframe src. This may be used to pass custom values through to YouTube plugins, such as whether to show controls.
      <br />
      Keys and values will be URI encoded. Keys will be camel cased.
      <br />
      See <a href="https://developers.google.com/youtube/player_parameters">YouTube Embedded Player Parameters</a>.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>credentials (optional)</strong></td>
    <td>
      Defines a `credentials` option as specified by the <a href="https://fetch.spec.whatwg.org/">Fetch API</a>. (<code>omit</code> or <code>include</code>)
      <br/>
      If you want to use the <a href="http://www.google.com/support/youtube/bin/answer.py?answer=141046">YouTube player in privacy-enhanced mode</a>, pass the value of `omit`.
      <br/>
      Usually YouTube sets its cookies when the player is loaded. In privacy-enhanced mode cookies are set when the user has clicked on the player.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>
      Defines a <code>title</code> attribute for the component to propagate to the underlying <code>&gt;iframe></code> element. The default value is <code>"YouTube video"</code>.
    </td>
  </tr>
</table>

### Interactivity and API usage

The `bento-youtube` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-video');
const api = await carousel.getApi();
```

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-youtube-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-youtube-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-youtube-1.0.css"
    />
    <style>
      bento-youtube {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-youtube id="my-video" data-videoid="dQw4w9WgXcQ">
    </bento-youtube>
    <p>
      <button id="play">Play</button>
      <button id="pause">Pause</button>
      <button id="mute">Mute</button>
      <button id="unmute">Unmute</button>
    </p>
    <script>
      (async () => {
        await customElements.whenDefined('amp-youtube');

        const video = document.querySelector('#my-video');
        const api = await video.getApi();

        document.querySelector('#play').onclick = () => {
          api.play();
        };
        document.querySelector('#pause').onclick = () => {
          api.pause();
        };
        document.querySelector('#mute').onclick = () => {
          api.mute();
        };
        document.querySelector('#unmute').onclick = () => {
          api.unmute();
        };
      })();
    </script>
  </body>
</html>
```

#### Actions

The `bento-youtube` API allows you to perform the following actions:

##### `play()`

Plays the video.

```js
api.play();
```

##### `pause()`

Pauses the video.

```js
api.pause();
```

##### `mute()`

Mutes the video.

```js
api.mute();
```

##### `unmute()`

Unmutes the video.

```js
api.unmute();
```

##### `requestFullscreen()`

Expands the video to fullscreen when possible.

```js
api.requestFullscreen();
```

#### Properties

It also exposes the following read-only properties:

##### `currentTime` (`number`)

The current playback time in seconds.

```js
console.log(api.currentTime);
```

##### `duration` (`number`)

The video's duration in seconds, when it's known (e.g. is not a livestream).

```js
console.log(api.duration);
```

##### `autoplay` (`boolean`)

Whether the video autoplays.

```js
console.log(api.autoplay);
```

##### `controls` (`boolean`)

Whether the video shows controls.

```js
console.log(api.controls);
```

##### `loop` (`boolean`)

Whether the video loops.

```js
console.log(api.loop);
```

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/youtube
```

```javascript
import React from 'react';
import {BentoYoutube} from '@bentoproject/youtube/react';
import '@bentoproject/youtube/styles.css';

function App() {
  return <BentoYoutube videoid="dQw4w9WgXcQ" />;
}
```

### Layout and style

#### Container type

The `BentoYoutube` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoYoutube
  style={{width: 320, height: 180}}
  videoid="dQw4w9WgXcQ"
/>
```

Or via `className`:

```jsx
<BentoYoutube
  className="custom-styles"
  videoid="dQw4w9WgXcQ"
/>
```

```css
.custom-styles {
  height: 320px;
  width: 180px;
}
```

## Props

<table>
  <tr>
    <td width="40%"><strong>autoplay (optional)</strong></td>
    <td>
      If this prop is true, and the browser supports autoplay:
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
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>loop (optional)</strong></td>
    <td>If this prop is true, the video or playlist will play again (from the beginning) once it ends.</td>
  </tr>
  <tr>
    <td width="40%"><strong>videoid (optional)</strong></td>
    <td>
      The YouTube video id found in every YouTube video page URL.
      <br/>
      For example, in this URL: <code>https://www.youtube.com/watch?v=Z1q71gFeRqM</code>, <code>Z1q71gFeRqM</code> is the video id.
      <br/>
      If <code>videoid</code> is not provided, <code>liveChannelid</code> should be provided.
    </td>  
  </tr>
  <tr>
    <td width="40%"><strong>liveChannelid</strong></td>
    <td>
      The Youtube channel id that provides a stable livestream url. For example, in this URL: <code>https://www.youtube.com/embed/live_stream?channel=UCB8Kb4pxYzsDsHxzBfnid4Q</code>, <code>UCB8Kb4pxYzsDsHxzBfnid4Q</code> is the channel id.
      <br />
      You can provide a <code>liveChannelid</code> instead of a <code>videoid</code> prop to embed a stable url for a live stream instead of a video. Channels do not come with default placeholders. You can provide a placeholder for the video per example 2 above.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>params (optional)</strong></td>
    <td>
      All fields in this object (with the exception of <code>autoplay</code> and <code>loop</code>) will be added as query parameters to the YouTube iframe src. This may be used to pass custom values through to YouTube plugins, such as whether to show controls.
      <br />
      Keys and values will be URI encoded. Keys should be camel cased.
      <br />
      See <a href="https://developers.google.com/youtube/player_parameters">YouTube Embedded Player Parameters</a>.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>credentials (optional)</strong></td>
    <td>
      Defines a `credentials` option as specified by the <a href="https://fetch.spec.whatwg.org/">Fetch API</a>. (<code>omit</code> or <code>include</code>)
      <br/>
      If you want to use the <a href="http://www.google.com/support/youtube/bin/answer.py?answer=141046">YouTube player in privacy-enhanced mode</a>, pass the value of `omit`.
      <br/>
      Usually YouTube sets its cookies when the player is loaded. In privacy-enhanced mode cookies are set when the user has clicked on the player.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>
      Defines a <code>title</code> attribute for the component to propagate to the underlying <code>&gt;iframe></code> element. The default value is <code>"YouTube video"</code>.
    </td>
  </tr>
</table>

### Interactivity and API usage

The `BentoYoutube` component API is accessible by passing a `ref`:

```javascript
import React, {createRef} from 'react';

function App() {
  const ref = createRef();
  return (
    <BentoYoutube ref={ref} />
  );
}
```

#### Actions

The `BentoYoutube` API allows you to perform the following actions:

##### `play()`

Plays the video.

```js
ref.current.play();
```

##### `pause()`

Pauses the video.

```js
ref.current.pause();
```

##### `mute()`

Mutes the video.

```js
ref.current.mute();
```

##### `unmute()`

Unmutes the video.

```js
ref.current.unmute();
```

##### `requestFullscreen()`

Expands the video to fullscreen when possible.

```js
ref.current.requestFullscreen();
```

#### Properties

It also exposes the following read-only properties:

##### `currentTime` (`number`)

The current playback time in seconds.

```js
console.log(ref.current.currentTime);
```

##### `duration` (`number`)

The video's duration in seconds, when it's known (e.g. is not a livestream).

```js
console.log(ref.current.duration);
```

##### `autoplay` (`boolean`)

Whether the video autoplays.

```js
console.log(ref.current.autoplay);
```

##### `controls` (`boolean`)

Whether the video shows controls.

```js
console.log(ref.current.controls);
```

##### `loop` (`boolean`)

Whether the video loops.

```js
console.log(ref.current.loop);
```
