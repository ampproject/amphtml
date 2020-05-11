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

# Usercentrics

Collect user consent with Usercentrics CMP.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="Usercentrics">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "id": "i3_E5TN2b"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=Usercentrics)" role="button">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute |  Type  | Mandatory | Description                               |
| --------- | :----: | :-------: | ----------------------------------------- |
| id        | String |    yes    | Settings id, provided via Admin Interface |

In order to retrieve your settings id, please use the [Usercentrics Admin Interface](https://admin.usercentrics.com/).

## Support

Please get in contact with [Usercentrics](https://usercentrics.com/) if you need further support.
