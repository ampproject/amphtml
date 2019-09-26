---
$category: media
formats:
  - websites
teaser:
  text: Displays a Flowplayer embed.
---
<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# `amp-flowplayer`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="http://www.flowplayer.com">Flowplayer</a> embed</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-flowplayer" src="https://cdn.ampproject.org/v0/amp-flowplayer-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://amp.dev/documentation/examples/components/amp-flowplayer/">Code example for amp-flowplayer</a></td>
  </tr>
</table>

## Behavior

You can use the `amp-flowplayer` to embed <a href="http://www.flowplayer.com">Flowplayer</a> on your website.
The component requires `data-id`, which is a Flowplayer platform id for the video to be embedded. 
Additionally you can specify a player id `data-pid` to enable additional features and appearance alterations in the player. 

## Examples

```html
<amp-flowplayer layout="responsive" data-id="69891ec1-2d90-423c-9892-5a9ee87b6d86" data-pid="6bc18b7d-6643-4fba-aa20-1f8bd814c66d">
</amp-flowplayer>
```

```html
<amp-flowplayer width="400" height="300" data-id="69891ec1-2d90-423c-9892-5a9ee87b6d86" data-pid="6bc18b7d-6643-4fba-aa20-1f8bd814c66d">
</amp-flowplayer>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-id</strong></td>
    <td>Flowplayer platform id for the video to be played</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-pid</strong></td>
    <td>Flowplayer player id for additional features and appearance alterations</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.
  </td>
</table>

## Validation
See [amp-flowplayer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-flowplayer/validator-amp-flowplayer.protoascii) in the AMP validator specification.
