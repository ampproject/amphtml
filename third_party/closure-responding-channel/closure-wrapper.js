/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Export custom functions for some goog.messaging libraries. The functions are basically wrappers around the real
 * implementation in Closure library.
 */

goog.require('goog.messaging.PortChannel');
goog.require('goog.messaging.RespondingChannel');
goog.require('goog.messaging.PortOperator');
goog.requireType('goog.messaging.MessageChannel');

/**
* @param {!Window} frameWindow The window object to communicate with.
 * @param {string} origin The expected origin of the window. See
 *     http://dev.w3.org/html5/postmsg/#dom-window-postmessage.
 *  */
function createPortChannel(frameWindow, origin) {
  return goog.messaging.PortChannel.forEmbeddedWindow(
    frameWindow,
    origin
  );
}

/**
 * @param {goog.messaging.MessageChannel} portChannel The underlying PortChannel.
 * @param {Map<string, function(Object)>} serviceHandlersMap A map of services and the corresponding handlers.
 * @return {goog.messaging.RespondingChannel} The RespondingChannel used to communicate with underlying PortChannel.
 */
function createRespondingChannel(portChannel, serviceHandlersMap) {
  const respondingChannel = new goog.messaging.RespondingChannel(portChannel);

  serviceHandlersMap.forEach((_, serviceName, serviceHandlersMap) => {
    if (serviceName != null) {
      const serviceHandler = serviceHandlersMap.get(serviceName);
      if (serviceHandler != null) {
        respondingChannel.registerService(
          serviceName,
          serviceHandler
        );
      }
    }
  });

  return respondingChannel;
}

/**
 * @return {goog.messaging.PortOperator} The PortOperator in runtime that manages the port network.
 */
function createPortOperator() {
  return new goog.messaging.PortOperator("RuntimeService");
}

/**
 * @param {goog.messaging.PortOperator} portOperator The runtime PortOperator.
 * @param {string} portName The name of the port to be added to the port network.
 * @param {!goog.messaging.MessageChannel} portChannel The channel of the port to be added to the port network.
 */
function addPort(portOperator, portName, portChannel) {
  portOperator.addPort(portName, portChannel);
}

goog.exportSymbol('__AMP_createPortChannel', createPortChannel);
goog.exportSymbol('__AMP_createRespondingChannel', createRespondingChannel);
goog.exportSymbol('__AMP_createPortOperator', createPortOperator);
goog.exportSymbol('__AMP_addPort', addPort);
