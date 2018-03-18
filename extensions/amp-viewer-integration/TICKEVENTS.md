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

### Tick Events

When implementing a viewer one can use the tick events for performance tracking.

We use very short string names as tick labels, so the table below
further describes these labels.
Every start label has an assumed e_`label` for its "end" counterpart label.
As an example if we executed `perf.tick('label')` we assume we have a counterpart
`perf.tick('e_label')`.

| Name                | id                | Description                        |
----------------------|-------------------|------------------------------------|
| Install Styles      | `is`              | Set when the styles are installed. |
| End Install Styles  | `e_is`            | Set when the styles are done installing. |
| Window load event   | `ol`              | Window load event fired.           |
| First viewport ready | `pc`             | Fires when non-ad resources above the fold fired their load event measured from the time the user clicks (So takes pre-rendering into account) |
| Make Body Visible | `mbv` | Make Body Visible Executes. |
| On First Visible | `ofv` | The first time the page has been turned visible. |
| First paint time | `fp` | The time on the first non-blank paint of the page. |
| First contentful paint time | `fcp` | First paint with content. See https://github.com/WICG/paint-timing |
