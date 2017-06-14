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

# <a name="amp-brid-player"></a> `amp-brid-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An <code>amp-brid-player</code> displays the Brid Player used in <a href="https://www.brid.tv/">Brid.tv</a> Video Platform.
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-brid-player" src="https://cdn.ampproject.org/v0/amp-brid-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-brid-player/"> Annotated code example for amp-brid-player</a></td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Examples:

```html
<amp-brid-player
    data-partner="264"
    data-player="4144"
    data-video="13663"
    layout="responsive"
    width="480" height="270">
</amp-brid-player>
```

## Attributes

**autoplay**

If this attribute is present, and the browser supports autoplay:

* the video is automatically muted before autoplay starts
* when the video is scrolled out of view, the video is paused
* when the video is scrolled into view, the video resumes playback
* when the user taps the video, the video is unmuted
* if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it.  For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused. 


**data-partner**

The Brid.tv partner id.

**data-player**

The Brid.tv player id. Specific to every partner.

**data-video**

The Brid.tv video ID.

**data-playlist**

The Brid.tv playlist ID. Embed must either have video or playlist attribute.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-brid-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-brid-player/0.1/validator-amp-brid-player.protoascii) in the AMP validator specification.
