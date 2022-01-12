import * as mode from '#core/mode';

let shouldSerialize = false;

/**
 * In any mode except test, this function behaves calls addEventListener and exits.
 * In test mode, it provides the ability to toggle "serialization" mode on, which
 * serializes the event listener as attributes on the node.
 *
 * @param {Element} element
 * @param {string} event
 * @param {function(T):void} handler
 * @template {Event} T
 */
export function addSerializedEventListener(element, event, handler) {
  element.addEventListener(event, handler);
  if (!mode.isTest() || !shouldSerialize) {
    return;
  }

  const onEvent = `data-test-on${event[0].toUpperCase()}${event.slice(1)}`;
  let handlers = element.getAttribute(onEvent) ?? '';
  if (handlers) {
    handlers += ',';
  }
  handlers += handler.name;
  element.setAttribute(onEvent, handlers);
}

/**
 * Enables serialization of event handlers
 */
export function enableEventListenerSerialization() {
  shouldSerialize = true;
}

/**
 * Disables serialization of event handlers
 */
export function disableEventListenerSerialization() {
  shouldSerialize = false;
}
