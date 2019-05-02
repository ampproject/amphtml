---
$category@: media
formats:
  - websites
teaser:
  text: Displays the Kaltura Player as used in Kaltura's Video Platform.
---
<!---
Copyright 2016 Kaltura. All Rights Reserved.

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

# amp-kaltura-player

An <code>amp-kaltura-player</code> component displays the Kaltura Player as used in Kaltura's <a href="https://corp.kaltura.com/">Video Platform</a>.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-kaltura-player" src="https://cdn.ampproject.org/v0/amp-kaltura-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-kaltura-player/">Annotated code example for amp-kaltura-player</a></td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
 <amp-kaltura-player
      data-uiconf="33502051"
      data-partner="1281471"
      data-entryid="1_3ts1ms9c"
      data-param-streamerType = "auto"
      layout="responsive" width="480" height="270">
  </amp-kaltura-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-partner</strong></td>
    <td>The Kaltura partner id. This attribute is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-uiconf</strong></td>
    <td>The Kaltura player id - uiconf id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-entryid</strong></td>
    <td>The Kaltura entry id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-*</strong></td>
    <td><p>All <code>data-param-*</code> attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.</p>
<p>Keys and values will be URI encoded. Keys will be camel cased.</p>
<ul>
  <li>`data-param-streamerType="auto"` becomes `&flashvars[streamerType]=auto`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-kaltura-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-kaltura-player/validator-amp-kaltura-player.protoascii) in the AMP validator specification.
