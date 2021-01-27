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

# Pubtech

## Example

```html
    <amp-consent id="pubtech" layout="nodisplay" type="pubtech">
        <script type="application/json">
          {
            "postPromptUI": "pubtech-post-prompt",
            "clientConfig": {
              "privacyUrl": "",
              "isAmp": true,
              "websiteName": "Pubtech"
            }
          }
        </script>
        <div id="pubtech-post-prompt">
          <button on="tap:consent.prompt(consent=pubtech)">Privacy settings</button>
        </div>
    </amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `pubtech-post-prompt` since we have a div with that id.

## Configuration

Visit the [CMP Section](https://www.pubtech.ai/) to get a full description of our configuration options.

## Getting Help

For more information on how to integrate our CMP AMP to your page please contact your account manager directly.
