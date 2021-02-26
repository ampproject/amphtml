/**
 * @fileoverview Export a custom function to create RespondingChannel. The function is basically a wrapper around the real
 * implementation in Closure library.
 */

goog.require('goog.messaging.PortChannel');
goog.require('goog.messaging.RespondingChannel');

function createRC(frameWindow, origin, serviceHandlersMap) {
  const portChannel =
      goog.messaging.PortChannel.forEmbeddedWindow(frameWindow, origin);
  const respondingChannel = new goog.messaging.RespondingChannel(portChannel);

  serviceHandlersMap.keys().forEach(serviceName => {
    if (serviceName != null && serviceHandlersMap.get(serviceName) != null) {
      respondingChannel.registerService(serviceName, serviceHandlersMap.get(serviceName));
    }
  });

  return respondingChannel;
}

goog.exportSymbol('createRC', createRC);
