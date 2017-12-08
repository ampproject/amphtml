<!--
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

# <a name="`amp-ventuno-player`"></a> `amp-ventuno-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Renders a <a href="http://www.ventunotech.com/in/">Ventuno</a> HTML5 Player</td>
  </tr>  
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ventuno-player" src="https://cdn.ampproject.org/v0/amp-ventuno-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Example

```html
  <amp-ventuno-player layout="responsive" width="640" height="360"
	data-player="ep"
	data-pubid="49b792a987103"
	data-slotid="380"
	data-title="World Cup 2018"
	data-url="http://ventunotech.com/test/wc2018"
	data-meta="Sports,Football">
  </amp-ventuno-player> 
```


## Attributes

##### data-player (required)

Ventuno HTML5 Player Type. (As of now, only EP is supported)

##### data-pubid (required)

Publisher Id provided by Ventuno

##### data-slotid (required)

Slot Id provided by Ventuno

##### data-title (optional)

Article Title. Required if the publisher wants videos based on the article meta

##### data-url (optional)

Canonical URL of the article. Required if the publisher wants videos based on the article meta

##### data-meta (optional)

Article keywords. Required if the publisher wants videos based on the article meta


## Validation
See [amp-ventuno-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ventuno-player/validator-amp-ventuno-player.protoascii) in the AMP validator specification.
