---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted Connatix Story Player.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# `amp-connatix-story-player`

Displays a cloud-hosted <a href="https://www.connatix.com/">Connatix Story Player</a>.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-connatix-story-player" src="https://cdn.ampproject.org/v0/amp-connatix-story-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-connatix-story-player
  data-player-id="03ef71d8-0941-4bff-94f2-74ca3580b497"
  data-orientation="landscape"
  layout="responsive"
  width="16"
  height="12"
>
</amp-connatix-story-player>

<amp-connatix-story-player
  data-player-id="03ef71d8-0941-4bff-94f2-74ca3580b497"
  data-story-id="08d79e80-c4bb-e51a-4116-616225d51db2"
  data-orientation="portrait"
  layout="responsive"
  width="4"
  height="5"
>
</amp-connatix-story-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-player-id</strong></td>
    <td>Connatix player id. This can be found at the Story Players section in the Connatix management dashboard</a>. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-orientation</strong></td>
    <td>Orientation Mode: "portrait" or "landscape"</a>. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-story-id</strong></td>
    <td>Connatix story id. This represents the unique ID of any story in your Library. This can be found at the Library section in the <a>Connatix management dashboard</a>. (<strong>Optional</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-connatix-story-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-connatix-story-player/validator-amp-connatix-story-player.protoascii) in the AMP validator specification.
