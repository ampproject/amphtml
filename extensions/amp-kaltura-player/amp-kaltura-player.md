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

## Usage

Use the `amp-kaltura-player` component to display a [Kaltura Player](http://player.kaltura.com/docs/).

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<amp-kaltura-player
  data-service-url="cdnapisec.kaltura.com"
  data-uiconf="33502051"
  data-partner="1281471"
  data-entryid="1_3ts1ms9c"
  data-param-streamerType="auto"
  layout="responsive"
  width="480"
  height="270"
>
</amp-kaltura-player>
```

## Attributes

### data-partner (required)

The Kaltura partner id. This attribute is required.

### data-serviceUrl

The Kaltura service url. This attribute is optional.

### data-uiconf

The Kaltura player id - uiconf id.

### data-entryid

The Kaltura entry id.

### data-param-\*

All `data-param-*` attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.

Keys and values will be URI encoded. Keys will be camel cased: `data-param-streamerType="auto"` becomes `&flashvars[streamerType]=auto`

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-kaltura-player rules](validator-amp-kaltura-player.protoascii) in the AMP validator specification.
