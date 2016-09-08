<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-dailymotion"></a> `amp-dailymotion`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td> Displays a <a href="http://www.dailymotion.com/">Dailymotion</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-dailymotion" src="https://cdn.ampproject.org/v0/amp-dailymotion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-dailymotion/">amp-dailymotion.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/dailymotion.amp.html">dailymotion.amp.html</a></td>
  </tr>
</table>

## Example

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos.

```html
<amp-dailymotion
    data-videoid="x2m8jpp"
    layout="responsive"
    width="480" height="270"></amp-dailymotion>
```

## Required attributes

**data-videoid**

The Dailymotion video id found in every video page URL.

E.g. in https://www.dailymotion.com/video/x2m8jpp_dailymotion-spirit-movie_creation `"x2m8jpp"` is the video id.

## Optional attributes

**data-mute**

Whether to mute the video or not.

Value: `"true"` or `"false"`

Default value: `"false"`

**data-endscreen-enable**

Whether to enable the end screen or not.

Value: `"true"` or `"false"`

Default value: `"true"`

**data-sharing-enable**

Whether to display the sharing button or not.

Value: `"true"` or `"false"`

Default value: `"true"`

**data-start**

Specifies the time (in seconds) from which the video should start playing. 

Value: integer (number of seconds). E.g. `data-start=45`

Default value: `0`

**data-ui-highlight**

Change the default highlight color used in the controls.

Value: Hexadecimal color value (without the leading #). E.g. `data-ui-highlight="e540ff"`

**data-ui-logo**

Whether to display the Dailymotion logo or not.

Value: `"true"` or `"false"`

Default value: `"true"`

**data-info**

Whether to show video information (title and owner) on the start screen.

Value: `"true"` or `"false"`

Default value: `"true"`

## Validation

See [amp-dailymotion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-dailymotion/0.1/validator-amp-dailymotion.protoascii) in the AMP validator specification.
