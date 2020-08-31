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

# Pubmine

## Example

### Basic

```html
<amp-ad width="300" height="265" type="pubmine" data-siteid="37790885">
</amp-ad>
```

### With all attributes

```html
<amp-ad
  width="300"
  height="265"
  type="pubmine"
  data-section="1"
  data-pt="1"
  data-ht="1"
  data-siteid="37790885"
>
</amp-ad>
```

## Configuration

For further configuration information, please [contact Pubmine](https://wordpress.com/help/contact).

Please note that the height parameter should be 15 greater than your ad size to ensure there is enough room for the "Report this ad" link.

### Required parameters

- `data-siteid`: Pubmine publisher site number.

### Optional parameters

- `data-section`: Pubmine slot identifier
- `data-pt`: Enum value for page type
- `data-ht`: Enum value for hosting type
- `data-npa-on-unknown-consent`: Flag for allowing/prohibiting non-personalized-ads on unknown consent.

## Consent Support

Pubmine's amp-ad adheres to a user's consent in the following ways:

- No `data-block-on-consent` attribute: Pubmine amp-ad will display a personalized ad to the user.
- `CONSENT_POLICY_STATE.SUFFICIENT`: Pubmine amp-ad will display a personalized ad to the user.
- `CONSENT_POLICY_STATE.INSUFFICIENT`: Pubmine amp-ad will display a non-personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Pubmine amp-ad will display a personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN`: Pubmine amp-ad will display a non-personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN` and `data-npa-on-unknown-consent=false`: Pubmine amp-ad will display a personalized ad to the user.
