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

# <a name="amp-ima-video"></a> `amp-ima-video`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A video player with an integration of the
    <a href="https://developers.google.com/interactive-media-ads/docs/sdks/html5/">IMA SDK</a>
    for instream video ads.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experiment</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ima-video" src="https://cdn.ampproject.org/v0/amp-ima-video-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>None</td>
  </tr>
</table>

## Overview 

You can use the `amp-ima-video` component to embed an IMA SDK enabled video
player. Provide a source URL for your content video and an ad tag, which is a
URL to a VAST-compliant ad response (see examples
[here](https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags)).

**Example: Embedding a video**

```html
<amp-ima-video
    width=640 height=360 layout="responsive"
    data-src="https://s0.2mdn.net/4253510/google_ddm_animation_480P.mp4"
    data-tag="https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator="
    data-poster="path/to/poster.png"
</amp-facebook>
```

## Attributes

**data-src** (required)

The URL of your content video.

**data-tag** (required)

The URL for your VAST ad document.

## Validation

See [amp-ima-video rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ima-video/0.1/validator-amp-ima-video.protoascii) in the AMP validator specification.
