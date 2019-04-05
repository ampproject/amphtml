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

# \_PING_

A fake cmp type that is only used for local development.

## Example

```html
<amp-consent id='ABC' layout='nodisplay' type='_ping_'>
  <script type="application/json">
  {
    "consents": {},
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "CMP_id": "test_id",
        "other_info": "test_info"
      }
  }
  </script>
  <div id="ui1">
    Please Accept to load image.
    <button on="tap:ABC.accept" role="button">Accept</button>
    <button on="tap:ABC.reject" role="button">Reject</button>
    <button on="tap:ABC.dismiss" role="button">Dismiss</button>
  </div>
  <div id="ui2">
    Please Accept to load image.
    <button on="tap:ABC.accept" role="button">Accept</button>
    <button on="tap:ABC.reject" role="button">Reject</button>
    <button on="tap:ABC.dismiss" role="button">Dismiss</button>
  </div>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:ABC.prompt(consent=_ping_)" role="button">Manage</button>
  </div>
</amp-consent>
```

## Configuration

For details on the configuration semantics, please contact the [ad network](#configuration) or refer to their [documentation](#ping).
