# AMP Viewer Messaging

[![npm version](https://badge.fury.io/js/%40ampproject%2Fviewer-messaging.svg)](https://badge.fury.io/js/%40ampproject%2Fviewer-messaging)

The AMP Viewer Messaging library allows an AMP Viewer to establish a
communication channel with an AMP document.

See [Connecting AMP Viewers with AMP pages](https://github.com/ampproject/amphtml/blob/main/extensions/amp-viewer-integration/integrating-viewer-with-amp-doc-guide.md)
for more information.

## Installation

Install via:

```sh
npm i @ampproject/viewer-messaging
```

## Usage

Assuming you have an AMP document hosted on `https://example.com/amp-document`:

```js
import {Messaging} from '@ampproject/viewer-messaging';

const iframe = document.createElement('iframe');
iframe.setAttribute(
  'src',
  `https://example.com/amp-document#origin=${window.location.origin}`
);
document.body.appendChild(iframe);

const messaging = await Messaging.waitForHandshakeFromDocument(
  /* source window */ window,
  /* target window */ iframe.contentWindow,
  /* target origin */ 'https://example.com'
);
messaging.setDefaultHandler((name, data, rsvp) => {
  console.log(`Received message: ${name}`);
});
// use messaging.sendRequest(...) to make requests to the AMP document
```

Note: The AMP document needs to include the `amp-viewer-integration` script:

<!-- prettier-ignore-start -->
```html
<script async src="https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js"></script>
```
<!-- prettier-ignore-end -->
