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

# amp-access-iframe-api

The access iframe is an experimental implementation of access protocol. It requires "amp-access-iframe" experiment turned on in the AMP document for it to work.

The `AmpAccessIframeApi` is the entry point for access iframe implementation. As its main parameter it requires an instance of `AccessController`, which simply implements all methods of access protocol such as `authorize` and `pingback`.

The instrumentation would normally look like this:

```
/** Implements AccessController interface */
class Controller {
  connect(origin, protocol, config) {
    // Initialize the controller.
    // Important! Ensure that the "origin" is an acceptable value.
  }

  authorize() {
    // Return a promise that will yield the authorization response.
  }

  pingback() {
    // Handle the "impression" event.
  }
}

var iframeApi = new AmpAccessIframeApi(new Controller());
iframeApi.connect();
```
