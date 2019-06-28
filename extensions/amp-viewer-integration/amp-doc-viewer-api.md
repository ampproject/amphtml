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

# AMP Viewer/Document API

## Introduction

This document explains the API between an AMP viewer and the AMP document(s) it contains.

## API

### Initialization
When an AMP viewer opens an AMP document, it can include initialization parameters. The parameters are set as key value pairs encoded as a query string in the hash fragment of the AMP document URL. For example:
https://cdn.ampproject.org/v/s/www.example.com/article.amp.html?amp_js_v=0.1#origin=https%3A%2F%2Fwww.google.com
Some parameters are read by the AMP runtime and configure its behavior and others are read by the viewer integration script in order to establish the communication channel used by the rest of the API. An initialization parameter is enabled or disabled via the '1' or  '0' value respectively.

#### Viewer Integration Script Parameters
The viewer integration script is added to documents served via a cache URL, e.g. https://cdn.ampproject.org/v/. This script adds behavior and enables communication with a parent Viewer.

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
| `viewerRenderTemplate`| `viewerRenderTemplate`| Proxies all mustache template rendering to the viewer. |
| `xhrInterceptor`      | `xhr`                 | Proxies all XHRs through the viewer.      |

 ```javascript
origin
string
The origin of the Viewer. The Viewer Integration will verify this is an allowed domain and this will be the target of all messages sent from the AMP document to the Viewer.
 ```

### AMP Runtime Parameters

| Parameter             | Data type | Description                               |
|-----------------------| ----------------------|-------------------------------------------|
| `cid`                 | `boolean` | Whether to request the Base Client ID from the Viewer.|
| `csi`                 | `boolean` | Whether the Viewer will collect latency metrics from the Document.|    
| `dialog`       | `boolean`   | Whether the Viewer will take responsibility for opening a dialog for an AMP Access login. If false, opening a login dialog does not involve the Viewer. If true, the Viewer must support openDialog.|
| `development`    | `boolean`            | Whether the AMP runtime is in development mode. Development mode will validate the AMP document and show its results in the developer console.|
| `history`       | `boolean`      | Whether the AMP Viewer will take over history management. If true, the viewer must support popHistory, pushHistory, and historyPopped.                     |
| `log`          | `boolean`          | Whether to turn on logging in the AMP runtime.  |
| `paddingTop`          | `integer`       | The paddingTop to apply to the document body in pixels. This is used to allow space for a title bar.|
| `prerenderSize`               | `integer`| The number of vertical screens to prerender. Resources within the range may be loaded before the document is visible.|
| `p2r`| `boolean`| Whether to Pull to Refresh is enabled. pull-to-refresh.js |
| `referrer`      | `string`                 | The referrer to use for AMP analytics.|


| `storage`      | `boolean`                 | Whether the Viewer will provide local storage. If true, then the Viewer must support loadStore and saveStore.|
| `viewerUrl`      | `string`                 | The url of the Viewer. This is the shareable Viewer URL and may be used as a fallback as part of AMP Access.
viewportType|
| `webview`      | `boolean`                 | Whether the document is being loaded in a WebView instead of an iframe. This will enable "embedded" mode for the document, which is needed for dialog to work.|
| `highlight`      | `string`                 | The information to highlight text. JSON-encoded string. |
| `referrer`      | `string`                 | The referrer to use for AMP analytics.|
| `referrer`      | `string`                 | The referrer to use for AMP analytics.|
| `referrer`      | `string`                 | The referrer to use for AMP analytics.|
| `referrer`      | `string`                 | The referrer to use for AMP analytics.|



enum: ['natural', 'natural-ios-embed']
The viewport type.
natural
Natural means that the AMP document can read the window dimensions and they will be correct.
natural-ios-embed
Viewport mode for use when the AMP document is displayed in an iframe on Mobile Safari. It works around quirks of Mobile Safari's iframe implementation by making the body scrollable rather than the document.
visibilityState
enum: [
	'hidden',  // deprecated, use 'inactive'
	'inactive',
	'paused',
	'visible',
	‘prerender’,
]
The initial visibility state of the AMP document.
prerender
The AMP document is being pre-rendered before being shown. It may be prerendered according to prerenderSize.
inactive or hidden
The document is not visible to the user.
paused
This document should stop loading new resources and pause any resources such as video. The document may still be visible to the user, but the viewer may be performing a performance sensitive operation such as a swipe.
visible
The document is active and visible to the user.

### Messaging
The AMP viewer and AMP document can communicate via an RPC-style communication channel. In the AMP runtime and in theWeb Viewer, this is implemented using Promises.

#### Viewer Integration Messages
The messages in this section are sent by the Viewer Integration Script and are not used by the AMP runtime.

#### Document to Viewer
channelOpen
This message is sent from the AMP document to the Viewer to tell it that the document is ready to receive messages.
Request
{}
Response
boolean
touchstart, touchmove, and touchend
These three messages are sent by the Viewer Integration Script to the Viewer and proxy touch events in the iframe.
Request
Object
A copy of a browser TouchEvent.
Response
undefined
unloaded
This message is sent in response to a window unloaded event in the document. The Viewer can use this to display an error if an unexpected unload occurs.
Request
true
Response
undefined
AMP Runtime Messages
Document to Viewer
Broadcast
This sends a message to the Viewer that will be broadcast to every other AMP document open in the Viewer.
Request
*
Any value may be broadcast.
Response
Array<*>
The response is an array of the responses from the other documents.
bindReady
Sent from AMP pages that use the amp-bind extension. Informs the viewer that amp-bind has completed initialization.
Request
undefined
Response
undefined
cancelFullOverlay
Requests that Full Overlay mode is cancelled. If the header was hidden, it should be restored.
Request
undefined
Response
undefined
The response is sent once viewer exits Full Overlay mode.
cid
Requests the scoped  Client ID. See Client identifiers in AMP.
Request
undefined
Response
string
The scoped Client ID.
documentHeight
The AMP runtime sends this request to the Viewer when the height of the document content changes.
Request
{'height’: (number)}
Response
undefined
documentLoaded
The AMP runtime sends this request to the Viewer when it has fully loaded and is ready for display.
Request
{
	'linkRels': (Map<string, Array<string>>),
	'metaTags': (Map<string, Array<string>>),
	'title': (string),
	'sourceUrl': (string)	
}

Where:
linkRels maps the document’s <link> tags from rel to hrefs.
linkRels['canonical'] is the document’s canonical URL.
metaTags maps the document’s <meta> tags from name to contents.
metaTags['theme-color'] is the document’s theme-color. 
title is the document’s page title.

Response
undefined

loadStore
Requests the local storage blob for the document's origin.
Request
{
	'origin': (string)
}
Response
{
	'blob': (string)
}
openDialog
Requests that the AMP Access dialog with a specified URL is opened by the Viewer. 
Request
{
	'url': (string)
}
Response
string
The response is the token string from the dialog if the flow completed successfully. If the dialog is closed without completing the flow, then the response is rejected.
popHistory
Requests that an entry is popped off the history stack down to the new stackIndex value.

Request
{
	'stackIndex': (string)
}
stackIndex specifies the new stack index.
Response
undefined
The response resolves once the history pop is complete.
prerenderComplete
Notifies the viewer that prerendering of viewport is complete.
Request
undefined
Response
undefined
pushHistory
Pushes the new stack index onto the history stack.
Request
{
	'stackIndex': (string)
}
stackIndex specifies the new stack index.
Response
undefined
The response resolves once the history pop is complete. It rejects on an invalid stack index.
replaceHistory
Replaces the fragment value in history state (without pushing or popping). Used to implement share tracking.
Request
{
	'fragment': (string)
}
fragment specifies the new fragment (hash) value in the current history frame.
Response
undefined
The response resolves once the replacement is complete.

requestFullOverlay
Requests that the Viewer enter Full Overlay mode. In this mode, the title bar may be hidden.
Request
undefined
Response
undefined
The response is resolved once viewer enters Full Overlay mode.
saveStore
Requests that the specified blob is stored to local storage for the document's origin.
Request
{
	'origin': (string)
	'blob': (string)
}
Response
undefined
The response resolves once the blob has been successfully stored.

sendCsi
Requests that the CSI ticks are flushed. See tick.
Request
undefined
Response
undefined
setFlushParams
Sets arbitrary additional parameters to be included in the CSI flush. See sendCsi.
Request
Object
Response
undefined
tick
Records a timing measurement.
Request
{
	'label': (string)  // The label of this tick.
	'from': (string)  // The label of another tick to use timing reference
	'value': (number)  // The time to record.
}
Response
undefined
Viewer to Document
broadcast
Forwards a broadcasted message received by the Viewer.
Request
*
Any value may be broadcast.
Response
*
Any value may be returned.
historyPopped
This informs the document that the history stack has been popped down to the new index.
Request
{
	'newStackIndex': (number)
}
Response
undefined
scrollLock
Requests that scrolling should be enabled or disabled in the document by calling preventDefault() on any touchmove events. Requires the swipe capability. Will not stop the user from scrolling using a non-touch input device e.g. mouse/keyboard.
Request
boolean
Response
undefined
disableScroll
Requests that scrolling should be enabled or disabled in the document by setting overflow: hidden on the viewport.
Request
boolean
Response
undefined
visibilitychange
Notifies the document that its visibility state has changed.
Request
{
	'prerenderSize': (number)  // See prerenderSize
	'state': (string)  // See visibilityState
}
Response
undefined
willLikelyUnload
Notifies the document that it is likely that it will be imminently unloaded, but it may not be.
Request
{}
Response
undefined

xhr
Notifies the document that an XHR fires.
Request
{
input: (string),
init: (!FetchInitDef)  //  Serialized fetch request
}
Response
{
response: {JsonObject|string|undefined}  // The structurally-cloneable response to convert back to a regular Response.
}

viewerRenderTemplate
Notifies the document that an XHR fires along with mustache template(s) to render the third party endpoint response.
Request
{
originalRequest: {
input: (string),
init: (!FetchInitDef)  //  Serialized fetch request
}
ampComponent: {
	type: (string),
	successTemplate: {
		type: (string),
		payload: (string),
},
	errorTemplate: {
		type: (string),
		payload: (string),
}
}
}
Response
{
	html: (string),
response: {JsonObject|string|undefined}  // The structurally-cloneable response to convert back to a regular Response.
}
highlightDismiss
Notifies the document that users selected to dismiss text highlighting by interacting UI on the viewer.
Request
{}
Response
undefined

highlightShown
Notifies the viewer that text highlighting is displayed in the document.
Request
{}
Response
undefined
