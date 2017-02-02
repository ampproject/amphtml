/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Super crude way to share ViewerMessaging class without any kind of module
 * system or packaging.
 * @param {!Function} callback
 */
function whenMessagingLoaded(callback) {
  window['__AMP_VIEWER_MESSAGING_CALLBACK'] = callback;
  var script = document.createElement('script');
  script.src = './viewer-integr-messaging.js';
  document.head.appendChild(script);
}


/**
 * This is a very naive implementation of Viewer/AMP integration, but it
 * showcases all main APIs exposed by Viewer which are
 * {@link Viewer.receiveMessage} and {@link Viewer.setMessageDeliverer}.
 *
 * The main thing that's missing in this file is any form of security
 * validation. In the real world, postMessage and message event handler
 * should both set origin information and validate it when received.
 */
(window.AMP = window.AMP || []).push(function(AMP) {

  var viewer = AMP.viewer;

  if (window.parent && window.parent != window) {
    var handshakePromise = new Promise(function(resolve) {
      var unconfirmedViewerOrigin = viewer.getParam('origin');
      if (!unconfirmedViewerOrigin) {
        throw new Error('Expected viewer origin must be specified!');
      }

      var listener = function(event) {
        if (event.origin == unconfirmedViewerOrigin &&
                event.data == 'amp-handshake-response' &&
                (!event.source || event.source == window.parent)) {
          window.removeEventListener('message', listener, false);
          resolve(event.origin);
        }
      };
      window.addEventListener('message', listener, false);

      window.parent./*OK*/postMessage('channelOpen',
          unconfirmedViewerOrigin);
    });

    whenMessagingLoaded(function(ViewerMessaging) {
      handshakePromise.then(function(viewerOrigin) {
        var messaging = new ViewerMessaging(window.parent, viewerOrigin,
            function(type, payload, awaitResponse) {
              return viewer.receiveMessage(type, payload, awaitResponse);
            }, window.location.href);
        viewer.setMessageDeliverer(function(type, payload, awaitResponse) {
          return messaging.sendRequest(type, payload, awaitResponse);
        }, viewerOrigin);
      });
    });
  }
});
