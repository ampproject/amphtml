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

CMP used through Marfeel platform in order to handle and enforce user consent.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="Marfeel">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "consentLanguage": "language-code",
        "publisherLogo": "website-logo"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=Marfeel)" role="button">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute       |  Type  | Mandatory | Description                                         |
| --------------- | :----: | :-------: | --------------------------------------------------- |
| consentLanguage | String |    yes    | Language code (in ISO-639-1) to display the consent |
| publisherLogo   | String |    yes    | URL of your website logo                            |

Please contact [Marfeel](https://marfeel.com) for further details regarding the configuration of this CMP.
