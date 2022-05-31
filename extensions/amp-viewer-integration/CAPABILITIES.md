### Viewer Capabilities

Viewers can communicate their supported "capabilities" to documents through the
`cap` init parameter, specified as a comma-separated list.

| Parameter              | Supported messages                    | Description                                                                     |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `a2a`                  | `a2aNavigate`                         | AMP-to-AMP (A2A) document linking support.                                      |
| `cid`                  | `cid`                                 | Client ID service.                                                              |
| `errorReporter`        | `error`                               | Error reporter.                                                                 |
| `fragment`             | `fragment`                            | URL fragment support for the history API.                                       |
| `handshakepoll`        | `handshake-poll`                      | Mobile web handshake.                                                           |
| `iframeScroll`         |                                       | Viewer platform supports and configures scrolling on the AMP document's iframe. |
| `interceptNavigation`  | `navigateTo`                          | Support for navigating to external URLs.                                        |
| `navigateTo`           | `navigateTo`                          | Support for navigating to external URLs within a native app.                    |
| `replaceUrl`           | `getReplaceUrl`                       | Support for replacing the document URL with one provided by the viewer.         |
| `swipe`                | `touchstart`, `touchmove`, `touchend` | Forwards touch events from the document to the viewer.                          |
| `viewerRenderTemplate` | `viewerRenderTemplate`                | Proxies all mustache template rendering to the viewer.                          |
| `xhrInterceptor`       | `xhr`                                 | Proxies all XHRs through the viewer.                                            |
