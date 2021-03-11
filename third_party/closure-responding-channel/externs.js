/**
 * @fileoverview Custom API of Closure library for amp-google-assistant-assistjs.
 * @externs
 */

/**
 * @interface
 */
 goog.messaging.MessageChannel = function() {};
 
/**
 * @interface
 * @suppress {duplicate}
 */
 goog.messaging.PortNetwork = function() {};

 /**
  * The central node of a PortNetwork.
  *
  * @param {string} name The name of this node.
  * @constructor
  * @extends {goog.Disposable}
  * @implements {goog.messaging.PortNetwork}
  * @final
  * @suppress {duplicate}
  */
 goog.messaging.PortOperator = function(name) {};
 
 /**
  * Adds a caller to the network with the given name. This port should have no
  * services registered on it. It will be disposed along with the PortOperator.
  *
  * @param {string} name The name of the port to add.
  * @param {!goog.messaging.MessageChannel} port The port to add. Must be either
  *     a {@link goog.messaging.PortChannel} or a decorator wrapping a
  *     PortChannel; in particular, it must be able to send and receive
  *     {@link MessagePort}s.
  * @suppress {duplicate}
  */
 goog.messaging.PortOperator.prototype.addPort = function(name, port) {};