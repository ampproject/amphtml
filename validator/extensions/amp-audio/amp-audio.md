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
    <td><code>&lt;script async custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-audio/">amp-audio.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
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
<amp-audio width=400 height=300 src="https://yourhost.com/audios/myaudio.mp3">
  <div fallback>
    <p>Your browser doesn’t support HTML5 audio</p>
  </div>
  <source type="audio/mpeg" src="foo.mp3">
  <source type="audio/ogg" src="foo.ogg">
</amp-audio>
```

## Attributes

**autoplay**

The `autoplay` attribute allows the author to specify when - if ever - the animated image will autoplay.

The presence of the attribute alone implies that the animated image will always autoplay. The author may specify values to limit when the animations will autoplay. Allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space. The runtime makes a best-guess approximation to the device type to apply this value.

**loop**

If present, will automatically loop the audio back to the start upon reaching the end.

**muted**

If present, will mute the audio by default.

## Validation errors

The following lists validation errors specific to the `amp-audio` tag
(see also `amp-audio` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-audio/0.1/validator-amp-audio.protoascii)):

<!---
What does fixed height and fixed width mean for audio layout?
May need to add something to this table based on technical review.
-->

<table>
  <tr>
    <th class="col-fourty"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-audio</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-tag-ancestor-with-hint">The tag 'example1' may only appear as a descendant of tag 'example2'. Did you mean 'example3'?</a></td>
    <td>Error thrown if your AMP document uses <code>audio</code> instead of <code>amp-audio</code>. Error message: The tag <code>audio</code> may only appear as a descendant of tag <code>noscript</code>. Did you mean <code>amp-audio</code>?</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute is missing its URL.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute's URL is invalid.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>src</code> attribute's URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied layout is set to <code>RESPONSIVE</code>, <code>FILL</code>, or <code>CONTAINER</code>; these layout types aren't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout is set to <code>RESPONSIVE</code>, <code>FILL</code>, or <code>CONTAINER</code>; these layout types aren't supported.</td>
  </tr>
</table>
