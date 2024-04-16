---
$category@: media
formats:
  - websites
teaser:
  text: Embeds an iframe containing a video player.
---

# bento-video-iframe

## When should I use this?

This component is useful if you've built your own Javascript-based
video player and would like to embed it in an AMP document, or if your player is provided by a third party not
supported by the AMP component library.

1. If you'd like to **include a video directly on the AMP document**, you should use [`amp-video`](https://amp.dev/documentation/components/amp-video).

2. If you're using a **common 3rd party** like Youtube, Vimeo or [others supported in AMP](../../../../docs/spec/amp-video-interface.md), you should use their supported component (e.g. [`amp-youtube`](https://amp.dev/documentation/components/amp-youtube), [`amp-vimeo`](https://amp.dev/documentation/components/amp-vimeo)).

3. If you've built a **custom player** or are using one provided by an **unsupported 3rd party**, **you should use `bento-video-iframe`**. This is different from using [`amp-iframe`](https://amp.dev/documentation/components/amp-iframe) in that it enables
   [Video Features on AMP](../../../../docs/spec/amp-video-interface.md). See [behavior](#behavior) below for more details.

4. If you're a **3rd party video vendor**, **you can use `bento-video-iframe`** to [provide a simple way for authors to embed video.](#third-party-video-vendors)

## Behavior

`bento-video-iframe` has several important differences from vanilla iframes and `amp-iframe`.

-   By default, an `bento-video-iframe` is sandboxed.

-   `bento-video-iframe` implements all [Video Features](../../../../docs/spec/amp-video-interface.md), like autoplay, minimize-to-corner and rotate-to-fullscreen.

-   `bento-video-iframe` must only request resources via HTTPS.

-   `bento-video-iframe` is not scrollable.

In short, `bento-video-iframe` plugs AMP video features into an embedded document that hosts a video player.

## Usage of bento-video-iframe for advertising

`bento-video-iframe` **must not** be used for the primary purpose of displaying advertising. It is OK to use `bento-video-iframe` for the purpose of displaying videos, where part of the videos are advertising. This AMP policy may be enforced by not rendering the respective iframes.

Advertising use cases should use [`amp-ad`](https://amp.dev/documentation/components/amp-ad) instead.

The reasons for this policy are that:

-   `bento-video-iframe` enforces sandboxing and the sandbox is also applied to child iframes. This means landing pages may be broken, even if the ad itself appears to work.

-   `bento-video-iframe` has no controlled resize mechanism.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>src (required)</strong></td>
    <td>The <code>src</code> attribute behaves mainly like on a standard iframe with one exception: the <code>#amp=1</code> fragment is added to the URL to allow
source documents to know that they are embedded in the AMP context. This fragment is only added if the URL specified by <code>src</code> does
not already have a fragment.</td>
  </tr>
  <tr>
    <td width="40%"><strong>poster</strong></td>
    <td>URL to an image displayed while the video loads. <strong>It's recommended to always set this attribute for best perceived performance.</strong></td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>implements-media-session</strong></td>
    <td>Set this attribute if the document inside the iframe implements the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API">MediaSession API</a> independently.</td>
  </tr>
  <tr>
    <td width="40%"><strong>implements-rotate-to-fullscreen</strong></td>
    <td>Set this attribute if the document inside the iframe implements rotate-to-fullscreen independently.</td>
  </tr>
  <tr>
    <td width="40%"><strong>referrerpolicy</strong></td>
    <td>The <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/referrerPolicy"><code>referrerpolicy</code></a> to be set on the iframe element.</td>
  </tr>
  <tr>
    <td width="40%"><a id="data-param"></a><strong>data-param-*</strong></td>
    <td>
      All <code>data-param-*</code> attributes are added as query parameters
      to the iframe's <code>src</code>. They may be used to pass custom values
      through to the player document.<br />
      Keys and values will be URI encoded. Keys will be camel cased.
      <ul>
        <li><code>data-param-foo="bar"</code> becomes <code>&foo=bar</code></li>
        <li>
          <code>data-param-channel-id="SOME_VALUE"</code> becomes
          <code>&channelId=SOME_VALUE</code>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Usage

Include an `bento-video-iframe` on your AMP document:

```html
<bento-video-iframe
  layout="responsive"
  width="16"
  height="9"
  src="/my-video-player.html"
  poster="/my-video-poster.jpg"
>
</bento-video-iframe>
```

`my-video-player.html` is the inner document loaded inside the frame that plays the video. This document must include and bootstrap [an integration script](#integration-inside-the-frame) so that the AMP document including the `<bento-video-iframe>` can coordinate the video's playback.

### Third-party video vendors

If you're a vendor that does _not_ provide a [custom video player component](../../../../docs/spec/amp-video-interface.md), you can integrate with AMP in the form of an `bento-video-iframe` configuration, so authors can embed video provided through your service.

Note: For most video providers, `bento-video-iframe` provides enough tools for common playback actions (see [methods](#method) and [events](#postEvent)). Refer to the [vendor player spec](../../../../docs/spec/amp-3p-video.md) for more details on whether you can use `bento-video-iframe` or you should build a third-party player component instead.

As a vendor, you can serve a generic [integration document](#integration-inside-the-frame) that references provided videos via URL parameters. AMP authors who use your video service only need to include an `<bento-video-iframe>` tag in their documents:

```html
<!--
  data-param-* attributes are added to src and poster, so this would use the
  following composed urls:

  src: https://vendor.example/bento-video-iframe
      ?videoid=MY_VIDEO_ID
      &channelid=MY_CHANNEL_ID

  poster: https://vendor.example/poster.jpg
      ?videoid=MY_VIDEO_ID
      &channelid=MY_CHANNEL_ID
-->
<bento-video-iframe
  layout="responsive"
  width="16"
  height="9"
  src="https://vendor.example/bento-video-iframe"
  poster="https://vendor.example/poster.jpg"
  data-param-videoid="MY_VIDEO_ID"
  data-param-channelid="MY_CHANNEL_ID"
>
</bento-video-iframe>
```

The `src` and `poster` URLs are appended with [`data-param-*` attributes as query string](#data-param).

The `/bento-video-iframe` document bootstraps the [integration script](#integration-inside-the-frame) so that the AMP document can coordinate with the player.

Note: If you're a vendor hosting an integration document, feel free to [contribute a code sample to this page,](https://github.com/ampproject/amphtml/blob/main/extensions/amp-video-iframe/amp-video-iframe.md) specifying your provided
`src` and usable `data-param-*` attributes.

## Integration inside the frame

In order for the video integration to work, the embedded document (e.g. `my-video-player.html`) must include a small library:

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

Note that this library is separate from the extension code (`bento-video-iframe-0.1.js`), because
it lives on the non-AMP document that is iframed.

The provided callback specifies how the AMP document and the iframed video document talk to each other. You need to implement a set of
playback methods and event dispatchers to plug these together. For common video frameworks, the integration script
[provides readymade playback support](#readymade-integrations), but you can also [write a custom integration yourself](#custom-integrations) if you don't use any of the tools for which support is available.

{% call callout('Do not autoplay yourself', type='caution') %}
**Never play the video inside the frame automatically.** Instead, you should support the integration script and use the `bento-video-iframe` tag with the `autoplay` attribute. The AMP component will automatically send the necessary signals to your iframe to autoplay for a better user experience.
{% endcall %}

### Readymade integrations

If you're using a common video framework like [JW Player](https://www.jwplayer.com/) or [Video.js](http://videojs.com/), you can call **`listenTo()`** for a basic, readymade integration. These integrations support all playback and UI controls when the framework provides them, see each for supported methods.

{% call callout('Framework APIs', type='note') %}
Depending on which video framework you use, you'll call the `listenTo` method differently. Read on the specific APIs below.
{% endcall %}

{% call callout('Expanded support', type='note') %}
You can additionally use [custom integration methods](#custom-integrations) if you require a feature not available in readymade implementations.
{% endcall %}

##### For JW Player

**Default supported events:** `ad_end`/`ad_start`, `canplay`, `error`, `muted`/`unmuted`, `pause`/`playing`

**Default supported methods:** `pause`/`play`, `mute`/`unmute`, `hidecontrols`/`showcontrols`, `fullscreenenter`/`fullscreenexit`

The `amp` object knows how to setup a JwPlayer instance by using `listenTo('jwplayer')`.
If you're embedding your player [using a video-specific script](https://support.jwplayer.com/articles/how-to-embed-a-jwplayer), you only need to register Jwplayer usage:

```html
<script src="https://cdn.jwplayer.com/players/UVQWMA4o-kGWxh33Q.js"></script>
<script>
  (window.AmpVideoIframe = window.AmpVideoIframe || []).push(function (
    ampIntegration
  ) {
    ampIntegration.listenTo('jwplayer');
  });
</script>
```

Otherwise, pass in your [JwPlayer instance](https://developer.jwplayer.com/jwplayer/docs/jw8-javascript-api-reference)
through the signature `amp.listenTo('jwplayer', instance)`:

```js
(window.AmpVideoIframe = window.AmpVideoIframe || []).push(function (
  ampIntegration
) {
  ampIntegration.listenTo('jwplayer', jwplayer('my-video'));
});
```

##### For Video.js

**Default supported events:** `canplay`, `ended`, `muted`/`unmuted`, `pause`/`playing`

**Default supported methods:** `pause`/`play`, `mute`/`unmute`, `hidecontrols`/`showcontrols`, `fullscreenenter`/`fullscreenexit`

Pass in your [`<video>` element](https://docs.videojs.com/docs/api/player.html)
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
function onAmpIntegrationReady(ampIntegration) {
  var myVideo = document.querySelector('#my-video');

  // ampIntegration initializes player with `myVideojsInitializer(myVideo)`
  ampIntegration.listenTo('videojs', myVideo, myVideojsInitializer);
}
```

### Custom integrations

If you don't use any of the [video frameworks supported by default](#readymade-integrations), you must write a custom implementation to talk to AMP's video management.

These are the communication methods available:

-   [`method`](#method) to control playback.
-   [`postEvent`](#postEvent) to inform the host document about playback events.
-   [`getIntersection`](#getIntersection) to get video's viewability on the host document.
-   [`getMetadata`](#getMetadata) to get information about the host document.

If you use a supported framework, it's possible to have more fine-grained control over the default implementation by using these same methods.

#### <a name="method"></a> `method(name, callback)`

Implements a method that calls playback functions on the video. For example:

```js
ampIntegration.method('play', function () {
  myVideo.play();
});
```

These are methods that should be implemented:

-   `play`
-   `pause`
-   `mute`
-   `unmute`
-   `showcontrols`
-   `hidecontrols`
-   `fullscreenenter`
-   `fullscreenexit`

You can choose to only implement this interface partially, with a few caveats:

-   `play` and `pause` are required for either/both of playback [actions](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events/) or autoplay.

-   `mute` and `unmute` are required for autoplay.

-   `showcontrols` and `hidecontrols` are required for the best possible UX. For
    example, when minimizing the video to the corner, a custom controls overlay is
    shown. If you don't provide methods to hide and show controls, two sets of
    controls could be displayed at the same time, which is a poor user experience.

-   `fullscreenenter` and `fullscreenexit` are required for best possible UX. For
    example, for `rotate-to-fullscreen` or the fullscreen button on minimized
    video.

#### <a name="postEvent"></a> `postEvent(name)`

Posts a playback event to the frame. For example:

```js
myVideoElement.addEventListener('pause', function () {
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
prefixed with `custom_`, i.e. the object `{myVar: 'foo'}` will be available as
`{'custom_myVar': 'foo}`.

#### <a name="getConsentData"></a> `getConsentData(callback)`

The iframe document can request user consent data when the host document uses
[`amp-consent`](https://amp.dev/documentation/components/amp-consent/).

Note: If you only require to block the iframe from loading when consent is not given, it's preferable to [set the `data-block-on-consent` attribute](https://amp.dev/documentation/components/amp-consent/#basic-blocking-behaviors) instead of calling `getConsentData()`

The `callback` passed to the function will be executed with an object containing the following properties:

-   [**`consentMetadata`**](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/customizing-extension-behaviors-on-consent.md#on-consent-metadata)
-   [**`consentString`**](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/customizing-extension-behaviors-on-consent.md#on-consent-string)
-   [**`consentPolicyState`**](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/customizing-extension-behaviors-on-consent.md#on-consent-state)
-   [**`consentPolicySharedData`**](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/customizing-extension-behaviors-on-consent.md#on-related-information)

```json
{
  "consentMetadata": {
    "consentStringType": 2,
    "additionalConsent": "additional-consent-string",
    "gdprApplies": true,
    "purposeOne": true
  },
  "consentString": "accept-string",
  "consentPolicyState": 1,
  "consentPolicySharedData": {
    "tfua": true,
    "coppa": true
  }
}
```

For example, a video could be blocked from loading until `consentPolicyState` is
available:

```js
// Create and listen to video once consent is given on the parent page:
integration.getConsentData(function(consent) {
  if (
    consent.consentPolicyState !== /* SUFFICIENT */ 1 &&
    consent.consentPolicyState !== /* UNKNOWN_NOT_REQUIRED */ 3
  ) {
    integration.postEvent('error');
    return;
  }

  // You can use other consent values to map video consent logic as well.
  console.log(consent);

  // Initialize video and integration once consent is available.
  var video = document.createElement(video);
  video.style = "width: 100vw; height: 100vh";
  video.src = document.body.getAttribute('data-videoid');
  document.body.appendChild(video);

  integration.method('play', function() {
    video.play();
  });

  // etc...
});
```

A complete [example using `getConsentData` is available as well.](../../../../examples/amp-video-iframe/frame-consent.html)

#### <a name="getIntersection"></a> `getIntersection(callback)`

Gets the intersection ratio (between 0 and 1) for the video element. This is useful for viewability information, e.g.

```js
// Will log intersection every 2 seconds
setInterval(function () {
  integration.getIntersection(function (intersection) {
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
  "canonicalUrl": "https://example.com/canonical.html",
  "sourceUrl": "https://example.com/amp.html",
  "title": "My host document's title",
  "lang": "en"
}
```

-   `canonicalUrl` is the canonical URL.

-   `sourceUrl` is the AMPHTML URL.

-   `title` is the source URL's document title at the time the `<bento-video-iframe>` is initialized. `null` when the component is loaded in a shadow root.

-   `lang` is the source URL's language specified in `<html ⚡️ lang="en">`. `null` when the component is loaded in a shadow root.

-   `jsonLd` includes the parsed content of a [JSON-LD](https://json-ld.org/) tag, if present.
