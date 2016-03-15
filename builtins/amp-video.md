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

# <a name="amp-video"></a> `amp-video`

<table>
   <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A replacement for the HTML5 <code>video</code> tag; only to be used for direct HTML5 video file embeds.</td>
  </tr>
   <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
   <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-video">amp-video.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. It can be controlled much the same way as a standard HTML5 `video` tag.

The `amp-video` component HTML accepts up to three unique types of HTML nodes as children - `source` tags, a placeholder for before the video starts, and a fallback if the browser doesn’t support HTML5 video.

`source` tag children can be used in the same way as the standard `video` tag, to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the video. A click or tap anywhere inside of the `amp-video` container will replace the placeholder with the video itself.

One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that will be displayed if HTML5 video is not supported on the user’s browser.

For example:
```html
<amp-video width=400 height=300 src="https://yourhost.com/videos/myvideo.mp4"
    poster="myvideo-poster.jpg">
  <div fallback>
    <p>Your browser doesn’t support HTML5 video</p>
  </div>
  <source type="video/mp4" src="foo.mp4">
  <source type="video/webm" src="foo.webm">
</amp-video>
```

## Attributes

**src**

Required if no <source> children are present. Must be HTTPS.

**poster**

The image for the frame to be displayed before video playback has started. By
default the first frame is displayed.

**autoplay**

The `autoplay` attribute allows the author to specify when - if ever - the animated image will autoplay.

The presence of the attribute alone implies that the animated image will always autoplay. The author may specify values to limit when the animations will autoplay. Allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space. The runtime makes a best-guess approximation to the device type to apply this value.

**controls**

Similar to the `video` tag `controls` attribute - if present, the browser offers controls to allow the user to control video playback.

**loop**

If present, will automatically loop the video back to the start upon reaching the end.

**muted**

If present, will mute the audio by default.

## Validation errors

The following lists validation errors specific to the `amp-video` tag
(see also `amp-video` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii)):

<table>
  <tr>
    <th class="col-fourty"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-tag-ancestor-with-hint">The tag 'example1' may only appear as a descendant of tag 'example2'. Did you mean 'example3'?</a></td>
    <td>Error thrown if your AMP document uses <code>video</code> instead of <code>amp-video</code>. Error message: <code>The tag <code>video</code> may only appear as a descendant of tag <code>noscript</code>. Did you mean <code>amp-video</code>?</code>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute is missing it's URL.</td>
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
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>
