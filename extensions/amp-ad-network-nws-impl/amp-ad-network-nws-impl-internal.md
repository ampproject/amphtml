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

# amp-ad-network-nws-impl

Newsroom AI fast fetch implementation for serving AMP story ads via `<amp-story-auto-ads>`:

https://amp.dev/documentation/guides-and-tutorials/develop/advertise_amp_stories/

### Example configuration:

```html
<amp-story-auto-ads>
  <script type="application/json">
    {
      "ad-attributes": {
        "type": "nws",
        "data-slot": "<slot_id>"
      }
    }
  </script>
</amp-story-auto-ads>
```
