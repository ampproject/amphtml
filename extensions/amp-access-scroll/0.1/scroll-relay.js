import {listen} from '#core/3p-frame-messaging';

import {getData} from '#utils/event-helper';

/**
 * Provides cross-frame postMessage for scroll frames.
 */
export class Relay {
  /**
   * @param {string} domain - origin restriction for postMessage
   */
  constructor(domain) {
    /** @private @type {!Array<Window>} */
    this.frames_ = [];
    /** @private @type {!Array<function(JsonObject)>} */
    this.listeners_ = [];
    /** @private */
    this.origin_ = domain;

    this.onMessage_ = this.onMessage_.bind(this);

    listen(window, 'message', this.onMessage_);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onMessage_(e) {
    const data = /** @type {JsonObject} */ (getData(e));
    const fromScrollOrigin = e.origin === this.origin_;
    const isScrollAmpMessage = typeof data === 'object' && '_scramp' in data;
    const fromFrameInRelay = this.frames_.indexOf(e.source) > -1;
    if (!fromScrollOrigin || !fromFrameInRelay || !isScrollAmpMessage) {
      return;
    }

    this.listeners_.forEach((listener) => listener(data));

    // send message to all other frames in the relay
    this.frames_
      .filter((f) => f !== e.source)
      .forEach((f) => {
        f./* OK */ postMessage(data, this.origin_);
      });
  }

  /**
   * @param {Window | Promise<Window>} frame
   * @param {function(JsonObject)=} messageListener
   */
  register(frame, messageListener) {
    messageListener && this.listeners_.push(messageListener);
    Promise.resolve(frame).then((frame) => {
      if (this.frames_.indexOf(frame) === -1) {
        this.frames_.push(frame);
      }
    });
  }
}
