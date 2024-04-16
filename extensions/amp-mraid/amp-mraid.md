---
$category@: dynamic-content
formats:
  - ads
teaser:
  text: Supports interaction with the MRAID host API within Ad webviews in mobile apps
---

# amp-mraid

## Overview

When the `amp-mraid` extension is included in an AMPHTML ad it will load
`mraid.js` and register MRAID functions as host services. This allows
`amp-analytics`, `amp-ad-exit`, and `amp-lightbox` to operate in mobile app ads.

## Validation

The `amp-mraid` extension is intended for [AMPHTML
ads](https://amp.dev/documentation/guides-and-tutorials/learn/intro-to-amphtml-ads). It is intended to be
injected by the ad network after validation, and as such a creative with
`amp-mraid` will not validate.
