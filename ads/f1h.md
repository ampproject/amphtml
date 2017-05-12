<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# F1H

## Examples

### Single ad

```html
  <amp-ad width="728" height="90"
    type="f1h" 
    data-section-id="100"
    data-slot="107" >
  </amp-ad>
```

### Using custom params and custom ad server url

```html
  <amp-ad width="728" height="90"
    type="f1h" 
    data-section-id="100"
    data-slot="107"
    data-custom='{"my_custom_param":"my_custom_value"}'
    data-pubnetwork-lib="lib_file_name" >
  </amp-ad>
```

## Configuration

Supported parameters:

- `sectionId`: required: ID of this section in inventory system.
- `slot`: required: ID of slot, that will be showed in this ad block.
- `pubnetwork-lib`: Filepath of ad library.
- `custom`: optional: <br/>
                    usage example:
                    ```
                    {
                        "arrayKey":["value1",1],
                        "stringKey":"stringValue"
                    }
                    ```

