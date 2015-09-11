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
 * This is a very naive implementation of Viewer/AMP integration, but it
 * showcases all main APIs exposed by Viewer which are
 * {@link Viewer.receiveMessage} and {@link Viewer.setMessageDeliverer}.
 *
 * The main thing that's missing in this file is any form of security
 * validation. In the real world, postMessage and message event handler
 * should both set origin information and validate it when received.
 */
(window.AMP = window.AMP || []).push(function(AMP) {

  var SENTINEL = '__AMP__';
  var viewer = AMP.viewer;

  function onMessage(event) {
    var data = event.data;

    // TODO: must check for origin/target.
    if (data['sentinel'] == SENTINEL) {
      viewer.receiveMessage(data['type'], data);
    }
  }

  window.addEventListener('message', onMessage, false);


  function sendMessage(eventType, data) {
    // TODO: must check for origin/target.
    data['sentinel'] = SENTINEL;
    data['type'] = eventType;
    window.parent.postMessage(data, '*');
  }

  viewer.setMessageDeliverer(sendMessage);
});
