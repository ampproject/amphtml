---
$category@: dynamic-content
formats:
  - ads
teaser:
  text: Supports interaction with the MRAID host API within Ad webviews in mobile apps
---
<!--
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

# <a name="amp-mraid"></a> `amp-mraid`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Supports interaction with the <a href="https://www.iab.com/guidelines/mobile-rich-media-ad-interface-definitions-mraid/">MRAID</a> host API within Ad webviews in mobile apps.</td>
  </tr>
  <tr>
    <td><strong>Required Script</strong></td>
    <td><code>&lt;script async src="https://cdn.ampproject.org/v0/amp-mraid-0.1.js">&lt;/script></code></td>
  </tr>
</table>

## Overview

When the `amp-mraid` extension is included in an AMPHTML ad it will load
`mraid.js` and register MRAID functions as host services.  This allows
`amp-analytics`, `amp-ad-exit`, and `amp-lightbox` to operate in mobile app ads.

## Validation
The `amp-mraid` extension is intended for [AMPHTML
ads](https://www.ampproject.org/docs/ads/amphtml_ads).  It is intended to be
injected by the ad network after validation, and as such a creative with
`amp-mraid` will not validate.
