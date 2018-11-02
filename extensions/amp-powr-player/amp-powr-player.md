<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-powr-player"></a> `amp-powr-player`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>An <code>amp-powr-player</code> component displays the Powr Player as configured in the <a href="https://powr.com">Powr</a> platform.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-powr-player" src="https://cdn.ampproject.org/v0/amp-powr-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-powr-player
    data-account="12345"
    data-player="12345"
    data-video="12345"
    layout="responsive"
    width="480" height="270">
</amp-powr-player>
```

## Attributes

##### data-account (required)

The Powr account id.

##### data-player (required)

The Powr player id.

##### data-video (required if data-terms isn't provided)

The Powr video id. Normally a string if characters.

##### data-terms (required if data-video isn't provided)

A space separated list of keywords that describe the page displaying the player. Used to fetch a playlist relevant to the site content.

##### data-referrer

Sets the referrer to be used for analytics within the player. This supports AMP variables such as `EXTERNAL_REFERRER`.

##### data-param-*

All `data-param-*` attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.

Keys and values will be URI encoded. Keys will be camel cased.

- `data-param-geo="us"` becomes `&geo=us`
- `data-param-custom-data="key:value;key2:value2"` becomes `&customData=key%3Avalue%3Bkey2%3Avalue2`

##### autoplay

If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, [which are outlined in the Video in AMP spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay).

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-powr-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-powr-player/validator-amp-powr-player.protoascii) in the AMP validator specification.
