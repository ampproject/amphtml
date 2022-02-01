import {Keys_Enum} from '#core/constants/key-codes';

import {listen} from '#utils/event-helper';

/**
 * The list of keyboard event properites to forward to the viewer. This should
 * be kept up-to-date with
 * https://www.w3.org/TR/uievents/#keyboardevent-keyboardevent.
 *
 * @type {!Array<string>}
 */
const eventProperties = [
  'key',
  'code',
  'location',

  'ctrlKey',
  'shiftKey',
  'altKey',
  'metaKey',

  'repeat',
  'isComposing',

  // Properties for legacy user agents.
  'charCode',
  'keyCode',
  'which',
];

/**
 * Forwards keyboard events from the AMP doc to the viewer in the format of a
 * `KeyboardEventInit` object (http://mdn.io/KeyboardEvent/KeyboardEvent).
 * `JsonObject`.
 *
 * Keyboard events that are forwarded must meet the *one* of the following
 * conditions:
 *
 * - The key is the escape key
 * - The focus is on a checkbox and the key is not the space key
 * - The focus is not on any input control, including elements with the
 *   `contenteditable` attribute
 *
 * @package @final
 */
export class KeyboardHandler {
  /**
   * @param {!Window} win
   * @param {!./messaging/messaging.Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;

    /** @const @private {!./messaging/messaging.Messaging} */
    this.messaging_ = messaging;

    this.listenForKeyboardEvents_();
  }

  /** @private */
  listenForKeyboardEvents_() {
    const handleEvent = this.handleEvent_.bind(this);
    listen(this.win, 'keydown', handleEvent);
    listen(this.win, 'keypress', handleEvent);
    listen(this.win, 'keyup', handleEvent);
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleEvent_(e) {
    if (isHandledByEventTarget(e)) {
      return;
    }
    this.forwardEventToViewer_(e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  forwardEventToViewer_(e) {
    this.messaging_.sendRequest(
      e.type,
      getKeyboardEventInit(e),
      /* awaitResponse */ false
    );
  }
}

/**
 * Checks whether the given keyboard event is expected to be handled by its
 * event target.
 *
 * @param {!Event} e
 * @return {boolean}
 */
function isHandledByEventTarget(e) {
  if (e.defaultPrevented) {
    // Various AMP components consume keyboard events by preventing the default.
    return true;
  }
  if (e.key == Keys_Enum.ESCAPE) {
    // ESC is always a valid key for things like keyboard shortcuts, even if the
    // focus is on an input control, for example.
    return false;
  }
  switch (e.target.nodeName) {
    case 'INPUT':
      // For checkboxes, only allow swallowing the space key event.
      return e.target.type != 'checkbox' || e.key == Keys_Enum.SPACE;
    case 'TEXTAREA':
    case 'BUTTON':
    case 'SELECT':
    case 'OPTION':
      return true;
  }

  // Top-level event targets like `window` and `document` are not instance
  // of `Element` and do not have a `hasAttribute` function.
  return e.target.hasAttribute && e.target.hasAttribute('contenteditable');
}

/**
 * @param {!Event} e
 * @return {!JsonObject}
 */
function getKeyboardEventInit(e) {
  const copiedEvent = {};
  eventProperties.forEach((eventProperty) => {
    if (e[eventProperty] !== undefined) {
      copiedEvent[eventProperty] = e[eventProperty];
    }
  });
  return copiedEvent;
}
