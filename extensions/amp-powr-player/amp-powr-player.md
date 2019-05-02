---
$category@: media
formats:
  - websites
teaser:
  text: An amp-powr-player component displays the Powr Player as configured in the Powr platform.
---
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

# amp-powr-player

An <code>amp-powr-player</code> component displays the Powr Player as configured in the <a href="https://powr.com">Powr</a> platform.

<table>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-powr-player" src="https://cdn.ampproject.org/v0/amp-powr-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
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

<table>
  <tr>
    <td width="40%"><strong>data-account (required)</strong></td>
    <td>The Powr account id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-player (required)</strong></td>
    <td>The Powr player id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-video (required if data-terms isn't provided)</strong></td>
    <td>The Powr video id. Normally a string if characters.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-terms (required if data-video isn't provided)</strong></td>
    <td>A space separated list of keywords that describe the page displaying the player. Used to fetch a playlist relevant to the site content.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-referrer</strong></td>
    <td>Sets the referrer to be used for analytics within the player. This supports AMP variables such as <code>EXTERNAL_REFERRER</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-&#42;</strong></td>
    <td><p>All <code>data-param-*</code> attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.</p>
<p>Keys and values will be URI encoded. Keys will be camel cased.<br></p>
<ul>
  <li>`data-param-geo="us"` becomes `&geo=us`
  </li>
  <li>`data-param-custom-data="key:value;key2:value2"` becomes `&customData=key%3Avalue%3Bkey2%3Avalue2`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-powr-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-powr-player/validator-amp-powr-player.protoascii) in the AMP validator specification.
