# amp-video-iframe

## Integration

The document living inside your framoe must include a small library:

```html
<script async src="https://cdn.ampproject.org/v0/video-iframe-integration-0.1.js">

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

If you're using a common video framework like JwPlayer, you can
simply call `listenTo` for a basic integration:

```js
// For JwPlayer:
function onAmpIntegrationReady(ampIntegration) {
  var myVideo = jwplayer('#my-video');
  ampIntegration.listenTo('jwplayer', myVideo);
}
```

### Custom integrations

It's possible to have more fine-grained control over how the video interacts
with the host document by using the `method` and `postEvent` methods.

#### `method(name, callback)`

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

#### `postEvent(name)`

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

