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

# AppConsent

CMP used through AppConsent platform in order to handle and enforce user consent.

## Example

```html
<amp-consent id="ABC" layout="nodisplay" type="appconsent">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "id": "1/10/v5eCA1JV4"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:ABC.prompt(consent=appconsent)" role="button">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute |  Type  | Mandatory | Description                                             |
| --------- | :----: | :-------: | ------------------------------------------------------- |
| id        | String |    yes    | AppConsent Notice identifier, provided upon registering |

Please contact [AppConsent](https://appconsent.io/en) for further details regarding the configuration of this CMP.
