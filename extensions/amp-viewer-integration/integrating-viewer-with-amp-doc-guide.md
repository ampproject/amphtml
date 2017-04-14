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

# Connecting AMP Viewers with AMP pages

## Introduction

This document explains the communication between a Viewer and AMP documents by using the open-source [AMP Viewer Integration API](https://github.com/ampproject/amphtml/tree/master/extensions/amp-viewer-integration).  The AMP Viewer Integration API provides a protocol to establish a connection and send messages between the Viewer and AMP documents.

<img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/intro.png" height="300px"></img>

A Viewer is a container in which you can view AMP Documents. An AMP Document is a document created with the AMPHTML library and validated by the [AMP Validator](https://validator.ampproject.org/).

## How the AMP Viewer Integration API works
In this section, you'll learn how the AMP Viewer and AMP document establish connections to communicate in mobile web and in webview.

### Communicating between Doc and Viewer in Mobile Web
In mobile web, the AMP document is an iframe inside of the Viewer. The Viewer is the parent of the AMP document and the AMP document can easily access the Viewer. The Viewer and document are able to communicate directly by using the `POST` request method.

#### Establishing a handshake on mobile web
To establish communication between the Viewer and AMP Document, we need to establish a handshake between the two.  Let's illustrate how to establish a handshake on mobile web.

1. The Viewer waits for the AMP document to load. The Viewer listens on its window for a `message` event.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/mobile-web-handshake1.png" height="300px"></img>

2. As soon as the AMP document loads, the AMP document sends a message to the Viewer (its parent) using `postMessage()`.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/mobile-web-handshake2.png" height="300px"></img>

   The message from the AMP Document to the Viewer looks like this:

   ```javascript
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

3. The Viewer responds to the AMP Document by also using `postMessage()`.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/mobile-web-handshake3.png" height="300px"></img>

   The message from the Viewer to the AMP Document looks like this:

   ```javascript
   {
     app: “__AMPHTML__”,    // Hey AMP Doc, it's me Viewer! 
     type: “s”,             // Represents a RESPONSE
     requestid: 1,          // The same ID used in the REQUEST
   };
   ```

4. The Viewer and AMP Document are now introduced, and they can start posting messages to each other.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/mobile-web-handshake4.png" height="300px"></img>


### Communicating between Doc and Viewer in Webview

Webview is for Native apps.  In Webview, the Viewer can see the AMP document, but the AMP document cannot identify the Viewer.  The Viewer can talk to the AMP document, but the AMP document doesn’t know who to respond to. To allow communication between the two, we need to create a 2-way connection.

<img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-connection1.png" height="300px"></img>

#### Creating a 2-way connection

1. The Viewer starts by polling the AMP Document every x milliseconds until the AMP Document is loaded and ready.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-connection2.png" height="300px"></img>

2. When the AMP document loads, it receives a “Are you there?”  polling message but the AMP document doesn't know who to respond to.  For this reason, the Viewer uses the [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API) to create a 2-way connection.

3. The Viewer creates two ports: one for the Viewer and one for the AMP Document. The Viewer sends a port with its polling message to the AMP Document.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-connection3.png" height="300px"></img>

   The message sent from the Viewer to the AMP Doc is done using the `POST` request method. The post contains the following message:

   ```javascript
   var message = {
     app: ‘__AMPHTML__’,       // Hey AMP Doc, it's me Viewer!
     name: ‘handshake-poll’,   // I’m polling you so we can shake hands.
   };
   ```

   In the POST, the Viewer also sends the port to the AMP Doc and it looks like this:

   ```javascript
   var channel = new MessageChannel();
   ampdoc.postMessage(message, ‘*’, [channel.port2]);
   ```

4. Eventually, the AMP Document loads and receives the message and the port.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-connection4.png" height="300px"></img>

5. A 2-way connection is established where the Viewer can send messages to the AMP Doc and the AMP Doc can send messages to the Viewer!

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-connection5.png" height="300px"></img>

6. Now that the connection is set up, we need to establish the handshake between the Viewer and the AMP document. 


#### Establishing a handshake on webview
In the previous section, we set up the connection between the Viewer and AMP Document, now we need to establish a handshake between the two.

1. The AMP Doc sends a message to the Viewer over the port.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-handshake1.png" height="300px"></img>
   
   The message from the AMP document looks like this:
   
   ```javascript
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

2. The Viewer responds to the AMP document over the port.

   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-handshake2.png" height="300px"></img>

   The message looks like this:
   
   ```javascript
   {
     app: “__AMPHTML__”,    // Hey AMP Doc, it's me Viewer! 
     type: “s”,             // Represents a RESPONSE
     requestid: 1,          // The same ID used in the REQUEST
   };
   ```

3. The handshake is established and now the Viewer and AMP Document can start communicating.
   
   <img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/webview-handshake3.png" height="300px"></img>



## Using the Integration API with the Viewer


### How to enable AMP Viewer integration
The AMP Viewer integration API must be enabled in the Viewer and in the AMP cache.

#### Google AMP Cache
If the Viewer uses the Google AMP Cache, the AMP Cache URL in the Viewer must be as follows:

   ```html
   https://...cdn.ampproject.org/v/s/origin?amp_js_v=0.1
   ```

   Where `/v/` and `amp_js_v=0.1` add the messaging scripts to the AMP page.

#### Other AMP Caches
If the Viewer uses an AMP cache other than the Google AMP Cache, refer to the Cache provider’s documentation for required settings.

#### AMP Cache Providers
AMP Cache providers must include the [amp-viewer-integration](https://github.com/ampproject/amphtml/tree/master/extensions/amp-viewer-integration) component in the cached AMP documents like this:

   ```html
   <script async src=”../amp-viewer-integration”>
   ```


### Specifying Viewer Init Params
1. In the Viewer, you need to create initialization parameters in a hash:
   
   ```javascript
   var initParams = {
     origin: “http://yourAmpDocsOrigin.com”
     someOtherParam: “someValue,anotherValue”
   };
   ```

2. Using `encodeUriComponent`, convert the hash to query string format:
      * Separated by `&`
      * Encoded to UTF-8 (`','` -> `'%2C'`, `':'` -> `'%3A'`, `'/'` -> `'%2F'`, etc)

3. Add the query string to the AMP Cache URL:
   ```html
   https://cdn.ampproject.org/v/s/origin?amp_js_v=0.1#origin=http%3A%2F%2FyourAmpDocsOrigin.com&someOtherParam=someValue%2CanotherValue
   ```


### Composing messages
A message can be either an Object, or a String that’s serialized using JSON stringify. A message can contain the following fields:

   ```javascript
   {
     app: string,
     type: string,
     requestid: number,
     name: string,
     data: *,
     rsvp: boolean,
     error: string
   };
   ```

   * __app__: A sentinel that both the Viewer and AMP Documents will use to know that the message they’ve received is a part of the AMP Viewer Integrations API. The value should always be set to `'__AMPHTML__'`.
   * __type__: This signals that the message is either a request or a response. 
      * For a request message, specify a value of `'q'`.
      * For a response message, specify a value of `'s'`.
   * __requestid__: A unique ID to identify the request. A simple request counter that increases its value with each request message should work just fine.
   * __name__: Specifies the message name. More API’s can be found [here](https://github.com/ampproject/amphtml/tree/master/viewer-api).
   * __rsvp__: Set to `true` if you need a response to your message; otherwise, `false`.
   * __data__: The data you need to send with your message.
   * __error__: The string explaining the error that occurred. Only used in a response.


### Establishing handshakes
There are two types of handshakes: 

1. A handshake initiated by the AMP Document (typically used in Mobile Web).
2. A handshake initiated by the Viewer (typically used in Webview).  In this case, the Viewer polls the AMP Document every X milliseconds to initiate the handshake. There are two ways to do this:
   * Mobile Web
   * Webview (Native apps)

#### AMP Document-initiated handshake
To establish a handshake initiated by the AMP Document:

1. The AMP Document initiates the handshake by sending a request to the Viewer via `POST`:
   
   ```javascript
   {
     app: "__AMPHTML__",  
     requestid: 1,  
     type: "q",  
     name: "channelOpen",  
     data: {
       url: “amp...yoursite.com”,  
       sourceUrl: “yoursite.com” 
     }
     rsvp: true,
   };
   ```
2. The Viewer needs to acknowledge the request and respond via `POST`:

   ```javascript
   {
     app: “__AMPHTML__”,  
     type: “s”,  
     requestid: 1,  
   };
   ```

#### Viewer-initiated handshake (polling)

__Webview handshake__

To enable the Webview messaging protocol with port exchange, the Viewer Init Params should include `webview=1` and the AMP Cache URLs should be in the following format:

   ```html
   https://cdn.ampproject.org/v/s/origin?amp_js_v=0.1#webview=1
   ```

In Webview, all messages sent between the Viewer and the AMP Document are serialized by using JSON stringify.

The Viewer should start by sending the following message every x milliseconds via POST:

   ```javascript
   var message = {
     app: ‘__AMPHTML__’,  
     name: ‘handshake-poll’,  
   };
   ```

In the `Post`, the Viewer should also send a port to the AMP Document: 

   ```javascript
   var channel = new MessageChannel();
   ampdoc.postMessage(message, ‘*’, [channel.port2]);
   ```

Eventually, the AMP Document loads and receives the message and port. There is now a 2-way connection where the Viewer can send messages to the AMP Doc and the AMP Doc can send messages to the Viewer. 

The Viewer will send and receive messages over `channel.port1`, and the AMP Doc will send and receive messages over `channel.port2` (See [ChannelMessagingApi](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API) for details).

The handshake can now begin.

The AMP Document sends the following message to the Viewer over the port:

   ```javascript
   {
     app: “__AMPHTML__”,  
     requestid: 1,  
     type: “q”,  
     name: “channelOpen”,  
     data: {
       url: “amp...yoursite.com”,  
       sourceUrl: “yoursite.com” 
     }
     rsvp: true,
   };
   ```

The Viewer needs to respond with the following message over the port: 

   ```javascript
   {
     app: “__AMPHTML__”,  
     type: “s”,  
     requestid: 1,  
   };
   ```

And the handshake is established. 


__Mobile Web handshake__

In the Viewer Init Params, add the flag `cap="handshakepoll"`. 

_Example: Parameters in a hash_

   ```javascript
   var initParams = {
     origin: “http://yourAmpDocsOrigin.com”,
     cap: “handshakepoll”
   };
   ```

_Example: Parameters in a query string_

   ```html
   https://cdn.ampproject.org/v/s/origin?amp_js_v=0.1#origin=http%3A%2F%2FyourAmpDocsOrigin.com&cap=handshakepoll
   ```

This will tell the AMP Document not to send out the first message and, instead, wait for a message from the viewer. 

The Viewer should send the following message every x milliseconds via `POST`:

   ```javascript
   var message = {
     app: ‘__AMPHTML__’,  
     name: ‘handshake-poll’, 
   };
   ```

Eventually, the AMP Document receives and loads the message. The AMP Document sends the following  message to the Viewer via POST:

   ```javascript
   {
     app: “__AMPHTML__”,  
     requestid: 1,  
     type: “q”,  
     name: “channelOpen”,  
     data: {
       url: “amp...yoursite.com”,  
       sourceUrl: “yoursite.com” 
     }
     rsvp: true,
   };
   ```

The Viewer needs to respond with the following message via `POST`:

   ```javascript
   {
     app: “__AMPHTML__”, 
     type: “s”, 
     requestid: 1, 
   };
   ```

And the handshake is established. 


### Sending visibility change request via messaging

A message needs to be sent from the Viewer to the AMP Doc:

   ```javascript
   {
     app: “__AMPHTML__”,      
     requestid: 2,            
     type: “q”,              
     name: “visibilitychange”,     // The message type.
     data: {
       state: “the new state”,     // See visibility-state.js for allowed   
                                   // values.Can be “visible” or “hidden”. 
                                   // If “visible”, prerenderSize is 
                                   // ignored and the page loads fully.
       prerenderSize: 1         // # of Windows of content to prerender. 
                                // 0=no prerendering. 1=load resources for
                                // 1st screen, etc. Default is 1.
     }
     rsvp: true
   };
   ```

### Enabling swiping between AMP pages

<img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-viewer-integration/img/swipe.png" height="300px"></img>

Touch events go straight to the AMP Document. So how does the Viewer know when to animate an AMP doc out of view while bringing another one into view? The AMP Doc forwards all touch events to the Viewer. To enable this functionality, add `cap=swipe` to your Viewer Init Params:

   ```javascript
   var initParams = {
     origin: “http://yourAmpDocsOrigin.com”,
     cap: “foo,swipe”
   };
   ```

By specifying `cap=swipe` as an init parameter (fyi, `"cap"` stands for capabilities) , `#cap=swipe` will be added to the AMP Cache URL:

   ```html
   https://cdn.ampproject.org/v/s/origin?amp_js_v=0.1#origin=http%3A%2F%2FyourAmpDocsOrigin.com&cap=foo%2Cswipe
   ```

The forwarded touch events are:
* touchstart
* touchend
* touchmove

The message forwarded from the AMP Doc to the Viewer looks like this:

   ```javascript
   {
     app: “__AMPHTML__”,  
     requestid: 1,  
     type: “q”,  
     name: “touchmove”,  
     data: {
       … // The event data.
     }
     rsvp: false
   };
   ```


### Related Resources

* [Viewer API's](https://github.com/ampproject/amphtml/tree/master/viewer-api)
* [AMP Viewer Integration API repo](https://github.com/ampproject/amphtml/tree/master/extensions/amp-viewer-integration)
