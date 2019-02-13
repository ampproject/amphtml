---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Izlesene video.
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

# amp-izlesene

Displays an embedded <a href="https://www.izlesene.com/">Izlesene</a> video.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-izlesene" src="https://cdn.ampproject.org/v0/amp-izlesene-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
</table>

[TOC]

## Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-izlesene
    data-videoid="7221390"
    layout="responsive"
    width="480" height="270"></amp-izlesene>
```

## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-videoid (required)</strong></td>
    <td>The ID of the Izlesene video, which can be found in the Izlesene video page URL. For example, in https://www.izlesene.com/video/yayin-yok/7221390, the video ID is <code>7221390</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-showrel (optional)</strong></td>
    <td>This is an optional attribute that indicates whether to show related content. This functionality is not available for iOS devices.</p>
<ul>
  <li>Accepted values: `1` or `0`</li>
  <li>Default value: `1`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-showreplay (optional)</strong></td>
    <td>This is an optional attribute that indicates whether to show the replay button at the end of the content.</p>
<ul>
  <li>Accepted values: `1` or `0`</li>
  <li>Default value: `1`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-izlesene rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-izlesene/validator-amp-izlesene.protoascii) in the AMP validator specification.
