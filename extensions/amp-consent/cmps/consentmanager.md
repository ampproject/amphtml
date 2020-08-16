<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# DIDOMI

Collect and enforce user consent with the ConsentManager CMP. Login to your ConsentManager.net account in order to create a CMP.

## Example

```html
<amp-consent id="ConsentManager" layout="nodisplay" type="ConsentManager">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {"id": "your CMP ID",
                       "params":"optional configuration parameters"}
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=ConsentManager)" role="button">Manage</button>
  </div>
</amp-consent>
```

## Configuration


| Attribute |  Type  | Mandatory | Description                                             |
| --------- | :----: | :-------: | ------------------------------------------------------- |
| id        | String |    yes    | Your ConsentManager CMP ID. Can be found in your account under Menu > Get Code |
| params    | String |    no     | Additional parameters that can be used in order to configure the CMP layout |

Visit the [ConsentManager Website](https://www.consentmanager.net/) and our [Documentation](https://help.consentmanager.net/books/cmp/page/using-the-cmp-with-amp-websites) for more information.
