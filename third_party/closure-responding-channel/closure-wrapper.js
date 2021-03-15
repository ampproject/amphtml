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

function createPortChannel(frameWindow, origin) {
  return goog.messaging.PortChannel.forEmbeddedWindow(
    frameWindow,
    origin
  );
}

function createRespondingChannel(portChannel, serviceHandlersMap) {
  const respondingChannel = new goog.messaging.RespondingChannel(portChannel);

  serviceHandlersMap.forEach((_, serviceName, serviceHandlersMap) => {
    if (serviceName != null && serviceHandlersMap.get(serviceName) != null) {
      respondingChannel.registerService(
        serviceName,
        serviceHandlersMap.get(serviceName)
      );
    }
  });

  return respondingChannel;
}

function createPortOperator() {
  return new goog.messaging.PortOperator("RuntimeService");
}

function addPort(portOperator, portName, portChannel) {
  portOperator.addPort(portName, portChannel);
}

goog.exportSymbol('__AMP_createPortChannel', createPortChannel);
goog.exportSymbol('__AMP_createRespondingChannel', createRespondingChannel);
goog.exportSymbol('__AMP_createPortOperator', createPortOperator);
goog.exportSymbol('__AMP_addPort', addPort);
