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
<amp-ad
  width="300"
  height="250"
  type="seedtag"
  data-adunit-id="0"
>
</amp-ad>
```

## Configuration

For configuration semantics, please contact [Seedtag](https://www.seedtag.com/contact/).

Supported parameters:

-   `data-adunit-id` mandatory


## User Consent Integration
When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required, Seedtag ad approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Serve a non-personalized ad to the user..
