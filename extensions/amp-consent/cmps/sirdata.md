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

# Sirdata

Collects user consent with Sirdata CMP.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="sirdata">
  <script type="application/json">
    {
      "postPromptUI": "promptConsentUI",
      "clientConfig": {
        "cmp": {
          "theme": {
            "noConsentButton": "refuse"
          }
        }
      }
    }
  </script>
  <div id="promptConsentUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=sirdata)" role="button">
      Privacy settings
    </button>
  </div>
</amp-consent>
```

## Configuration

For more information and configuration options, please visit our [Documentation](https://cmp.sirdata.com/#/docs).
