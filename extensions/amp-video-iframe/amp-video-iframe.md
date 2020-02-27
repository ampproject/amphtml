---
$category@: media
formats:
  - websites
teaser:
  text: Embeds a video player within an iframe.
---

<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# amp-video-iframe

[TOC]

Embeds a video player within an [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).

<table>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-video-iframe" src="https://cdn.ampproject.org/v0/amp-video-iframe-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, responsive</td>
  </tr>
</table>

## Usage

Use `<amp-video-iframe>` to embed a video player that has no stand-alone AMP component or to embed your own custom JavaScript-based video player. See the list of [third-party stand-alone components here](../../spec/amp-video-interface.md#for-3rd-party-services). 

The example below demonstrates how to use `amp-video-iframe` in your AMP document:

```html
<amp-video-iframe
  layout="responsive"
  width="16"
  height="9"
  src="/my-video-player.html"
  poster="/my-video-poster.jpg"
>
</amp-video-iframe>
```

The `src` attribute points to `my-video-player.html`, the inner document loaded inside the iframe. This document plays the video. It must include and bootstrap an [integration script](../../spec/amp-video-interface.md). The integration script allows `<amp-video-iframe>` to coordinate the video's playback.

The `<amp-video-iframe>` component differs from [`<amp-iframe>`](../amp-iframe/amp-iframe.md) and non-AMP iframeas in the following ways:

- `<amp-video-iframe>` implements all [video features](../../spec/amp-video-interface.md). Features include but are not limited to autoplay, minimize-to-corner and rotate-to-fullscreen.
- `<amp-video-iframe>` must request resources via HTTPS.
- `<amp-video-iframe>` is not scrollable.
- `<amp-video-iframe>` enforces sandboxing to itself and child iframes. This discourages misuse of <amp-video-iframe> as a means for advertising. 

### <a id="integration"></a> Video player integration

The `<amp-video-iframe>` component requires the embedded html document to include the [video-iframe-integration library](../../src/video-iframe-integration.js). The library is separate from the component's required script. This is because the embedded html document is non-AMP and iframed.

```html
<script
  async
  src="https://cdn.ampproject.org/video-iframe-integration-v0.js"
></script>

<!-- Wait for API to initialize -->
<script>
  (window.AmpVideoIframe = window.AmpVideoIframe || []).push(
    onAmpIntegrationReady
  );

  function onAmpIntegrationReady(ampIntegration) {
    // `ampIntegration` is an object containing the tools required to integrate.
    // This callback specifies how the AMP document and the iframed video document
    // talk to each other.
    // YOU NEED TO IMPLEMENT THIS. See below.
  }
</script>
```

Provide a callback that specifies how the AMP document and the iframes video document communicate. You must implement a set of playback methods and event dispatchers to sync the documents together. Implement support by:

- Using an existing [third party provided readymade integration](#third-party-readymade-integrations).
- Writing a [custom integration](#custom-integrations) if your solution doesn't use supported tools.
- [Contributing a third party integration](#contributing-a-third-party-integration) for future use.  

#### Third party readymade integrations

Third party video frameworks contributed their integrations for use with `<amp-video-iframe>`.

##### [JwPlayer](https://developer.jwplayer.com/jwplayer/docs)

Pass your [`jwplayer` instance object](https://developer.jwplayer.com/jw-player/docs/javascript-api-reference/)
through the signature `amp.listenTo('jwplayer', myJwplayer)`. The `amp` object sets up the player through the instance API.

```js
(window.AmpVideoIframe = window.AmpVideoIframe || []).push(amp => {
  amp.listenTo('jwplayer', jwplayer('my-video'));
});
```

Default supported events: 

- `ad_end`
- `ad_start`
- `canplay`
- `error`
- `muted`
- `pause`
- `playing`
- `unmuted`

Default supported methods: 

- `fullscreenenter`
- `fullscreenexit`
- `hidecontrols`
- `mute`
- `pause`
- `play`
- `showcontrols`
- `unmute`

##### [Video.js](https://videojs.com/)

Pass your [`<video>` element](https://docs.videojs.com/docs/api/player.html)
through the signature `ampIntegration.listenTo('videojs', myVideo)`. Video.js overloads this element to provide methods
that the `ampIntegration` object uses to setup the player.

```js
function onAmpIntegrationReady(ampIntegration) {
  var myVideo = document.querySelector('#my-video');
  ampIntegration.listenTo('videojs', myVideo);
}
```

`listenTo` initializes the Video.js instance on the `<video>` element if required. This uses the global `videojs` function by default. If your page provides the initializer differently, you must pass it in as the third argument:

```js
(window.AmpVideoIframe = window.AmpVideoIframe || []).push(amp => {
  // Initializes player using `myVideojsInitializer(myVideo)`
  const myVideo = document.querySelector('#my-video');
  amp.listenTo('videojs', myVideo, myVideojsInitializer);
});
}
```

Default supported events: 

- `canplay`
- `ended`
- `muted`
- `pause`
- `playing`
- `unmuted`

Default supported methods: 

- `fullscreenenter`
- `fullscreenexit`
- `hidecontrols`
- `mute`
- `pause`
- `play`
- `showcontrols`
- `unmute`

#### Custom integrations

You can create a custom implementation for your solution to communicate with `<amp-video-iframe>`. 

The following communication methods are available:

- [`method()`](#method) to control playback.
- [`postEvent()`](#postEvent) to inform the host document about playback events.
- [`getIntersection`](#getIntersection) to get video's viewability on the host document.
- [`getMetadata`](#getMetadata) to get information about the host document.

##### <a name="method"></a> `method(name, callback)`

Implements a method that calls playback functions on the video. For example:

```js
ampIntegration.method('play', function() {
  myVideo.play();
});
```

You should implement these methods:

- `play`
- `pause`
- `mute`
- `unmute`
- `showcontrols`
- `hidecontrols`
- `fullscreenenter`
- `fullscreenexit`

Enabling playback [actions](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events/#video-elements) require specific methods:

- `element.play`: `method('play', ...)`
- `element.pause`: `method('pause', ...)`
- `element.mute`: `method('mute', ...)`
- `element.unmute`: `method('unmute', ...)`
- `element.fullscreen`: `method('fullscreenenter', ...)`

Use of `autoplay` requires `play`, `pause`, `mute` and `unmute`.

When minimizing the video to the corner, it displays a custom controls overlay. Use `showcontrols` and `hidecontrols` for the best possible user experience and avoid showing two sets of controls. 

Allow users to enter and exit fullscreen viewing by enabling `fullscreenenter` and `fullscreenexit`.

##### <a name="postEvent"></a> `postEvent(name)`

Posts a playback event to the frame. For example:

```js
myVideoElement.addEventListener('pause', function() {
  ampIntegration.postEvent('pause');
});
```

The valid events are as follows.

<table>
  <thead>
    <tr>
      <td>Event</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>canplay</code></td>
      <td>
        Triggered when your player is ready. This event must be posted before
        the player can become interactive.
      </td>
    </tr>
    <tr>
      <td><code>playing</code></td>
      <td>
        Triggered when your player has started playing a video after load or
        pause.
      </td>
    </tr>
    <tr>
      <td><code>pause</code></td>
      <td>
        Triggered when your video has been paused.
      </td>
    </tr>
    <tr>
      <td><code>ended</code></td>
      <td>
        Triggered when your video has ended playback. Note that you must also
        post a <code>pause</code> event alongside the <code>ended</code> event.
      </td>
    </tr>
    <tr>
      <td><code>muted</code></td>
      <td>
        Triggered when your video has been muted.
      </td>
    </tr>
    <tr>
      <td><code>unmuted</code></td>
      <td>
        Triggered when your video has been unmuted.
      </td>
    </tr>
    <tr>
      <td><code>ad_start</code></td>
      <td>
        Triggered when a pre/mid/post-roll ad is playing. This hides the
        autoplay shim displayed on the video.
      </td>
    </tr>
    <tr>
      <td><code>ad_end</code></td>
      <td>
        Triggered when a pre/mid/post-roll ad has ended. This re-displays the
        autoplay shim if the user has not yet interacted with the video.
      </td>
    </tr>
  </tbody>
</table>

##### <a name="postAnalyticsEvent"></a> `postAnalyticsEvent(eventType[, vars])`

Posts a custom analytics event, trackable by [`amp-analytics`](../amp-analytics/amp-analytics.md). 

All `eventType` must have a `video-custom-` prefix. This prevents naming collisions with other analytics event types:

```js
amp.postAnalyticsEvent('video-custom-foo');
```

You may use the optional `vars` param to define an object with custom logging variables. These are available as `VIDEO_STATE`, keyed by name prefixed with `custom_`.

```js
amp.postAnalyticsEvent('video-custom-bar', {baz: 'my value'});
```

In the example above, the object `{baz: 'my value'}` is available as `{'custom_baz': 'myValue'}`.

##### <a name="getIntersection"></a> `getIntersection(callback)`

Gets the intersection ratio, between 0 and 1, for the video element in the host document. This is useful for viewability information:

```js
// Will log intersection every 2 seconds
setInterval(() => {
  amp.getIntersection(intersection => {
    console.log('Intersection ratio:', intersection.intersectionRatio);
  });
}, 2000);
```

The function executes the passed `callback` with an object that looks like the following:

```js
{
  time: 33333.33,
  intersectionRatio: 0.761,
}
```

Consider this a low-fidelity reading. Currently, the value for `intersectionRatio` will be 0 as long as the video is under 50% visible. This value is bound to change at any time, and may delay the callbacks or debounced them.


##### <a name="getMetadata"></a> `getMetadata()`

Returns an object containing metadata about the host document:

```js
const {canonicalUrl, sourceUrl} = amp.getMetadata();
```

This object contains fields for the host's [canonical and source URLs](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/discovery/):

```json
{
  "canonicalUrl": "foo.html",
  "sourceUrl": "bar.html"
}
```

#### Contributing a third party integration

If you have a video library and do not have a custom video player component, you can contribute a readymade `<amp-video-iframe>` integration. 


Requirements to contribute to `<amp-video-iframe>`:

- Host a generic integration document. This document references videos with URL parameters. Developers using `<amp-video-iframe>` do not need to provide the inner player document themselves. 
- Append `src` and `poster` URLS with the `data-param-*` attributes as query string.
- The `html` document hosted by `<amp-video-iframe>` bootstraps the [integration script](../../src/video-iframe-integration.js). This enables the AMP document to coordinate with the player. 

```html
<!--
  data-param-* attributes are added to src and poster, so this would use the
  following composed urls:

  src: https://vendor.example/amp-video-iframe
      ?videoid=MY_VIDEO_ID
      &channelid=MY_CHANNEL_ID

  poster: https://vendor.example/poster.jpg
      ?videoid=MY_VIDEO_ID
      &channelid=MY_CHANNEL_ID
-->
<amp-video-iframe
  layout="responsive"
  width="16"
  height="9"
  src="https://vendor.example/amp-video-iframe"
  poster="https://vendor.example/poster.jpg"
  data-param-videoid="MY_VIDEO_ID"
  data-param-channelid="MY_CHANNEL_ID"
>
</amp-video-iframe>
```

For most video providers, `<amp-video-iframe>` provides enough tools for common playback actions. See methods and events to confirm. Refer to the  vendor player spec to confirm amp-video-iframe fits your needs. 

### Disallowed usage of `<amp-video-iframe>`

Use `<amp-video-iframe>` to embed a video player. Do not use it to embed a video directly or for advertisement purposes. 

#### Embed a video directly 

Use [`<amp-video>`](https://go.amp.dev/c/amp-video) to directly embed a video on the AMP document.

#### Advertising 

Use [`<amp-ad>`](https://go.amp.dev/c/amp-ad) for advertising purposes. `<amp-video-iframe>` may display videos where part of the videos is advertising.

Do not use `<amp-video-iframe>` for the _primary purpose_ of displaying advertising.  This component is not rendered when in violation of this policy. The reasons for this policy:

- `<amp-video-iframe> `enforces sandboxing to itself and child iframes. This means landing pages may break, even if the ad itself appears to work.

- `<amp-video-iframe>` has no controlled resize mechanism.



## Attributes

### `src`

Point the `src` attribute to the video.

The `src` attribute behaves like on a standard iframe with one exception. The `<amp-video-iframe>` component appends the `#amp=1` fragment the URL. This tells documents they are embedded within the AMP context. This fragment is only added if the URL specified by `src` does not already have a fragment. 

### `poster`

Points to an image URL. The `<amp-video-iframe>` component displays this image while the video loads.

### `autoplay` (optional)

Adding this attribute plays the video automatically, in supported browsers, when it is visible to the user. You must meet the conditions outlined in the [Video in AMP spec](../..//spec/amp-video-interface.md#autoplay). 

### `dock` (optional)

Adding this attribute minimizes and fixes a manually played video to the corner of the screen, or specified element, as the user scrolls. 

This behavior requires dual use of the [`<amp-video-docking>`](../amp-video-docking/amp-video-docking.md) component. 

### `implements-media-session` (optional)

Include the `implements-media-session` attribute if the document inside the iframe implements the [MediaSession API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) independently.

### `implements-rotate-to-fullscreen` (optional)

Include the `mplements-rotate-to-fullscreen` attribute if the document inside the iframe implements rotate-to-fullscreen independently.

### `referrerpolicy` (optional)

Use the `referrerpolicy` attribute to set a [referrerpolicy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/referrerPolicy) on the iframe element.

### `data-param-*` (optional)

The `data-param-*` attributes are added as query parameters to the `src` attributes of the `iframe` and the `poster` image. They may be used to pass custom values through to the player document.

Keys and values will be URI encoded. Keys will be camel cased:

- `data-param-foo="bar"` becomes `&foo=bar`
- `data-param-channel-id="SOME_VALUE"` becomes `&channelId=SOME_VALUE`

### common attributes

AMP's [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) are available to the `<amp-video-iframe>` component.

## Actions

### `play`

Plays the video.

### `pause`

Pauses the video.

### `mute`

Mutes the video.

### `unmute`

Unmutes the video.

### `fullscreen`

Takes the video to fullscreen.


## Events

### `firstPlay` 

The first time the user plays the video, the `firstPlay` event triggers. 

On videos that autoplay, the event fires when the user interacts with the video. 

This event is low-trust, meaning it cannot trigger most actions. It can trigger low-trust actions, such as [amp-animation](../amp-animation/amp-animation.md) actions. 

### `timeUpdate`

When the playing position of a video changes, the `timeUpdate`  event triggers. AMP controls the event frequency and it is currently set at 1 second intervals.

This event is low-trust, meaning it cannot trigger most actions. It can trigger low-trust actions, such as [amp-animation](../amp-animation/amp-animation.md) actions.
