### Tick Events

When implementing a viewer one can use the tick events for performance tracking.

We use very short string names as tick labels, so the table below
further describes these labels.
Every start label has an assumed e\_`label` for its "end" counterpart label.
As an example if we executed `perf.tick('label')` we assume we have a counterpart
`perf.tick('e_label')`.

| Name                                     | id                           | Description                                                                                                                                    |
| ---------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Install Styles                           | `is`                         | Set when the styles are installed.                                                                                                             |
| End Install Styles                       | `e_is`                       | Set when the styles are done installing.                                                                                                       |
| Window load event                        | `ol`                         | Window load event fired.                                                                                                                       |
| First viewport ready                     | `pc`                         | Fires when non-ad resources above the fold fired their load event measured from the time the user clicks (So takes pre-rendering into account) |
| Make Body Visible                        | `mbv`                        | Make Body Visible Executes.                                                                                                                    |
| On First Visible                         | `ofv`                        | The first time the page has been turned visible.                                                                                               |
| First paint time                         | `fp`                         | The time on the first non-blank paint of the page.                                                                                             |
| First contentful paint time              | `fcp`                        | First paint with content. See https://github.com/WICG/paint-timing                                                                             |
| First contentful paint (since visible)   | `fcpv`                       | First paint with content, offset by first visible time                                                                                         |
| First input delay                        | `fid`                        | Millisecond delay in handling the first user input on the page. See https://github.com/WICG/event-timing                                       |
| Cumulative Layout Shift                  | `cls`                        | The current maximum layout shift score with 5s windows and a 1s session gap. See https://web.dev/layout-instability-api                        |
| Cumulative Layout Shift Type Union       | `clstu`                      | The bitwise union of all Element types that caused layout shift (see `ELEMENT_TYPE_ENUM`)                                                      |
| Cumulative Layout Shift, first exit      | `cls-1`                      | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the first time.         |
| Cumulative Layout Shift, second exit     | `cls-2`                      | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the second time.        |
| Largest Contentful Paint                 | `lcp`                        | The time in milliseconds for the largest contentful element to display.                                                                        |
| Largest Contentful Paint Type            | `lcpt`                       | The LCP target's Element type (see `ELEMENT_TYPE_ENUM`)                                                                                        |
| Largest Contentful Paint (since visible) | `lcpv`                       | The time in ms for largest contentful element to display, offset by first visible time. Based on render time, falls back to load time.         |
| DOM Complete                             | `domComplete`                | Time immediately before the browser sets the current document readiness of the current document to complete                                    |
| DOM Content Loaded Event End             | `domContentLoadedEventEnd`   | Time immediately after the current document's DOMContentLoaded event completes                                                                 |
| DOM Content Loaded Event Start           | `domContentLoadedEventStart` | Time immediately before the user agent fires the DOMContentLoaded event at the current document                                                |
| DOM Interactive                          | `domInteractive`             | Time immediately before the user agent sets the current document readiness of the current document to interactive                              |
| Load Event End                           | `loadEventEnd`               | Time when the load event of the current document is completed                                                                                  |
| Load Event Start                         | `loadEventStart`             | Time immediately before the load event of the current document is fired                                                                        |
| Request Start                            | `requestStart`               | Time immediately before the user agent starts requesting the resource from the server                                                          |
| Response Start                           | `responseStart`              | Time immediately after the user agent's HTTP parser receives the first byte of the response from the server                                    |
