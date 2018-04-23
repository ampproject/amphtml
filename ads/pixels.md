<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# Pixels

## Example

```html
<amp-ad width="300" height="250"
        type="pixels"
        data-origin="af"
        data-sid="2847717911664"
        data-tag="sync"
        data-click-tracker="false"
        data-viewability="true">
</amp-ad>
```

## Configuration

For additional details and support contact techteam@pixels.asia


Required parameters:

- data-origin - Specify which ad server group to handle the ad request.
- data-sid - Unique ad tag identifier.
- data-tag - Specify whether this tag is a sync tag. 

Optional parameters:

- data-click-tracker - Specify whether there is a third party click-tracker.
- data-viewability - Specify whether the tag should record viewability statistics. 