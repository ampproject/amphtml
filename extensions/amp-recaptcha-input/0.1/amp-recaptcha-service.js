/**
 * @fileoverview Service for recaptcha components
 * interacting with the 3p recaptcha bootstrap iframe
 */

import {Deferred, tryResolve} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {setStyle} from '#core/dom/style';
import * as mode from '#core/mode';

import {Services} from '#service';

import {loadPromise} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';

import * as urls from '../../../src/config/urls';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {getSourceOrigin} from '../../../src/url';
import ampToolboxCacheUrl from '../../../third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm';

/**
 * @fileoverview
 * Service used by AMP recaptcha elements, to utilize
 * the recaptcha API that is within a bootstrap Iframe.
 *
 * Here are the following iframe messages using .postMessage()
 * used between the iframe and recaptcha service:
 * amp-recaptcha-ready / Service <- Iframe :
 *   Iframe and Recaptcha API are ready.
 * amp-recaptcha-action / Service -> Iframe :
 *   Execute and action using supplied data
 * amp-recaptcha-token / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. The token
 *   returned by the recaptcha API.
 * amp-recaptcha-error / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. Error
 *   From attempting to get a token from action.
 */

export class AmpRecaptchaService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!Window} */
    this.win_ = this.ampdoc_.win;

    /** @private {?string} */
    this.sitekey_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframeLoadPromise_ = null;

    /** @private {number} */
    this.registeredElementCount_ = 0;

    /** @private {?string} */
    this.recaptchaFrameOrigin_ = null;

    /** @private {!Deferred} */
    this.recaptchaApiReady_ = new Deferred();

    /** @private {Array} */
    this.unlisteners_ = [];

    /** @private {Object} */
    this.executeMap_ = {};

    /** @private {boolean} */
    this.global_;
  }

  /**
   * Function to register as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   * @param {string} sitekey
   * @param {boolean} global
   * @return {Promise}
   */
  register(sitekey, global = false) {
    if (!this.sitekey_) {
      this.sitekey_ = sitekey;
    } else if (this.sitekey_ !== sitekey) {
      return Promise.reject(
        new Error(
          'You must supply the same sitekey ' +
            'to all amp-recaptcha-input elements.'
        )
      );
    }
    if (this.global_ === undefined) {
      this.global_ = global;
    } else if (this.global_ !== global) {
      return Promise.reject(
        new Error(
          'You must supply the data-global attribute ' +
            'to all or none of the amp-recaptcha-input elements.'
        )
      );
    }

    this.registeredElementCount_++;
    if (!this.iframeLoadPromise_) {
      this.iframeLoadPromise_ = this.initialize_();
    }
    return this.iframeLoadPromise_;
  }

  /**
   * Function to unregister as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   */
  unregister() {
    this.registeredElementCount_--;
    if (this.registeredElementCount_ <= 0) {
      this.dispose_();
    }
  }

  /**
   * Function to call .execute() on the recaptcha API within
   * our iframe, to dispatch recaptcha actions.
   * Takes in an element resource ID, sitekey, and the action to execute.
   * Returns a Promise that resolves the recaptcha token.
   * @param {number} resourceId
   * @param {string} action
   * @return {!Promise<string>}
   */
  execute(resourceId, action) {
    if (!this.iframe_) {
      return Promise.reject(
        new Error(
          'An iframe is not created. You must register before executing'
        )
      );
    }
    const executePromise = new Deferred();
    const messageId = resourceId;
    this.executeMap_[messageId] = {
      resolve: executePromise.resolve,
      reject: executePromise.reject,
    };
    this.recaptchaApiReady_.promise.then(() => {
      const message = {
        'id': messageId,
        'action': 'amp_' + action,
      };

      // Send the message
      this.postMessageToIframe_(
        /** @type {string} */ (devAssert(this.recaptchaFrameOrigin_)),
        message
      );
    });
    return executePromise.promise;
  }

  /**
   * Function to create our recaptcha boostrap iframe.
   * Should be assigned to this.iframeLoadPromise_
   * @private
   * @return {?Promise}
   */
  initialize_() {
    return this.createRecaptchaFrame_().then((iframe) => {
      this.iframe_ = iframe;

      this.unlisteners_ = [
        this.listenIframe_('amp-recaptcha-ready', () =>
          this.recaptchaApiReady_.resolve()
        ),
        this.listenIframe_(
          'amp-recaptcha-token',
          this.tokenMessageHandler_.bind(this)
        ),
        this.listenIframe_(
          'amp-recaptcha-error',
          this.errorMessageHandler_.bind(this)
        ),
      ];
      this.executeMap_ = {};

      this.win_.document.body.appendChild(this.iframe_);
      return loadPromise(this.iframe_);
    });
  }

  /**
   * Function to dispose of our bootstrap iframe
   * @private
   */
  dispose_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.unlisteners_.forEach((unlistener) => unlistener());
      this.iframe_ = null;
      this.iframeLoadPromise_ = null;
      this.recaptchaApiReady_ = new Deferred();
      this.unlisteners_ = [];
      this.executeMap_ = {};
    }
  }

  /**
   * Function to create our bootstrap iframe.
   *
   * @return {!Promise<!Element>}
   * @private
   */
  createRecaptchaFrame_() {
    const iframe = this.win_.document.createElement('iframe');

    return this.getRecaptchaFrameSrc_().then((recaptchaFrameSrc) => {
      this.recaptchaFrameOrigin_ = getSourceOrigin(recaptchaFrameSrc);
      iframe.src = recaptchaFrameSrc;
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('data-amp-3p-sentinel', 'amp-recaptcha');
      iframe.setAttribute(
        'name',
        JSON.stringify({
          'sitekey': this.sitekey_,
          'sentinel': 'amp-recaptcha',
          'global': this.global_,
        })
      );
      iframe.classList.add('i-amphtml-recaptcha-iframe');
      setStyle(iframe, 'border', 'none');
      /** @this {!Element} */
      iframe.onload = function () {
        // Chrome does not reflect the iframe readystate.
        this.readyState = 'complete';
      };

      return iframe;
    });
  }

  /**
   * Function to get our recaptcha iframe src
   *
   * This should take the current URL,
   * either in canonical (www.example.com),
   * or in cache (www-example-com.cdn.ampproject.org),
   * and get the curls subdomain (www-example-com)
   * To then create the iframe src:
   * https://www-example-com.recaptcha.my.cdn/rtv/recaptcha.html
   *
   * @return {!Promise<string>}
   * @private
   */
  getRecaptchaFrameSrc_() {
    if (getMode().localDev || getMode().test) {
      /**
       * Get our window location.
       * In localDev mode, this will be this.win_.location
       * In test mode, this will be this.win_.testLocation
       *
       * tesLocation is needed because test fixtures are
       * loaded in friendly iframes, thus win.location
       * would give about:blank.
       */
      let winLocation = this.win_.location;
      if (this.win_.testLocation) {
        winLocation = this.win_.testLocation;
      }

      // TODO: win location href curls domain MAY need to be the same
      return ampToolboxCacheUrl
        .createCurlsSubdomain(winLocation.href)
        .then((curlsSubdomain) => {
          return (
            '//' +
            curlsSubdomain +
            '.recaptcha.' +
            winLocation.host +
            '/dist.3p/' +
            (mode.isMinified()
              ? `${mode.version()}/recaptcha`
              : 'current/recaptcha.max') +
            '.html'
          );
        });
    }

    // Need to have the curls subdomain match the original document url.
    // This is verified by the recaptcha frame to
    // verify the origin on its messages
    let curlsSubdomainPromise = undefined;
    const isProxyOrigin = Services.urlForDoc(
      this.ampdoc_.getHeadNode()
    ).isProxyOrigin(this.win_.location.href);
    if (isProxyOrigin) {
      curlsSubdomainPromise = tryResolve(() => {
        return this.win_.location.hostname.split('.')[0];
      });
    } else {
      curlsSubdomainPromise = ampToolboxCacheUrl.createCurlsSubdomain(
        this.win_.location.href
      );
    }

    return curlsSubdomainPromise.then((curlsSubdomain) => {
      const recaptchaFrameSrc =
        'https://' +
        curlsSubdomain +
        `.recaptcha.${urls.thirdPartyFrameHost}/${mode.version()}/` +
        'recaptcha.html';
      return recaptchaFrameSrc;
    });
  }

  /**
   * Function to create a listener for our iframe
   * @param {string} evName
   * @param {Function} cb
   * @return {Function}
   * @private
   */
  listenIframe_(evName, cb) {
    const checkOriginWrappedCallback = (data, source, origin) => {
      if (this.recaptchaFrameOrigin_ === origin) {
        cb(data, source, origin);
      }
    };

    return listenFor(
      dev().assertElement(this.iframe_),
      evName,
      checkOriginWrappedCallback,
      true
    );
  }

  /**
   * Function to send a message to our iframe
   * @param {string} origin
   * @param {!JsonObject} message
   * @private
   */
  postMessageToIframe_(origin, message) {
    postMessage(
      dev().assertElement(this.iframe_),
      'amp-recaptcha-action',
      message,
      origin,
      true
    );
  }

  /**
   * Function to handle token messages from the recaptcha iframe
   *
   * NOTE: Use bracket notation to access message properties,
   * As the externs were a little too generic.
   *
   * @param {object} data
   */
  tokenMessageHandler_(data) {
    const id = data['id'];
    const token = data['token'];

    this.executeMap_[id].resolve(token);
    delete this.executeMap_[id];
  }

  /**
   * Function to handle error messages from the recaptcha iframe
   *
   * NOTE: Use bracket notation to access message properties,
   * As the externs were a little too generic.
   *
   * @param {object} data
   */
  errorMessageHandler_(data) {
    const id = data['id'];
    const error = data['error'];

    this.executeMap_[id].reject(new Error(error));
    delete this.executeMap_[id];
  }
}

/**
 * @param {!Element} element
 * @return {!Promise<!AmpRecaptchaService>}
 */
export function recaptchaServiceForDoc(element) {
  return /** @type {!Promise<!AmpRecaptchaService>} */ (
    getServicePromiseForDoc(element, 'amp-recaptcha')
  );
}
