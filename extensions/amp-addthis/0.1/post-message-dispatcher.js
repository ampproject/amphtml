import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {getData} from '#utils/event-helper';

import {CONFIGURATION_EVENT, ORIGIN, SHARE_EVENT} from './constants';

export class PostMessageDispatcher {
  /**
   * Creates an instance of PostMessageDispatcher.
   */
  constructor() {
    this.listeners_ = {};
  }

  /**
   * Adds event listener.
   * @param {string} eventType
   * @param {!Function} listener
   */
  on(eventType, listener) {
    if (!this.listeners_[eventType]) {
      this.listeners_[eventType] = [];
    }
    this.listeners_[eventType].push(listener);
  }

  /**
   * @param {string} eventType
   * @param {!JsonObject} eventData
   * @private
   */
  emit_(eventType, eventData) {
    if (!this.listeners_[eventType]) {
      return;
    }
    /** @type {!Array} */ (this.listeners_[eventType]).forEach((listener) =>
      listener(eventData)
    );
  }

  /**
   * Utility method to parse out the data from the supplied `postMessage` event.
   * @param {!Event} event
   * @return {?JsonObject|undefined}
   * @private
   */
  getMessageData_(event) {
    const data = getData(event);

    if (isObject(data)) {
      return /** @type {!JsonObject} */ (data);
    }

    if (typeof data === 'string' && data.startsWith('{')) {
      return tryParseJson(data);
    }

    return undefined;
  }

  /**
   * Handles messages posted from amp-addthis iframes, ensuring the correct
   * origin, etc.
   * @param {!Event} event
   */
  handleAddThisMessage(event) {
    if (event.origin !== ORIGIN || !getData(event)) {
      return;
    }

    const data = this.getMessageData_(event) || {};

    switch (data['event']) {
      case CONFIGURATION_EVENT: {
        this.emit_(
          CONFIGURATION_EVENT,
          /** @type {!JsonObject} */ ({
            ...data,
            'source': event.source,
          })
        );
        break;
      }
      case SHARE_EVENT: {
        this.emit_(SHARE_EVENT, /** @type {!JsonObject} */ (data));
        break;
      }
    }
  }
}
