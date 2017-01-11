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

### Multi instance ads

```html
  <amp-ad width=250 height=250
    type="f1h"
    data-section-id="475"
    data-slot="650"
    data-instance="1" >
  </amp-ad>
  <amp-ad width=250 height=250
    type="f1h"
    data-section-id="475"
    data-slot="650"
    data-instance="2" >
  </amp-ad>
```

### Using custom params and custom ad server url

```html
  <amp-ad width="728" height="90"
    type="f1h" 
    data-section-id="100"
    data-slot="107"
    data-custom='{"my_custom_param":"my_custom_value"}'
    data-ad-server-url="//h.f1.impact-ad.jp/ad" >
  </amp-ad>
```

## Configuration

Supported parameters:

- `sectionId`: required: ID of this section in inventory system.
- `slot`: required: ID of slot, that will be showed in this ad block.
- `instance`: optional: ID of section instance in case we multiple times used the same section on the same page<br/>
                      It can contain only letters and numbers<br/>
                      Strictly required to use the same section multiple times per page.
- `click3rd`: optional: 3rd party click watcher. 
- `custom`: optional: You may use 3 types for its properties: {String}, {Number} and {Array}.<br/>
                    Array usage example:
                    ```
                    {
                        arrayKey: [ "value1", 1 ],
                        stringKey: 'stringValue'
                    }
                    ```
                    Will translate into: arrayKey=value1&arrayKey=1&stringKey=stringValue...
- `adServerUrl`: optional 
- `cacheSafe`: optional
- `pageIdModifier`: optional
