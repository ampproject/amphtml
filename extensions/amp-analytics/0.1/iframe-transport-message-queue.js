import {MessageType_Enum} from '#core/3p-frame-messaging';

import {dev, devAssert} from '#utils/log';

import {SubscriptionApi} from '../../../src/iframe-helper';

/** @private @const {string} */
const TAG_ = 'amp-analytics/iframe-transport-message-queue';

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/** @typedef {import('#core/3p-frame-messaging').IframeTransportEventDef} IframeTransportDef */

/**
 * @visibleForTesting
 */
export class IframeTransportMessageQueue {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   * messages to
   */
  constructor(win, frame) {
    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {boolean} */
    this.isReady_ = false;

    /** @private {!Array<!IframeTransportEventDef>} */
    this.pendingEvents_ = [];

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(
      this.frame_,
      MessageType_Enum.SEND_IFRAME_TRANSPORT_EVENTS,
      true,
      () => {
        this.setIsReady();
      }
    );
  }

  /**
   * Returns whether the queue has been marked as ready yet
   * @return {boolean}
   * @visibleForTesting
   */
  isReady() {
    return this.isReady_;
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @visibleForTesting
   */
  setIsReady() {
    this.isReady_ = true;
    this.flushQueue_();
  }

  /**
   * Returns how many creativeId -> message(s) mappings there are
   * @return {number}
   * @visibleForTesting
   */
  queueSize() {
    return this.pendingEvents_.length;
  }

  /**
   * Enqueues an event to be sent to a cross-domain iframe.
   * @param {!IframeTransportEventDef} event
   * Identifies the event and which Transport instance (essentially which
   * creative) is sending it.
   */
  enqueue(event) {
    devAssert(
      event && event.creativeId && event.message,
      'Attempted to enqueue malformed message for: ' + event.creativeId
    );
    this.pendingEvents_.push(event);
    if (this.queueSize() >= MAX_QUEUE_SIZE_) {
      dev().warn(
        TAG_,
        'Exceeded maximum size of queue for: ' + event.creativeId
      );
      this.pendingEvents_.shift();
    }
    this.flushQueue_();
  }

  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  flushQueue_() {
    if (this.isReady() && this.queueSize()) {
      this.postMessageApi_.send(
        MessageType_Enum.IFRAME_TRANSPORT_EVENTS,
        /** @type {!JsonObject} */
        ({events: this.pendingEvents_})
      );
      this.pendingEvents_ = [];
    }
  }
}
