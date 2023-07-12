import {MessageType_Enum} from '#core/3p-frame-messaging';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Deferred} from '#core/data-structures/promise';
import {isObject} from '#core/types';
import {map} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import {dev, devAssert} from '#utils/log';

import {IframeMessagingClient} from './iframe-messaging-client';

import {parseUrlDeprecated} from '../src/url';

export class AbstractAmpContext {
  /**
   *  @param {!Window} win The window that the instance is built inside.
   */
  constructor(win) {
    devAssert(
      !this.isAbstractImplementation_(),
      'Should not construct AbstractAmpContext instances directly'
    );

    /** @protected {!Window} */
    this.win_ = win;

    // This value is cached since it could be overwritten by the master frame
    // check using a value of a different type.
    /** @private {?string} */
    this.cachedFrameName_ = this.win_.name || null;

    /** @protected {?string} */
    this.embedType_ = null;

    // ----------------------------------------------------
    // Please keep public attributes alphabetically sorted.
    // ----------------------------------------------------

    /** @public {?string|undefined} */
    this.canary = null;

    /** @type {?string} */
    this.canonicalUrl = null;

    /** @type {?string} */
    this.clientId = null;

    /** @type {?string|undefined} */
    this.container = null;

    /** @type {?Object} */
    this.consentSharedData = null;

    /** @type {?{[key: string]: *}} */
    this.data = null;

    /** @type {?string} */
    this.domFingerprint = null;

    /** @type {?boolean} */
    this.hidden = null;

    /** @type {?number} */
    this.initialConsentState = null;

    /** @type {?string} */
    this.initialConsentValue = null;

    /** @type {?Object} */
    this.initialConsentMetadata = null;

    /** @type {?Object} */
    this.initialLayoutRect = null;

    /** @type {?Object} */
    this.initialIntersection = null;

    /** @type {?Location} */
    this.location = null;

    /** @type {?Object} */
    this.mode = null;

    /** @type {?string} */
    this.pageViewId = null;

    /** @type {?string} */
    this.pageViewId64 = null;

    /** @type {?string} */
    this.referrer = null;

    /** @type {?string} */
    this.sentinel = null;

    /** @type {?string} */
    this.sourceUrl = null;

    /** @type {?number} */
    this.startTime = null;

    /** @type {?string} */
    this.tagName = null;

    /** @type {!{[key: number]: Deferred}} */
    this.resizeIdToDeferred_ = map();

    /** @type {number} */
    this.nextResizeRequestId_ = 0;

    this.findAndSetMetadata_();

    /** @protected {!IframeMessagingClient} */
    this.client_ = new IframeMessagingClient(win, this.getHostWindow_());
    this.client_.setSentinel(devAssert(this.sentinel));

    this.listenForPageVisibility_();
    this.listenToResizeResponse_();
  }

  /**
   * @return {boolean}
   * @protected
   */
  isAbstractImplementation_() {
    return true;
  }

  /** Registers an general handler for page visibility. */
  listenForPageVisibility_() {
    this.client_.makeRequest(
      MessageType_Enum.SEND_EMBED_STATE,
      MessageType_Enum.EMBED_STATE,
      (data) => {
        this.hidden = data['pageHidden'];
        this.dispatchVisibilityChangeEvent_();
      }
    );
  }

  /**
   * TODO(alanorozco): Deprecate native event mechanism.
   * @private
   */
  dispatchVisibilityChangeEvent_() {
    const event = this.win_.document.createEvent('Event');
    event.data = {hidden: this.hidden};
    event.initEvent(AmpEvents_Enum.VISIBILITY_CHANGE, true, true);
    this.win_.dispatchEvent(event);
  }

  /**
   *  Listen to page visibility changes.
   *  @param {function({hidden: boolean})} callback Function to call every time
   *    we receive a page visibility message.
   *  @return {function()} that when called stops triggering the callback
   *    every time we receive a page visibility message.
   */
  onPageVisibilityChange(callback) {
    return this.client_.registerCallback(
      MessageType_Enum.EMBED_STATE,
      (data) => {
        callback({hidden: data['pageHidden']});
      }
    );
  }

  /**
   *  Send message to runtime to start sending intersection messages.
   *  @param {function(Array<Object>)} callback Function to call every time we
   *    receive an intersection message.
   *  @return {function()} that when called stops triggering the callback
   *    every time we receive an intersection message.
   */
  observeIntersection(callback) {
    return this.client_.makeRequest(
      MessageType_Enum.SEND_INTERSECTIONS,
      MessageType_Enum.INTERSECTION,
      (intersection) => {
        callback(intersection['changes']);
      }
    );
  }

  /**
   *  Requests HTML snippet from the parent window.
   *  @param {string} selector CSS selector
   *  @param {!Array<string>} attributes permissible attributes to be kept
   *    in the returned HTML string
   *  @param {function(*)} callback to be invoked with the HTML string
   */
  getHtml(selector, attributes, callback) {
    this.client_.getData(
      MessageType_Enum.GET_HTML,
      {
        'selector': selector,
        'attributes': attributes,
      },
      callback
    );
  }

  /**
   * Requests consent state from the parent window.
   *
   * @param {function(*)} callback
   */
  getConsentState(callback) {
    this.client_.getData(MessageType_Enum.GET_CONSENT_STATE, null, callback);
  }

  /**
   *  Send message to runtime requesting to resize ad to height and width.
   *    This is not guaranteed to succeed. All this does is make the request.
   *  @param {number|undefined} width The new width for the ad we are requesting.
   *  @param {number|undefined} height The new height for the ad we are requesting.
   *  @param {boolean=} hasOverflow Whether the ad handles its own overflow ele
   *  @return {Promise} Signify the success/failure of the request.
   */
  requestResize(width, height, hasOverflow) {
    const requestId = this.nextResizeRequestId_++;
    this.client_.sendMessage(MessageType_Enum.EMBED_SIZE, {
      'id': requestId,
      'width': width,
      'height': height,
      'hasOverflow': hasOverflow,
    });
    const deferred = new Deferred();
    this.resizeIdToDeferred_[requestId] = deferred;
    return deferred.promise;
  }

  /**
   *  Set up listeners to handle responses from request size.
   */
  listenToResizeResponse_() {
    this.client_.registerCallback(
      MessageType_Enum.EMBED_SIZE_CHANGED,
      (data) => {
        const id = data['id'];
        if (id !== undefined) {
          this.resizeIdToDeferred_[id].resolve();
          delete this.resizeIdToDeferred_[id];
        }
      }
    );

    this.client_.registerCallback(
      MessageType_Enum.EMBED_SIZE_DENIED,
      (data) => {
        const id = data['id'];
        if (id !== undefined) {
          this.resizeIdToDeferred_[id].reject('Resizing is denied');
          delete this.resizeIdToDeferred_[id];
        }
      }
    );
  }

  /**
   * @param {string} endpoint Method being called
   * @private
   */
  sendDeprecationNotice_(endpoint) {
    this.client_.sendMessage(MessageType_Enum.USER_ERROR_IN_IFRAME, {
      'message': `${endpoint} is deprecated`,
      'expected': true,
    });
  }

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request returns a success. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request succeeds.
   */
  onResizeSuccess(callback) {
    this.client_.registerCallback(
      MessageType_Enum.EMBED_SIZE_CHANGED,
      (obj) => {
        callback(obj['requestedHeight'], obj['requestedWidth']);
      }
    );
    this.sendDeprecationNotice_('onResizeSuccess');
  }

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request is denied. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request is denied.
   */
  onResizeDenied(callback) {
    this.client_.registerCallback(MessageType_Enum.EMBED_SIZE_DENIED, (obj) => {
      callback(obj['requestedHeight'], obj['requestedWidth']);
    });
    this.sendDeprecationNotice_('onResizeDenied');
  }

  /**
   *  Make the ad interactive.
   */
  signalInteractive() {
    this.client_.sendMessage(MessageType_Enum.SIGNAL_INTERACTIVE);
  }

  /**
   *  Takes the current name on the window, and attaches it to
   *  the name of the iframe.
   *  @param {HTMLIFrameElement} iframe The iframe we are adding the context to.
   */
  addContextToIframe(iframe) {
    // TODO(alanorozco): consider the AMP_CONTEXT_DATA case
    iframe.name = dev().assertString(this.cachedFrameName_);
  }

  /**
   *  Notifies the parent document of no content available inside embed.
   */
  noContentAvailable() {
    this.client_.sendMessage(MessageType_Enum.NO_CONTENT);
  }

  /**
   *  Parse the metadata attributes from the name and add them to
   *  the class instance.
   *  @param {!Object|string} data
   *  @private
   */
  setupMetadata_(data) {
    // TODO(alanorozco): Use metadata utils in 3p/frame-metadata
    const dataObject = devAssert(
      typeof data === 'string' ? tryParseJson(data) : data,
      'Could not setup metadata.'
    );

    const context = dataObject._context || dataObject.attributes._context;

    this.data = dataObject.attributes || dataObject;

    // TODO(alanorozco, #10576): This is really ugly. Find a better structure
    // than passing context values via data.
    if ('_context' in this.data) {
      delete this.data['_context'];
    }

    this.canary = context.canary;
    this.canonicalUrl = context.canonicalUrl;
    this.clientId = context.clientId;
    this.consentSharedData = context.consentSharedData;
    this.container = context.container;
    this.domFingerprint = context.domFingerprint;
    this.hidden = context.hidden;
    this.initialConsentState = context.initialConsentState;
    this.initialConsentValue = context.initialConsentValue;
    this.initialConsentMetadata = context.initialConsentMetadata;
    this.initialLayoutRect = context.initialLayoutRect;
    this.initialIntersection = context.initialIntersection;
    this.location = parseUrlDeprecated(context.location.href);
    this.mode = context.mode;
    this.pageViewId = context.pageViewId;
    this.pageViewId64 = context.pageViewId64;
    this.referrer = context.referrer;
    this.sentinel = context.sentinel;
    this.sourceUrl = context.sourceUrl;
    this.startTime = context.startTime;
    this.tagName = context.tagName;

    this.embedType_ = dataObject.type || null;
  }

  /**
   * Calculate the hostWindow
   * @private
   * @return {!Window}
   */
  getHostWindow_() {
    const sentinelMatch = this.sentinel.match(/((\d+)-\d+)/);
    devAssert(sentinelMatch, 'Incorrect sentinel format');
    const depth = Number(sentinelMatch[2]);
    const ancestors = [];
    for (let win = this.win_; win && win != win.parent; win = win.parent) {
      // Add window keeping the top-most one at the front.
      ancestors.push(win.parent);
    }
    return ancestors[ancestors.length - 1 - depth];
  }

  /**
   *  Checks to see if there is a window variable assigned with the
   *  sentinel value, sets it, and returns true if so.
   *  @private
   */
  findAndSetMetadata_() {
    // If the context data is set on window, that means we don't need
    // to check the name attribute as it has been bypassed.
    // TODO(alanorozco): why the heck could AMP_CONTEXT_DATA be two different
    // types? FIX THIS.
    if (isObject(this.win_.sf_) && this.win_.sf_.cfg) {
      this.setupMetadata_(/** @type {string}*/ (this.win_.sf_.cfg));
    } else if (this.win_.AMP_CONTEXT_DATA) {
      if (typeof this.win_.AMP_CONTEXT_DATA == 'string') {
        this.sentinel = this.win_.AMP_CONTEXT_DATA;
      } else if (isObject(this.win_.AMP_CONTEXT_DATA)) {
        this.setupMetadata_(this.win_.AMP_CONTEXT_DATA);
      }
    } else {
      this.setupMetadata_(this.win_.name);
    }
  }

  /**
   * Send 3p error to parent iframe
   * @param {!Error} e
   */
  report3pError(e) {
    if (!e.message) {
      return;
    }
    this.client_.sendMessage(MessageType_Enum.USER_ERROR_IN_IFRAME, {
      'message': e.message,
    });
  }
}

export class AmpContext extends AbstractAmpContext {
  /** @override */
  isAbstractImplementation_() {
    return false;
  }
}
