### Tick Events

When implementing a viewer one can use the tick events for performance tracking.

We use very short string names as tick labels, so the table below
further describes these labels.
Every start label has an assumed e\_`label` for its "end" counterpart label.
As an example if we executed `perf.tick('label')` we assume we have a counterpart
`perf.tick('e_label')`.

| Name                                     | id      | Description                                                                                                                             |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| First contentful paint time              | `fcp`   | First paint with content. See https://github.com/WICG/paint-timing                                                                      |
| First contentful paint (since visible)   | `fcpv`  | First paint with content, offset by first visible time                                                                                  |
| First input delay                        | `fid`   | Millisecond delay in handling the first user input on the page. See https://github.com/WICG/event-timing                                |
| Cumulative Layout Shift                  | `cls`   | The current maximum layout shift score with 5s windows and a 1s session gap. See https://web.dev/layout-instability-api                 |
| Cumulative Layout Shift Type Union       | `clstu` | The bitwise union of all Element types that caused layout shift (see `ELEMENT_TYPE`)                                                    |
| Cumulative Layout Shift, first exit      | `cls-1` | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the first time.  |
| Cumulative Layout Shift, second exit     | `cls-2` | The aggregate layout shift score when the user leaves the page (navigation, tab switching, dismissing application) for the second time. |
| Largest Contentful Paint                 | `lcp`   | The time in milliseconds for the largest contentful element to display.                                                                 |
| Largest Contentful Paint Type            | `lcpt`  | The LCP target's Element type (see `ELEMENT_TYPE`)                                                                                      |
| Largest Contentful Paint (since visible) | `lcpv`  | The time in ms for largest contentful element to display, offset by first visible time. Based on render time, falls back to load time.  |
