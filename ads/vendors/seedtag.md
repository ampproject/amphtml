<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# Seedtag

## Example

```html
<amp-ad width="320" height="250" type="seedtag" data-adunit-id="0" data-publisher-id="0000-0000-01"
    data-placement="inArticle">
<amp-ad
  width="300"
  height="250"
  type="seedtag"
  data-adunit-id="0"
  data-publisher-id="0000-0000-01"
  data-placement="inArticle"
>
</amp-ad>
```

## Configuration

For configuration semantics, please contact [Seedtag](https://www.seedtag.com/contact/).

Supported parameters:

-   `data-adunit-id` mandatory
-   `data-publisher-id` mandatory
-   `data-placement` mandatory

## Testing

You can force a creative for test using this parameters

-   `data-force-creative` optional

Currently you can test those format :
| Format | value |
| ------ | ----- |
| display 300x250 | https://creatives.seedtag.com/vast/ssp-responses/display-OM300x250.json |
| display 300x50 | https://creatives.seedtag.com/vast/ssp-responses/display-OM300x50.json |
| display 320x480 | https://creatives.seedtag.com/vast/ssp-responses/display-OM320x480.json |
| display 970x90 | https://creatives.seedtag.com/vast/ssp-responses/display-OM970x90.json |
| display 970x250 | https://creatives.seedtag.com/vast/ssp-responses/display-OM970x250.json |
| video outstream | https://creatives.seedtag.com/vast/ssp-responses/video-cov.json |

this way :

```html
  <amp-ad
    width="320"
    height="250"
    type="seedtag"
    data-adunit-id="0"
    data-publisher-id="0000-0000-01"
    data-placement="inArticle"
    data-force-creative="https://creatives.seedtag.com/vast/ssp-responses/display-OM300x250.json">
  </amp-ad>
```

## User Consent Integration

When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required, Seedtag ad approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Serve a non-personalized ad to the user..
