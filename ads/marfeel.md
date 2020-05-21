<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# Marfeel

## Example

```html
<amp-ad width="300" height="250" type="marfeel" data-tenant="demo.marfeel.com">
</amp-ad>
```

## Configuration

For additional details and support, please contact [Marfeel](https://marfeel.com).

### Required parameters

- `data-tenant`

### Optional parameters

- `data-multisize`
- `data-version`

## Consent Support

When [user consent](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required, Marfeel ad approaches user consent in the following ways:

- `CONSENT_POLICY_STATE.SUFFICIENT`: Marfeel amp-ad will display a personalized ad to the user.
- `CONSENT_POLICY_STATE.INSUFFICIENT`: Marfeel amp-ad will display a non-personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Marfeel amp-ad will display a personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN`: Marfeel amp-ad will display a non-personalized ad to the user.
