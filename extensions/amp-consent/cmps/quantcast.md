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

# Quantcast

## Example

```html
    <amp-consent id="quantcast" layout="nodisplay" type="quantcast">
        <script type="application/json">
          {
            "postPromptUI": "quantcast-post-prompt",
            "clientConfig": {
              "coreConfig": {
                "googleEnabled": true
              }
            }
          }
        </script>
        <div id="quantcast-post-prompt">
          <button on="tap:quantcast.prompt(consent=quantcast)" role="button">Privacy settings</button>
        </div>
    </amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `quantcast-post-prompt` since we have a div with that id.

## Configuration

Visit the [Privacy Portal](https://www.quantcast.com/protect/sites) to get a tag with your latest configuration.

## Getting Help

For more information on how to integrate AMP to your page please visit our [help portal](https://help.quantcast.com/hc/en-us/categories/360002940873-Quantcast-Choice) or contact your account manager directly.
