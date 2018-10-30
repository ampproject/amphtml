# <a name="amp-video-iframe"></a> amp-video-iframe

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Displays an iframe containing a video player.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Status</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-video-iframe" src="https://cdn.ampproject.org/v0/amp-video-iframe-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, responsive</td>
  </tr>
</table>


## Behavior

`amp-video-iframe` has several important differences from vanilla iframes and `amp-iframe`.

- By default, an `amp-video-iframe` is sandboxed (see [details](#sandbox)).

- `amp-video-iframe` implements all [Video Features](../../spec/amp-video-interface.md), like autoplay, minimize-to-corner and rotate-to-fullscreen.

- `amp-video-iframe` must only request resources via HTTPS.

- `amp-video-iframe` is not scrollable.


## Usage of amp-video-iframe for advertising

`amp-video-iframe` **must not** be used for the primary purpose of displaying advertising. It is OK to use `amp-video-iframe` for the purpose of displaying videos, where part of the videos are advertising. This AMP policy may be enforced by not rendering the respective iframes.

Advertising use cases should use [`amp-ad`](https://www.ampproject.org/docs/reference/components/amp-ad) instead.


The reasons for this policy are that:

- `amp-video-iframe` enforces sandboxing and the sandbox is also applied to child iframes. This means landing pages may be broken, even if the ad itself appears to work.

- `amp-video-iframe` has no controlled resize mechanism.

## Attributes

##### src (required)

The `src` attribute behaves mainly like on a standard iframe with one exception: the `#amp=1` fragment is added to the URL to allow
source documents to know that they are embedded in the AMP context. This fragment is only added if the URL specified by `src` does
not already have a fragment.

#### poster (required)

Points to an image URL that will be displayed while the video loads.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

#### implements-media-session

Set this attribute if the document inside the iframe implements the [MediaSession API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) independently.

#### implements-rotate-to-fullscreen

Set this attribute if the document inside the iframe implements rotate-to-fullscreen independently.

## Integration

In order for the video integration to work, the document living inside your
frame must include a small library:

```html
<script async src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>

<!-- Wait for API to initialize -->
<script>
(window.AmpVideoIframe = window.AmpVideoIframe || [])
    .push(onAmpIntegrationReady);

function onAmpIntegrationReady(ampIntegration) {
  // `ampIntegration` is an object containing the tools required to integrate.
}
</script>
```

### Simple integrations

If you're using a common video framework like JwPlayer or Video.js, you can
simply call `listenTo` for a basic integration:

##### For JwPlayer:

```js
function onAmpIntegrationReady(ampIntegration) {
  var myVideo = jwplayer('my-video');
  ampIntegration.listenTo('jwplayer', myVideo);
}
```

##### For Video.js:

```js
function onAmpIntegrationReady(ampIntegration) {
  var myVideo = document.querySelector('#my-video');
  ampIntegration.listenTo('videojs', myVideo);
}
```

### Custom integrations

It's possible to have more fine-grained control over how the video interacts
with the host document by using the following methods:

- [`method`](#method)
- [`postEvent`](#postEvent)
- [`getIntersection`](#getIntersection)
- [`getMetadata`](#getMetadata)

#### <a name="method"></a> `method(name, callback)`

Implements a method that calls playback functions on the video. For example:

```js
ampIntegration.method('play', function() {
  myVideo.play();
});
```

These are methods that should be implemented:

- `play`
- `pause`
- `mute`
- `unmute`
- `showcontrols`
- `hidecontrols`
- `fullscreenenter`
- `fullscreenexit`

You can choose to only implement this interface partially, with a few caveats:

- `mute` and `unmute` are required for autoplay.

- `showcontrols` and `hidecontrols` are required for the best possible UX. For
  example, when minimizing the video to the corner, a custom controls overlay is
  shown. If you don't provide methods to hide and show controls, two sets of
  controls could be displayed at the same time, which is a poor user experience.

- `fullscreenenter` and `fullscreenexit` are required for best possible UX. For
  example, for `rotate-to-fullscreen` or the fullscreen button on minimized
  video.

#### <a name="postEvent"></a> `postEvent(name)`

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

#### <a name="postAnalyticsEvent"></a> `postAnalyticsEvent(eventType[, vars])`

Posts a custom analytics event to be consumed by `amp-analytics`. The
`eventType` must be prefixed with `video-custom-` to prevent naming collisions
with other analytics event types.

This method takes an optional `vars` param that should define an object with
custom variables to log. These are available as `VIDEO_STATE`, keyed by name
prefixed with `custom_`, i.e. the object `{myVar: 'foo'} will be available as
`{'custom_myVar': 'foo}`.

#### <a name="getIntersection"></a> `getIntersection(callback)`

Gets the intersection ratio (between 0 and 1) for the video element. This is useful for viewability information, e.g.

```js
// Will log intersection every 2 seconds
setInterval(function() {
  integration.getIntersection(function(intersection) {
    console.log('Intersection ratio:', intersection.intersectionRatio);
  });
}, 2000);
```

The `callback` passed to the function will be executed with an object that looks
like this:

```json
{"time": 33333.33, "intersectionRatio": 0.761}
```

⚠ This should be considered a low-fidelity reading. Currently, the value for
`intersectionRatio` will be 0 as long as the video is under 50% visible. This
value is bound to change at any time, and the callbacks may be delayed or
debounced.

#### <a name="getMetadata"></a> `getMetadata()`

Returns an object containing metadata about the host document:

```json
{
  "canonicalUrl": "foo.html",
  "sourceUrl": "bar.html",
}
```
