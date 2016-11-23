import './polyfills';
import {listen} from '../src/event-helper';
import {getRandom} from '../src/3p-frame';
import {user} from '../src/log';
/**
 * @abstract
 */
export class IframeMessagingClient {

  /**
   *  @param {Window} win A window object.
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** Map messageType keys to callback functions for when we receive
     *  that message
     *  @private {object}
     */
    this.callbackFor_ = {};
    this.setupEventListener_();
  }

  /**
   * Register callback function for message with type messageType.
   *   As it stands right now, only one callback can exist at a time.
   *   All future calls will overwrite any previously registered
   *   callbacks.
   * @param {string} messageType The type of the message.
   * @param {function(object)} callback The callback function to call
   *   when a message with type messageType is received.
   */
  registerCallback_(messageType, callback) {
    this.callbackFor_[messageType] = callback;
    return () => { delete this.callbackFor_[messageType]; };
  }

  /**
   * Sets up event listener for post messages of the desired type.
   *   The actual implementation only uses a single event listener for all of
   *   the different messages, and simply diverts the message to be handled
   *   by different callbacks.
   *   To add new messages to listen for, call registerCallback with the
   *   messageType to listen for, and the callback function.
   * @private
   */
  setupEventListener_() {
    listen(this.win_, 'message', message => {
      // Does it look a message from AMP?
      if (message.source == this.ampWindow && message.data &&
          message.data.indexOf('amp-') == 0) {
        // See if we can parse the payload.
        try {
          const payload = JSON.parse(message.data.substring(4));
          // Check the sentinel as well.
          if (payload.sentinel == this.sentinel &&
              this.callbackFor_[payload.type]) {
            try {
              // We should probably report exceptions within callback
              this.callbackFor_[payload.type](payload);
            } catch (err) {
              user().error(`Error in registered callback ${payload.type}`, err);
            }
          }
        } catch (e) {
          // JSON parsing failed. Ignore the message.
        }
      }
    });
  }

  /**
   *  This must be overwritten by classes that extend this base class
   *  As implemented, this will only work for messaging the parent iframe.
   */
  getSentinel() {
    return '0-' + getRandom(this.ampWindow);
  }

  /**
   *  Only valid for the trivial case when we will always be messaging our parent
   *  Should be overwritten for subclasses
   */
  getHostWindow() {
    return this.win_.parent;
  }
};
