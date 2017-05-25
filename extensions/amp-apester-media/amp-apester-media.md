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

# <a name="amp-apester-media"></a>amp-apester-media

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td> Displays a <a href="https://apester.com/">Apester</a> smart unit.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td> <code><script async custom-element="amp-apester-media" src="https://cdn.ampproject.org/v0/amp-apester-media-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>
    fill, fixed, fixed-height, flex-item, nodisplay, responsive
    </td>
  </tr>
</table>

## Examples 

Single Mode:
```html
<amp-apester-media
        height="390"
        data-apester-media-id="#">
</amp-apester-media>
```

Playlist Mode:
```html
<amp-apester-media
        height="390"
        data-apester-channel-token="#">
</amp-apester-media>
```

## Required attributes

### Single Mode: 
**data-apester-media-id**

The ID of the media, a string.

### Playlist Mode: 
**data-apester-channel-token**

The token of the channel, a string.

## Validation

See [amp-apester-media rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-apester-media/0.1/validator-amp-apester-media.protoascii) in the AMP validator specification.
