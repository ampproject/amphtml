# How to Include Common Features

AMP HTML components make it simple for you to control your content.
Learn how to include common features in your pages using these elements.

Make sure to review the documentation for each component individually as a reference:
* [AMP HTML Built-in Components](../builtins/README.md)
* [AMP HTML Extended Components](../extensions/README.md).

# Display an iframe

Display an iframe in your page using the
[`amp-iframe`](../extensions/amp-iframe/amp-iframe.md) element.

`amp-iframe` requirements:

* Must be at least 600px or 75% of the first viewport away from the top.
* Can only request resources via HTTPS, and they must not be in the same origin as the container,
unless they do not specify allow-same-origin.

To include an `amp-iframe` in your page,
first include the following script to the `<head>`, which loads the additional code for the extended component:

```html
<script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>
```

An example `amp-iframe` from the
[released.amp example](https://github.com/ampproject/amphtml/blob/master/examples/released.amp.html):

```html
<amp-iframe width=300 height=300
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    layout="responsive"
    frameborder="0"
    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDG9YXIhKBhqclZizcSzJ0ROiE0qgVfwzI&q=Alameda,%20CA">
</amp-iframe>
```

# Media

Include images, video, and audio in your page using AMP media elements.

## Include an image

Include an image in your page
using the [`amp-img`](../builtins/amp-img.md) element.

`amp-img` requirements:

* Must include an explicit width and height.
* Recommended: include a placeholder in case the image resource fails to load.

Responsive image example:
```html
<amp-img src="responsive.jpg" width=527 height=193 layout="responsive" ></amp-img>
```
Fixed-size image example:
```html
<amp-img id="img1" src="fixed.jpg" width=264 height=96></amp-img>
```
Hidden image example:
```html
<amp-img id="img2" src="hidden.jpg" width=527 height=193 layout="nodisplay"></amp-img>
```
The AMP HTML runtime can effectively manage image resources,
choosing to delay or prioritize resource loading
based on the viewport position, system resources, connection bandwidth, or other factors.

If the resource requested by the `amp-img` component fails to load,
the space will be blank.
Set a placeholder background color or other visual
using a CSS selector and style on the element itself:
```css
amp-img {
  background-color: grey;
}
```
## Include an animated image

Include an animated image in your page
using the [`amp-anim`](../extensions/amp-anim/amp-anim.md) element.

The `amp-anim` element is very similar to the `amp-img` element,
and provides additional functionality to manage loading and playing
of animated images such as GIFs.

To include an `amp-anim` in your page,
first include the following script to the `<head>`:

```html
<script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
```

The `amp-anim` component can also have an optional placeholder child
to display while the `src` file is loading.
The placeholder is specified via the `placeholder` attribute:
```html
<amp-anim width=400 height=300 src="my-gif.gif">
  <amp-img placeholder width=400 height=300 src="my-gif-screencap.jpg">
  </amp-img>
</amp-anim>
```
## Embed a Tweet

Embed a Twitter Tweet in your page
using the [`amp-twitter`](../extensions/amp-twitter/amp-twitter.md) element.

To include a tweet in your page,
first include the following script to the `<head>`:

```html
<script async custom-element="amp-twitter" src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js"></script>
```

Currently tweets are automatically proportionally scaled
to fit the provided size,
but this may yield less than ideal appearance.
Manually tweak the provided width and height or use the media attribute
to select the aspect ratio based on screen width.

Example `amp-twitter` from the
[twitter.amp example](../examples/twitter.amp.html):
```html
<amp-twitter width=390 height=50
    layout="responsive"
    data-tweetid="638793490521001985">
</amp-twitter>
```

<!--## Embed an Instagram

**Todo:** Not ready yet

Embed an Instagram in your page
using the [`amp-instagram`]() element.

**Todo:** Add proper link to reference doc.

Include the Instagram data-shortcode found in the Instagram photo URL.
For example, in `https://instagram.com/p/fBwFP`,
`fBwFP` is the data-shortcode.
Also, Instagram uses a fixed aspect ratio for responsive layouts,
so the value for width and height should be universal

    <amp-instagram
      data-shortcode="fBwFP"
      width="320"
      height="392"
      layout="responsive">
    </amp-instagram>
-->

## Include a video

Include a video in your page
using the [`amp-video`](../builtins/amp-video.md) element.

Only use this element for direct HTML5 video file embeds.
The element loads the video resource specified by the `src` attribute lazily,
at a time determined by the AMP HTML runtime.

Include a placeholder before the video starts, and a fallback,
if the browser doesn't support HTML5 video, for example:
```html
<amp-video width=400 height=300 src="https://yourhost.com/videos/myvideo.mp4"
    poster="myvideo-poster.jpg">
  <div fallback>
		<p>Your browser doesn’t support HTML5 video</p>
  </div>
</amp-video>
```
## Include a youtube video

Include a youtube video in your page
using the [`amp-youtube`](../extensions/amp-youtube/amp-youtube.md) element.

You must include the following script in the `<head>`:

```html
<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script>
```

The Youtube `data-videoid` can be found in every Youtube video page URL.
For example, in https://www.youtube.com/watch?v=Z1q71gFeRqM,
Z1q71gFeRqM is the video id.

Use `layout="responsive"` to yield correct layouts for 16:9 aspect ratio videos:
```html
<amp-youtube
    data-videoid="mGENRKrdoGY"
    layout="responsive"
    width="480" height="270">
</amp-youtube>
```
## Include an audio resource

Include an audio resource in your page,
using the [`amp-audio`](../extensions/amp-audio/amp-audio.md) element.

You must include the following script in the `<head>`:

```html
<script async custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js"></script>
```

Only use this element for direct HTML5 audio file embeds.
Like all embedded external resources in an AMP page,
the element loads the audio resource specified by the `src` attribute lazily,
at a time determined by the AMP HTML runtime.

Include a placeholder before the audio starts, and a fallback,
if the browser doesn't support HTML5 audio, for example:
```html
<amp-audio width=400 height=300 src="https://yourhost.com/audios/myaudio.mp3">
  <div fallback>
    <p>Your browser doesn’t support HTML5 audio</p>
  </div>
  <source type="audio/mpeg" src="foo.mp3">
  <source type="audio/ogg" src="foo.ogg">
</amp-audio>
```
# Count user page views

Count user page views
using the [`amp-pixel`](../builtins/amp-pixel.md) element.

The `amp-pixel` element takes a simple URL to send a GET request
to when the tracking pixel is loaded.

Use the special string `$RANDOM` to add a random number
to the URL if required.

For example, `<amp-pixel src="https://www.my-analytics.com/?rand=$RANDOM">`
makes a request to something like `https://www.my-analytics.com/?rand=8390278471201`,
where the $RANDOM value is randomly generated upon each impression.

An example `amp-pixel` from the
[everything.amp example](https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html):
```html
<amp-pixel src="https://pubads.g.doubleclick.net/activity;dc_iu=/12344/pixel;ord=$RANDOM?"></amp-pixel>
```
# Monetization through ads

The following ad networks are supported in AMP HTML pages:

- [A9](../ads/a9.md)
- [AdReactor](../ads/adreactor.md)
- [AdSense](../ads/adsense.md)
- [AdTech](../ads/adtech.md)
- [Doubleclick](../ads/doubleclick.md)

## Display an ad

Display an ad in your page
using the [`amp-ad`](../builtins/amp-ad.md) element.
Only ads served via HTTPS are supported.

No ad network provided JavaScript is allowed to run inside the AMP document.
Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox)
and executes the ad network’s JS inside that iframe sandbox.

You must specify the ad width and height, and the ad network type.
The `type` identifies the ad network's template.
Different ad types require different `data-*` attributes.
```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>
```
If supported by the ad network,
include a `placeholder`
to be shown if no ad is available:
```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
  <div placeholder>Have a great day!</div>
</amp-ad>
```
