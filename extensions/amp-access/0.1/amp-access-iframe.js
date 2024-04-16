import {Deferred} from '#core/data-structures/promise';
import {toggle} from '#core/dom/style';
import {isArray} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {Messenger} from './iframe-api/messenger';

import {getMode} from '../../../src/mode';
import {assertHttpsUrl, parseUrlDeprecated} from '../../../src/url';

const AUTHORIZATION_TIMEOUT = 3000;
const EXPIRATION_TIMEOUT = 1000 * 60 * 60 * 24 * 7; // 7 days
const TAG = 'amp-access-iframe';

/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessIframeAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {!./amp-access-source.AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {!./amp-access-source.AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @const @private {!JsonObject} */
    this.configJson_ = configJson;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @const @private {string} */
    this.iframeSrc_ = userAssert(
      configJson['iframeSrc'],
      '"iframeSrc" URL must be specified'
    );
    assertHttpsUrl(this.iframeSrc_, '"iframeSrc"');

    /** @const @private {?Array} */
    this.iframeVars_ = configJson['iframeVars'] || null;
    if (this.iframeVars_) {
      userAssert(isArray(this.iframeVars_), '"iframeVars" must be an array');
    }

    /** @const @private {!JsonObject} */
    this.defaultResponse_ = userAssert(
      configJson['defaultResponse'],
      '"defaultResponse" must be specified'
    );

    /** @private @const {string} */
    this.targetOrigin_ = parseUrlDeprecated(this.iframeSrc_).origin;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private {?Promise} */
    this.connectedPromise_ = null;

    /** @private @const {!Element} */
    this.iframe_ = ampdoc.win.document.createElement('iframe');
    toggle(this.iframe_, false);

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
      this.ampdoc.win,
      () => this.iframe_.contentWindow,
      this.targetOrigin_
    );

    /** @private {?Promise<!JsonObject>} */
    this.configPromise_ = null;
  }

  /**
   * Disconnect the client.
   */
  disconnect() {
    this.messenger_.disconnect();
    this.ampdoc.getBody().removeChild(this.iframe_);
  }

  /** @override */
  getConfig() {
    return {
      'iframeSrc': this.iframeSrc_,
      'iframeVars': this.iframeVars_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    return Promise.race([this.authorizeLocal_(), this.authorizeRemote_()]);
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback() {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp('pingback', {});
    });
  }

  /** @override */
  postAction() {
    // Reset the storage.
    this.store_(null);
  }

  /**
   * @return {!Promise}
   * @package Visible for testing only.
   */
  connect() {
    if (!this.connectedPromise_) {
      const deferred = new Deferred();
      this.connectedPromise_ = deferred.promise;
      this.connectedResolver_ = deferred.resolve;

      this.configPromise_ = this.resolveConfig_();
      // Connect.
      this.messenger_.connect(this.handleCommand_.bind(this));
      this.ampdoc.getBody().appendChild(this.iframe_);
      this.iframe_.src = this.iframeSrc_;
    }
    return this.connectedPromise_;
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
   */
  resolveConfig_() {
    return new Promise((resolve) => {
      const configJson = parseJson(JSON.stringify(this.configJson_));
      if (this.iframeVars_) {
        const varsString = this.iframeVars_.join('&');
        const varsPromise = this.context_.collectUrlVars(
          varsString,
          /* useAuthData */ false
        );
        resolve(
          varsPromise.then((vars) => {
            configJson['iframeVars'] = vars;
            return configJson;
          })
        );
      } else {
        resolve(configJson);
      }
    });
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
   */
  authorizeLocal_() {
    const timeout = AUTHORIZATION_TIMEOUT * (getMode().development ? 2 : 1);
    return this.timer_.promise(timeout).then(() => {
      return this.restore_() || this.defaultResponse_;
    });
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
   */
  authorizeRemote_() {
    return this.connect()
      .then(() => {
        return this.messenger_.sendCommandRsvp('authorize', {});
      })
      .then((data) => {
        if (data) {
          // Store the value in a non-blocking microtask.
          Promise.resolve().then(() => this.store_(data));
        }
        return data;
      });
  }

  /**
   * @return {?JsonObject} data
   * @private
   */
  restore_() {
    const {win} = this.ampdoc;
    const storage = win.sessionStorage || win.localStorage;
    if (!storage) {
      return null;
    }
    try {
      const raw = storage.getItem(TAG);
      if (!raw) {
        return null;
      }
      const parsed = parseJson(raw);
      const time = parsed['t'];
      if (time + EXPIRATION_TIMEOUT < this.ampdoc.win.Date.now()) {
        // Already expired.
        return null;
      }
      return parsed['d'] || null;
    } catch (e) {
      dev().error(TAG, 'failed to restore access response: ', e);
      try {
        // Remove the poisoned value.
        storage.removeItem(TAG);
      } catch (e) {
        // Ignore.
      }
      return null;
    }
  }

  /**
   * @param {?JsonObject} data
   * @private
   */
  store_(data) {
    const {win} = this.ampdoc;
    const storage = win.sessionStorage || win.localStorage;
    if (!storage) {
      return;
    }
    try {
      if (data) {
        storage.setItem(
          TAG,
          JSON.stringify({
            't': this.ampdoc.win.Date.now(),
            'd': data,
          })
        );
      } else {
        storage.removeItem(TAG);
      }
    } catch (e) {
      dev().error(TAG, 'failed to store access response: ', e);
    }
  }

  /**
   * @param {string} cmd
   * @param {?Object} unusedPayload
   * @return {*}
   * @private
   */
  handleCommand_(cmd, unusedPayload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.configPromise_.then((configJson) => {
        this.messenger_
          .sendCommandRsvp('start', {
            'protocol': 'amp-access',
            'config': configJson,
          })
          .then(() => {
            // Confirmation that connection has been successful.
            if (this.connectedResolver_) {
              this.connectedResolver_();
              this.connectedResolver_ = null;
            }
          });
      });
      return;
    }
  }
}
