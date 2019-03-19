<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# Purch

## Example

```html
<amp-ad width="300" height="250"
  type="purch"
  data-pid="2882"
  data-divid="rightcol_top"
  data-config='{"targeting":{"key1":"value1", "key2":"value2"}}'>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

Supported parameters:

- `data-pid`: placement id
- `data-divid`: div id of unit
- `data-config`: Optinal parameter to control the ad behaviour.
- `data-config.targeting`: Optinal config parameter to pass key-values to DFP/GAM.
