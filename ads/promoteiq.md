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

# PromoteIQ

Provides support for AMP integration with [PromoteIQ](https://www.promoteiq.com/).   

## Example

```html
  <amp-ad width="250" height="250"
      type="promoteiq"
      data-src="https://example.com/cdn/file.js"
      data-params='{"param1": "XXX", "param2": "YYY", ....}'
      data-sfcallback='function (response){ return response;}'>
  </amp-ad>
```

### Required parameters

- `data-src`: Publisher specific PromoteIQ CDN file. 
- `data-input`: JSON stringified inputs.
- `data-sfcallback`: Stringified publisher rendering function.

# Support

For further queries, please feel free to reach out to your contact at PromoteIQ.