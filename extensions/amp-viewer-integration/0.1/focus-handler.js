import {listen} from '#utils/event-helper';

/**
 * Forward focus events' related data from the AMP doc to the
 * viewer.
 */
export class FocusHandler {
  /**
   * @param {!Window} win
   * @param {!./messaging/messaging.Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;
    /** @const @private {!./messaging/messaging.Messaging} */
    this.messaging_ = messaging;

    this.listenForFocusEvents_();
  }

  /**
   * @private
   */
  listenForFocusEvents_() {
    const doc = this.win.document;
    listen(doc, 'focusin', this.forwardEventToViewer_.bind(this), {
      capture: false,
    });
  }

  /**
   * @param {!Event} e
   * @private
   */
  forwardEventToViewer_(e) {
    if (e.defaultPrevented) {
      return;
    }
    this.messaging_.sendRequest(
      e.type,
      {'focusTargetRect': e.target./*OK*/ getBoundingClientRect()},
      /* awaitResponse */ false
    );
  }
}
