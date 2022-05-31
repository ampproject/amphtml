import {Services} from '#service';

import {dev, devAssert, userAssert} from '#utils/log';

import {getMode} from '../../../src/mode';
import {assertHttpsUrl} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-access-client';

/** @const {number} */
const DEFAULT_AUTHORIZATION_TIMEOUT = 3000;

/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessClientAdapter {
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

    /** @const @private {string} */
    this.authorizationUrl_ = userAssert(
      configJson['authorization'],
      '"authorization" URL must be specified'
    );
    assertHttpsUrl(this.authorizationUrl_, '"authorization"');

    /** @const @private {boolean} */
    this.isPingbackEnabled_ = !configJson['noPingback'];

    /** @const @private {string} */
    this.pingbackUrl_ = configJson['pingback'];
    if (this.isPingbackEnabled_) {
      userAssert(this.pingbackUrl_, '"pingback" URL must be specified');
      assertHttpsUrl(this.pingbackUrl_, '"pingback"');
    }

    /** @const @private {number} */
    this.authorizationTimeout_ =
      this.buildConfigAuthorizationTimeout_(configJson);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(ampdoc.win);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);
  }

  /**
   * @param {!JsonObject} configJson
   * @return {number}
   */
  buildConfigAuthorizationTimeout_(configJson) {
    if (!configJson['authorizationTimeout']) {
      return DEFAULT_AUTHORIZATION_TIMEOUT;
    }

    let timeout = configJson['authorizationTimeout'];
    userAssert(
      typeof timeout == 'number',
      '"authorizationTimeout" must be a number'
    );
    if (!(getMode().localDev || getMode().development)) {
      timeout = Math.min(timeout, DEFAULT_AUTHORIZATION_TIMEOUT);
    }
    return timeout;
  }

  /** @override */
  getConfig() {
    return {
      'authorizationUrl': this.authorizationUrl_,
      'pingbackEnabled': this.isPingbackEnabled_,
      'pingbackUrl': this.pingbackUrl_,
      'authorizationTimeout': this.authorizationTimeout_,
    };
  }

  /**
   * @return {string}
   */
  getAuthorizationUrl() {
    return this.authorizationUrl_;
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /**
   * @return {number}
   */
  getAuthorizationTimeout() {
    return this.authorizationTimeout_;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Start authorization via ', this.authorizationUrl_);
    const urlPromise = this.context_.buildUrl(
      this.authorizationUrl_,
      /* useAuthData */ false
    );
    return urlPromise.then((url) => {
      dev().fine(TAG, 'Authorization URL: ', url);
      return this.timer_
        .timeoutPromise(
          this.authorizationTimeout_,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
          })
        )
        .then((res) => res.json());
    });
  }

  /** @override */
  isPingbackEnabled() {
    return this.isPingbackEnabled_;
  }

  /** @override */
  pingback() {
    const promise = this.context_.buildUrl(
      devAssert(this.pingbackUrl_),
      /* useAuthData */ true
    );
    return promise.then((url) => {
      dev().fine(TAG, 'Pingback URL: ', url);
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: '',
      });
    });
  }

  /** @override */
  postAction() {
    // Nothing to do.
  }
}
