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

### Viewer Capabilities

Viewers can communicate their supported "capabilities" to documents through the
`cap` init parameter, specified as a comma-separated list.

| Parameter             | Supported messages    | Description                               |
|-----------------------| ----------------------|-------------------------------------------|
| `a2a`                 | `a2aNavigate`         | AMP-to-AMP (A2A) document linking support.|
| `cid`                 | `cid`                 | Client ID service.                        |    
| `errorReporter`       | `error`               | Error reporter.                           |
| `fragment`            | `fragment`            | URL fragment support for the history API. |
| `handshakepoll`       | `handshake-poll`      | Mobile web handshake.                     |
| `navigateTo`          | `navigateTo`          | Support for navigating to external URLs.  |
| `replaceUrl`          | `getReplaceUrl`       | Support for replacing the document URL with one provided by the viewer.|
| `swipe`               | `touchstart`, `touchmove`, `touchend`| Forwards touch events from the document to the viewer.|
| `xhrInterceptor`      | `xhr`                 | Proxies all XHRs through the viewer.      |
