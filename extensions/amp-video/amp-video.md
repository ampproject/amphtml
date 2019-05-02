---
$category@: media
formats:
  - websites
  - ads
  - stories
teaser:
  text: Replaces the HTML5 video tag.
---
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

# amp-video

[TOC]

A replacement for the HTML5 <code>video</code> tag; only to be used for direct HTML5 video file embeds.

<table>
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
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. You can control an `amp-video` component much the same way as a standard HTML5 `<video>` tag.

The `amp-video` component accepts up to four unique types of HTML nodes as children:

- `source` tags: Just like in the HTML `<video>` tag, you can add `<source>` tag children to specify different source media files to play.
- `track` tags to enable subtitles in the video. If the track is hosted on a different origin than the document, you must add the `crossorigin` attribute to the `<amp-video>` tag.
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

## Analytics

`amp-video` supports analytics out of the box. See [video analytics](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/amp-video-analytics.md) for more information.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td>Required if no <code>&lt;source&gt;</code> children are present. Must be HTTPS.</td>
  </tr>
  <tr>
    <td width="40%"><strong>poster</strong></td>
    <td>The image for the frame to be displayed before video playback has started. By
default, the first frame is displayed.
<br>
Alternatively, you can present a click-to-play overlay. For details, see the <a href="#click-to-play-overlay">Click-to-Play overlay</a> section below.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>controls</strong></td>
    <td>This attribute is similar to the <code>controls</code> attribute in the HTML5 <code>video</code>. If this attribute is present, the browser offers controls to allow the user to control video playback.</td>
  </tr>
  <tr>
    <td width="40%"><strong>controlsList</strong></td>
    <td>Same as <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList">controlsList</a> attribute of HTML5 video element. Only supported by certain browsers. Please see <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList">https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList</a> for details.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>loop</strong></td>
    <td>If present, the video will automatically loop back to the start upon reaching the end.</td>
  </tr>
  <tr>
    <td width="40%"><strong>crossorigin</strong></td>
    <td>Required if a <code>track</code> resource is hosted on a different origin than the document.</td>
  </tr>
  <tr>
    <td width="40%"><strong>disableremoteplayback</strong></td>
    <td>Determines whether the media element is allowed to have a remote playback UI such as Chromecast or AirPlay.</td>
  </tr>
  <tr>
    <td width="40%"><strong>muted (deprecated)</strong></td>
    <td>The <code>muted</code> attribute is deprecated and no longer has any effect. The <code>autoplay</code> attribute automatically controls the mute behavior.</td>
  </tr>
  <tr>
    <td width="40%"><strong>noaudio</strong></td>
    <td>Annotates the video as having no audio. This hides the equalizer icon that is displayed
when the video has autoplay.</td>
  </tr>
  <tr>
    <td width="40%"><strong>rotate-to-fullscreen</strong></td>
    <td>If the video is visible, the video displays fullscreen after the user rotates their device into landscape mode. For more details, see the <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#rotate-to-fullscreen">Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Media Session API attributes

The `amp-video` component implements the [Media Session API](https://developers.google.com/web/updates/2017/02/media-session), which enables developers to specify more information about the video file. The additional information for the video displays in the notification center of the user's device (along with the play/pause controls).

<table>
  <tr>
    <td width="40%"><strong>artwork</strong></td>
    <td>Specifies a URL to a PNG/JPG/ICO image serving as the video's artwork. If `artwork` is not present, the Media Session API helper uses either the `image` field in the `schema.org` definition, the `og:image`, or the website's `favicon`.</td>
  </tr>
  <tr>
    <td width="40%"><strong>artist</strong></td>
    <td>Indicates the author of the video file, specified as a string.</td>
  </tr>
  <tr>
    <td width="40%"><strong>album</strong></td>
    <td>Indicates the album/collection the video was taken from, specified as a string.</td>
  </tr>
  <tr>
    <td width="40%"><strong>title</strong></td>
    <td>Indicates the name/title of the video, specified as a string. If not provided, the Media Session API helper uses either the `aria-label` attribute or falls back to the page's title.</td>
  </tr>
</table>

Example:

This example contains both the `poster` and `artwork` attributes. The `poster` serves as the placeholder image before the video plays, while `artwork` is the image that displays in the notification via the MediaSession API.

```html
<amp-video width="720" height="305" layout="responsive"
  src="https://yourhost.com/videos/myvideo.mp4"
  poster="https://yourhost.com/posters/poster.png"
  artwork="https://yourhost.com/artworks/artwork.png"
  title="Awesome video" artist="Awesome artist"
  album="Amazing album">
</amp-video>
```

## Click-to-Play overlay

Providing a click-to-play overlay is a common UX feature for video players on the web.  For example, you could display a custom play icon that the user can click, as well as include the title of the video, different sized poster images, and so on.  Because the `amp-video` component supports the standard `play` AMP action, you can easily implement click-to-play.

For a detailed example, visit AMP By Example's  [Click-to-play overlay for amp-video](https://ampbyexample.com/advanced/click-to-play_overlay_for_amp-video/).

## Validation

See [amp-video rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
