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

[TOC]

<table>
   <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A replacement for the HTML5 <code>video</code> tag; only to be used for direct HTML5 video file embeds.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>AMP By Example's:<ul>
      <li><a href="https://ampbyexample.com/components/amp-video/">amp-video example</a></li>
      <li><a href="https://ampbyexample.com/advanced/click-to-play_overlay_for_amp-video/">Click-to-play overlay for amp-video</a></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. You can control an `amp-video` component much the same way as a standard HTML5 `<video>` tag.

The `amp-video` component accepts up to three unique types of HTML nodes as children:

- `source` tags: Just like in the HTML `<video>` tag, you can add `<source>` tag children to specify different source media files to play.
-  a placeholder for before the video starts
-  a fallback if the browser doesn’t support HTML5 video: One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that displays if HTML5 video is not supported on the user’s browser.

#### Example

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="293"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampvideo.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div> 
</amp-iframe>

</div>

## Attributes

##### src

Required if no `<source>` children are present. Must be HTTPS.

##### poster

The image for the frame to be displayed before video playback has started. By
default, the first frame is displayed.

Alternatively, you can present a click-to-play overlay. For details, see the [Click-to-Play overlay](#click-to-play-overlay) section below.

##### autoplay

If this attribute is present, and the browser supports autoplay:

* the video is automatically muted before autoplay starts
* when the video is scrolled out of view, the video is paused
* when the video is scrolled into view, the video resumes playback
* when the user taps the video, the video is unmuted
* if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it.  For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

##### controls

This attribute is similar to the `controls` attribute in the HTML5 `video`. If this attribute is present, the browser offers controls to allow the user to control video playback.

##### loop

If present, the video will automatically loop back to the start upon reaching the end.

##### muted (deprecated)

The `muted` attribute is deprecated and no longer has any effect. The `autoplay` attribute automatically controls the mute behavior.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Click-to-Play overlay

Providing a click-to-play overlay is a common UX feature for video players on the web.  For example, you could display a custom play icon that the user can click, as well as include the title of the video, different sized poster images, and so on.  Because the `amp-video` component supports the standard `play` AMP action, you can easily implement click-to-play.

For a detailed example, visit AMP By Example's  [Click-to-play overlay for amp-video](https://ampbyexample.com/advanced/click-to-play_overlay_for_amp-video/).

## Validation

See [amp-video rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
