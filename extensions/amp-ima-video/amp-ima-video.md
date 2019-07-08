---
$category@: media
formats:
  - websites
teaser:
  text: Embeds a video player for instream video ads that are integrated with the IMA SDK.
---
<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# amp-ima-video

Embeds a video player for instream video ads that are integrated with
the
<a href="https://developers.google.com/interactive-media-ads/docs/sdks/html5/">IMA SDK</a>.

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ima-video" src="https://cdn.ampproject.org/v0/amp-ima-video-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-ima-video/">amp-ima-video example</a>.</td></td>
  </tr>
</table>

## Overview

You can use the `amp-ima-video` component to embed an [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/) enabled video player.

The component requires an ad tag, provided in `data-tag`, which is a URL to a
VAST-compliant ad response (for examples, see
[IMA Sample Tags](https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags)).

The component HTML accepts the following types of HTML nodes as children:
* `source` tags for content video, used in the same way as the standard `video` tag.
* `track` tags for subtitles, in the same way as the standard `video` tag. If the track is hosted on a different origin than the document, you must add the `data-crossorigin` attribute to the `<amp-ima-video>` tag.
* a `script` tag of type `application/json` used to provide [ImaSdkSettings](https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.ImaSdkSettings). Provide the property-translation of the setters in the linked documentation (e.g. to call `setNumRedirects(4)`, provide `{"numRedirects": 4}`).

## Example

```html
<amp-ima-video
    width=640 height=360 layout="responsive"
    data-tag="ads.xml" data-poster="poster.png">
  <source src="foo.mp4" type="video/mp4">
  <source src="foo.webm" type="video/webm">
  <track label="English subtitles" kind="subtitles" srclang="en" src="subtitles.vtt">
  <script type="application/json">
  {
    "locale": "en",
    "numRedirects": 4
  }
  </script>
</amp-ima-video>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-tag (required)</strong></td>
    <td>The URL for your VAST ad document. A relative URL or a URL that uses https protocol.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-src</strong></td>
    <td>The URL of your video content. A relative URL or a URL that uses https protocol. This attribute is required if no <code>&lt;source&gt;</code> children are present.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-crossorigin</strong></td>
    <td>Required if a <code>track</code> resource is hosted on a different origin than the document.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-poster (optional)</strong></td>
    <td>An image for the frame to be displayed before video playback has started. By
default, the first frame is displayed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-delay-ad-request (optional)</strong></td>
    <td>If true, delay the ad request until either the user scrolls the page, or for 3 seconds, whichever occurs first. Defaults to false.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-ad-label (optional)</strong></td>
    <td>A format string that looks like "Ad (%s of %s)", used to generate the ad disclosure when an ad is playing. The "%s" in the format string is replaced with the current ad number in the sequence and the total number of ads, respectively (e.g. Ad 2 of 3). This allows users to support ad disclosures in different languages. If no value is given, this defaults to "Ad (%s of %s)".</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes
<a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a>
extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-ima-video rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ima-video/validator-amp-ima-video.protoascii) in the AMP validator specification.
