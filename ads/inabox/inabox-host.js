/**
 * Inabox host script is installed on a non-AMP host page to provide APIs for
 * its embed AMP content (such as an ad created in AMP).
 */

import {getData} from '#utils/event-helper';
import {dev, initLogConstructor, setReportError, user} from '#utils/log';

import {InaboxMessagingHost} from './inabox-messaging-host';

import {reportError} from '../../src/error-reporting';

/** @const {string} */
const TAG = 'inabox-host';
/** @const {string} */
const AMP_INABOX_INITIALIZED = 'ampInaboxInitialized';
/** @const {string} */
const PENDING_MESSAGES = 'ampInaboxPendingMessages';
/** @const {string} */
const INABOX_IFRAMES = 'ampInaboxIframes';
/** @const {string} */
const INABOX_UNREGISTER_IFRAME = 'inaboxUnregisterIframe';

/**
 * Class for initializing host script and consuming queued messages.
 * @visibleForTesting
 */
export class InaboxHost {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    // Prevent double initialization
    if (win[AMP_INABOX_INITIALIZED]) {
      dev().info(TAG, 'Skip a 2nd attempt of initializing AMP inabox host.');
      return;
    }

    // Assume we cannot recover from state initialization errors.
    win[AMP_INABOX_INITIALIZED] = true;
    initLogConstructor();
    setReportError(reportError);

    if (win[INABOX_IFRAMES] && !Array.isArray(win[INABOX_IFRAMES])) {
      dev().info(TAG, 'Invalid %s. %s', INABOX_IFRAMES, win[INABOX_IFRAMES]);
      win[INABOX_IFRAMES] = [];
    }
    const host = new InaboxMessagingHost(win, win[INABOX_IFRAMES]);
    win.AMP = win.AMP || {};
    if (win.AMP[INABOX_UNREGISTER_IFRAME]) {
      // It's already defined; log a debug message and assume the existing
      // implmentation is good.
      dev().info(TAG, `win.AMP[${INABOX_UNREGISTER_IFRAME}] already defined}`);
    } else {
      win.AMP[INABOX_UNREGISTER_IFRAME] = host.unregisterIframe.bind(host);
    }
    const queuedMsgs = win[PENDING_MESSAGES];
    const processMessageFn = /** @type {function(Event)} */ (
      (evt) => {
        try {
          host.processMessage(evt);
        } catch (err) {
          dev().error(TAG, 'Error processing inabox message', evt, err);
        }
      }
    );
    if (queuedMsgs) {
      if (Array.isArray(queuedMsgs)) {
        /** @type {!Array} */ (queuedMsgs).forEach((message) => {
          // Pending messages are added by external scripts.
          // Validate their data types to avoid client errors.
          if (!validateMessage(message)) {
            return;
          }
          processMessageFn(message);
        });
      } else {
        dev().info(TAG, 'Invalid %s %s', PENDING_MESSAGES, queuedMsgs);
      }
    }
    // Empty and ensure that future messages are no longer stored in the array.
    win[PENDING_MESSAGES] = [];
    win[PENDING_MESSAGES]['push'] = () => {};
    win.addEventListener('message', processMessageFn.bind(host));
  }
}

/**
 * Validates a message event and print errors if it does not contain expected
 * fields.
 *
 * @param {!Event} message
 * @return {boolean} if the message is valid or not
 */
function validateMessage(message) {
  const valid = !!(message.source && message.source.postMessage);
  if (!valid) {
    user().warn(
      TAG,
      'Ignoring an inabox message. Likely the requester iframe has been removed. message.data=' +
        JSON.stringify(getData(message))
    );
  }
  return valid;
}

new InaboxHost(self);
