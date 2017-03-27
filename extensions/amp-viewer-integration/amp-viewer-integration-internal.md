<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-viewer-integration"></a> `amp-viewer-integration`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>AMP Viewer Integration component</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</div><div>Work in progress.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-viewer-integration" src="https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Introduction

This document explains the communication between an AMP Viewer and AMP documents by using the open-source AMP Viewer Integration API.  The [AMP Viewer Integration API] (https://github.com/ampproject/amphtml/tree/master/extensions/amp-viewer-integration) provides a protocol to establish a connection and send messages between the AMP Viewer and AMP documents.

<img src="https://avatars1.githubusercontent.com/u/14114390?v=3&s=200"></img>

## How the AMP Viewer Integration API works
In this section, you'll learn how the AMP Viewer and AMP document establish connections to communicate in mobile web and in webview.

### Communicating between Doc and Viewer in Mobile Web
In mobile web, the AMP document is an iframe inside of the AMP Viewer. The Viewer is the parent of the AMP document and the AMP document can easily access the Viewer. The Viewer and document are able to communicate directly by using the `POST` request method.

#### Establishing a handshake on mobile web
To establish communication between the AMP Viewer and AMP Document, we need to establish a handshake between the two.  Let's illustrate how to establish a handshake on mobile web.

1. The AMP Viewer waits for the AMP document to load. The Viewer listens on its window for a `message` event.
<img src="https://avatars1.githubusercontent.com/u/14114390?v=3&s=200"></img>

2. As soon as the AMP document loads, the AMP document sends a message to the Viewer (its parent) using `postMessage()`.

<img src="https://avatars1.githubusercontent.com/u/14114390?v=3&s=200"></img>

The message from the AMP Document to the AMP Viewer looks like this:

```html
{
  app: “__AMPHTML__”,     // Hey viewer, it's me AMP Doc!
  requestid: 1,           // A unique ID for the request
  type: “q”,              // Represents a REQUEST
  name: “channelOpen”,    // Let’s shake hands
  data: {
    url: “amp...yoursite.com”,   // from the amp cache
    sourceUrl: “yoursite.com”    // the original source url
  }
  rsvp: true              // response required
};
```

3. The AMP Viewer responds to the AMP Document by also using `postMessage()`.

<img src="https://avatars1.githubusercontent.com/u/14114390?v=3&s=200"></img>

The message from the Viewer to the AMP Document looks like this:

```html
{
  app: “__AMPHTML__”,    // Hey AMP Doc, it's me AMP Viewer! 
  type: “s”,             // Represents a RESPONSE
  requestid: 1,          // The same ID used in the REQUEST
};
```

4. The Viewer and AMP Document are now introduced, and they can start posting messages to each other.
<img src="https://avatars1.githubusercontent.com/u/14114390?v=3&s=200"></img>