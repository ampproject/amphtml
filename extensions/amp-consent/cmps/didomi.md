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

# \DIDOMI

A new generation platform of privacy management.

## Example

```html
<amp-consent id='didomi' layout='nodisplay' type='didomi'>
  <script type="application/json">
  {
    "postPromptUI": "postPromptUI",
    "clientConfig": {"config": {"app": {"apiKey": "Your-API-Key"}}}}
  }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:didomi.prompt(consent=didomi)" role="button">Manage</button>
  </div>
</amp-consent>
```

## Configuration

Please visit our [Documentation](https://developers.didomi.io/) for more information.
