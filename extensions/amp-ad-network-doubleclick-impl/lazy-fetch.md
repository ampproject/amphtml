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

# AMP Ad Lazy Fetch

By default, Doubeclick type AMP Ad fetches all slots on the page independent of their location relative to the viewport. However when they render is dependent on <a href="render-on-idle.md">Render on Idle</a>. If a publisher is seeking to delay the ad request instead of just render, data-lazy-fetch=true attribute can be set on the amp-ad element:

```html
<amp-ad ... data-lazy-fetch="true"></amp-ad>
```

When set, the ad request will be delayed until the slot is 3 viewports away (can be set to a specific viewport value based on data-loading-strategy=viewports. Publishers using data-loading-strategy=prefer-viewability-over-views will use current 1.25 viewports. Example of setting lazy fetch to 2 viewports:

```html
<amp-ad ... data-lazy-fetch="true" data-loading-strategy="2"></amp-ad>
```

Note that when lazy fetch is enabled <a href="sra.md">SRA</a> is disabled.
