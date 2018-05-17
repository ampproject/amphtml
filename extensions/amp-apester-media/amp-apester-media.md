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
    <td width="40%"><strong>Required Script</strong></td>
    <td> <code>&lt;script async custom-element="amp-apester-media" src="https://cdn.ampproject.org/v0/amp-apester-media-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>
    fill, fixed, fixed-height, flex-item, nodisplay, responsive
    </td>
  </tr>
</table>

[TOC]

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

## Attributes

##### data-apester-media-id

This attribute is required for single mode, and it represents the ID of the media (string value).

##### data-apester-channel-token

This attribute is required for playlist mode, and it represents the token of the channel (string value).

## Validation

See [amp-apester-media rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-apester-media/validator-amp-apester-media.protoascii) in the AMP validator specification.
