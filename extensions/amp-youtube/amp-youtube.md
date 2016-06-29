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

# <a name="amp-youtube"></a> `amp-youtube`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://www.youtube.com/">YouTube</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>FILL, FIXED, FIXED_HEIGHT, FLEX_ITEM, NODISPLAY, RESPONSIVE</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-youtube">amp-youtube.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

## Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-youtube
    data-videoid="mGENRKrdoGY"
    layout="responsive"
    width="480" height="270"></amp-youtube>
```

## Attributes

**data-videoid**

The Youtube video id found in every Youtube video page URL

E.g. in https://www.youtube.com/watch?v=Z1q71gFeRqM Z1q71gFeRqM is the video id.

**data-param-***

All `data-param-*` attributes will be added as query parameter to the youtube iframe src. This may be used to pass custom values through to youtube plugins, such as whether to show controls.

Keys and values will be URI encoded. Keys will be camel cased.

- `data-param-controls=1` becomes `&controls=1`

See [Youtube Embedded Player Parameters](https://developers.google.com/youtube/player_parameters) for more parameter options for youtube.

Because of limitations in mobile browsers, the `autoplay` param is currently not supported. Follow [this issue](https://github.com/ampproject/amphtml/issues/3799) for updates on autoplay support in AMP.

## Validation

See [amp-youtube rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube/0.1/validator-amp-youtube.protoascii) in the AMP validator specification.
