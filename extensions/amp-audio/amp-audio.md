<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-audio"></a> `amp-audio`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A replacement for the HTML5 <code>audio</code> tag. The <code>amp-audio</code> component is only to be used for direct HTML5 audio file embeds.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js">&lt;/script></code></td>
  </tr>
   <tr>
     <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
     <td>fixed, fixed-height, nodisplay</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-audio/">Annotated code example for amp-audio</a></td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-audio` component loads the audio resource specified by its `src` attribute at a time determined by the runtime. It can be controlled in much the same way as a standard HTML5 `audio` tag.
Like all embedded external resources in an AMP file, the audio is "lazily" loaded, only when the `amp-audio` element is in or near the viewport

The `amp-audio` component accepts up to three unique types of HTML nodes as children:

- `source` tags: Just like in the HTML `<audio>` tag, you can add `<source>` tag children to specify different source media files to play.
-  a placeholder for before the audio starts: One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the audio. A click or tap anywhere inside of the `amp-audio` container will replace the placeholder with the audio itself.
-  a fallback if the browser doesn’t support HTML5 audio: One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that displays if HTML5 audio is not supported on the user’s browser.

For example:
```html
<amp-audio width="400" height="300" src="https://yourhost.com/audios/myaudio.mp3">
  <div fallback>
    <p>Your browser doesn’t support HTML5 audio</p>
  </div>
  <source type="audio/mpeg" src="foo.mp3">
  <source type="audio/ogg" src="foo.ogg">
</amp-audio>
```

## Attributes

##### src

Required if no `<source>` children are present. Must be HTTPS.

##### preload

If present, sets the preload attribute in the html <audio> tag which specifies if the author thinks that the audio file should be loaded when the page loads.

##### autoplay

If present, the attribute implies that the audio will start playing as soon as
it is ready.

##### loop

If present, the audio will automatically loop back to the start upon reaching the end.

##### muted

If present, will mute the audio by default.

##### controlsList

Same as [controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList) attribute of HTML5 audio element. Only supported by certain browsers. Please see [https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList) for details.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Media Session Attributes

`amp-audio` implements the [Media Session API](https://developers.google.com/web/updates/2017/02/media-session) enabling developers to specify more information about the audio file that is playing to be displayed in the notification center of user's devices (along with play/pause controls).

##### artwork

URL to a PNG/JPG/ICO image serving as the audio's artwork. If not present, the MediaSessionAPI Helper will use either the `image` field in the `schema.org` definition, the `og:image` or the website's `favicon`.

##### artist

(string) indicates the author of the audio

##### album

(string) indicates the album the audio was taken from

##### title

(string) part of the [common attributes](https://www.ampproject.org/docs/reference/common_attributes), doubles as the audio's name displayed in the MediaSession notification. If not provided, the MediaSessionAPI Helper will use either the `aria-label` attribute or fall back to the page's title.

Example:

```html
<amp-audio width="400" height="300"
  src="https://yourhost.com/audios/myaudio.mp3"
  artwork="https://yourhost.com/artworks/artwork.png"
  title="Awesome music" artist="Awesome singer"
  album="Amazing album">
  <source type="audio/mpeg" src="foo.mp3">
</amp-audio>
```

## Validation

See [amp-audio rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-audio/validator-amp-audio.protoascii) in the AMP validator specification.
