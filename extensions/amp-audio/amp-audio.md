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
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js"></script></code></td>
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

## Behavior

The `amp-audio` component loads the audio resource specified by its `src` attribute at a time determined by the runtime. It can be controlled in much the same way as a standard HTML5 `audio` tag.
Like all embedded external resources in an AMP file, the audio is "lazily" loaded, only when the `amp-audio` element is in or near the viewport.

The `amp-audio` component HTML accepts up to three unique types of HTML nodes as children - `source` tags, a placeholder for before the audio starts, and a fallback if the browser doesn’t support HTML5 audio.

`source` tag children can be used in the same way as the standard `audio` tag, to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the audio. A click or tap anywhere inside of the `amp-audio` container will replace the placeholder with the audio itself.

One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that will be displayed if HTML5 audio is not supported on the user’s browser.

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

**autoplay**

If present, the attribute implies that the audio will start playing as soon as
it is ready.

**loop**

If present, will automatically loop the audio back to the start upon reaching the end.

**muted**

If present, will mute the audio by default.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-audio rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-audio/0.1/validator-amp-audio.protoascii) in the AMP validator specification.
