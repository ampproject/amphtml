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
Every start label has an assumed e\_`label` for its "end" counterpart label.
As an example if we executed `perf.tick('label')` we assume we have a counterpart
`perf.tick('e_label')`.

| Name                                     | id                           | Description                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install Styles                           | `is`                         | Set when the styles are installed.                                                                                                                                                                 |
| End Install Styles                       | `e_is`                       | Set when the styles are done installing.                                                                                                                                                           |
| Window load event                        | `ol`                         | Window load event fired.                                                                                                                                                                           |
| First viewport ready                     | `pc`                         | Fires when non-ad resources above the fold fired their load event measured from the time the user clicks (So takes pre-rendering into account)                                                     |
| Make Body Visible                        | `mbv`                        | Make Body Visible Executes.                                                                                                                                                                        |
| On First Visible                         | `ofv`                        | The first time the page has been turned visible.                                                                                                                                                   |
| First paint time                         | `fp`                         | The time on the first non-blank paint of the page.                                                                                                                                                 |
| First contentful paint time              | `fcp`                        | First paint with content. See https://github.com/WICG/paint-timing                                                                                                                                 |
| First contentful paint (since visible)   | `fcpv`                       | First paint with content, offset by first visible time                                                                                                                                             |
| First input delay                        | `fid`                        | Millisecond delay in handling the first user input on the page. See https://github.com/WICG/event-timing                                                                                           |
| First input delay (since visible)        | `fidv`                       | ms delay in handling first input, offset by first visible                                                                                                                                          |
| First input delay, polyfill value        | `fid-polyfill`               | Millisecond delay in handling the first user input on the page, reported by [a polyfill](https://github.com/GoogleChromeLabs/first-input-delay)                                                    |
| Layout Jank, first exit                  | `lj`                         | The aggregate jank score when the user leaves the page (navigation, tab switching, dismissing application) for the first time. See https://gist.github.com/skobes/2f296da1b0a88cc785a4bf10a42bca07 |
| Layout Jank, second exit                 | `lj-2`                       | The aggregate jank score when the user leaves the page (navigation, tab switching, dismissing application) for the second time.                                                                    |
| Cumulative Layout Shift, first exit      | `cls`                        | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the first time. See https://web.dev/layout-instability-api                  |
| Cumulative Layout Shift, second exit     | `cls-2`                      | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the second time.                                                            |
| Largest Contentful Paint, load time      | `lcpl`                       | The time in milliseconds for the first contentful element to display. This is the load time version of this metric. See https://github.com/WICG/largest-contentful-paint                           |
| Largest Contentful Paint, render time    | `lcpr`                       | The time in milliseconds for the first contentful element to display. This is the render time version of this metric. https://github.com/WICG/largest-contentful-paint                             |
| Largest Contentful Paint (since visible) | `lcpv`                       | The time in ms for largest contentful element to display, offset by first visible time. Based on render time, falls back to load time.                                                             |
| DOM Complete                             | `domComplete`                | Time immediately before the browser sets the current document readiness of the current document to complete                                                                                        |
| DOM Content Loaded Event End             | `domContentLoadedEventEnd`   | Time immediately after the current document's DOMContentLoaded event completes                                                                                                                     |
| DOM Content Loaded Event Start           | `domContentLoadedEventStart` | Time immediately before the user agent fires the DOMContentLoaded event at the current document                                                                                                    |
| DOM Interactive                          | `domInteractive`             | Time immediately before the user agent sets the current document readiness of the current document to interactive                                                                                  |
| Load Event End                           | `loadEventEnd`               | Time when the load event of the current document is completed                                                                                                                                      |
| Load Event Start                         | `loadEventStart`             | Time immediately before the load event of the current document is fired                                                                                                                            |
| Request Start                            | `requestStart`               | Time immediately before the user agent starts requesting the resource from the server                                                                                                              |
| Response Start                           | `responseStart`              | Time immediately after the user agent's HTTP parser receives the first byte of the response from the server                                                                                        |
