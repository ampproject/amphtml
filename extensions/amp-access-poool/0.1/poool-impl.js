import {resetStyles, setStyle, setStyles} from '#core/dom/style';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {listenFor} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {addParamToUrl, addParamsToUrl} from '../../../src/url';

const TAG = 'amp-access-poool';

const ACCESS_CONFIG = {
  'authorization': 'https://api.poool.fr/api/v3/amp/access?rid=READER_ID',
  'iframe':
    'https://assets.poool.fr/amp.html' +
    '?rid=READER_ID' +
    '&c=CANONICAL_URL' +
    '&o=AMPDOC_URL' +
    '&r=DOCUMENT_REFERRER',
};

const AUTHORIZATION_TIMEOUT = 3000;

/**
 * @typedef {{
 *   appId: string,
 *   pageType: string,
 *   debug: ?boolean,
 *   forceWidget: ?string,
 *   loginButtonEnabled: boolean,
 *   videoClient: ?string,
 *   customSegment: ?string,
 *   cookiesEnabled: boolean,
 *   locale: ?string,
 *   context: ?string,
 * }}
 */
let PooolConfigDef;

/**
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class PooolVendor {
  /**
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(accessService, accessSource) {
    /** @const */
    this.ampdoc = accessService.ampdoc;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(this.ampdoc);

    /** @private {string} */
    this.accessUrl_ = ACCESS_CONFIG['authorization'];

    /** @private {string} */
    this.iframeUrl_ = ACCESS_CONFIG['iframe'];

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc.win);

    /** @const @private {?../../../src/service/navigation.Navigation} */
    this.navigation_ = Services.navigationForDoc(this.ampdoc);

    /** @const @private {!JsonObject} For shape see PooolConfigDef */
    this.pooolConfig_ = this.accessSource_.getAdapterConfig();

    /** @private {string} */
    this.bundleID_ = this.pooolConfig_['bundleID'] || '';

    /** @protected {string} */
    this.readerID_ = '';

    /** @private {string} */
    this.itemID_ = this.pooolConfig_['itemID'] || '';

    /** @const {!Element} */
    this.iframe_ = this.ampdoc.win.document.createElement('iframe');

    this.initializeIframe_();

    this.checkMandatoryParams_();
  }

  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPooolAccess_().then(
      (response) => {
        return {access: response.access};
      },
      (err) => {
        if (!err || !err.response) {
          throw err;
        }
        const {response} = err;
        if (response.status !== 402) {
          throw err;
        }
        this.renderPoool_();
        return {access: false};
      }
    );
  }

  /**
   * @private
   */
  initializeIframe_() {
    this.iframe_.setAttribute('id', 'poool-iframe');
    this.iframe_.setAttribute('scrolling', 'no');
    this.iframe_.setAttribute('frameborder', '0');
    setStyle(this.iframe_, 'width', '100%');

    if (this.pooolConfig_['forceWidget'] == 'unlock') {
      setStyles(this.iframe_, {
        'height': '250px',
        'position': 'fixed',
        'bottom': '0',
      });
    } else {
      setStyles(this.iframe_, {
        'height': '500px',
        'transform': 'translateY(-70px)',
      });
    }
  }

  /**
   * @private
   */
  checkMandatoryParams_() {
    userAssert(this.bundleID_, 'BundleID is incorrect or not provided.');
    userAssert(this.itemID_, 'ItemID is not provided.');
  }

  /**
   * @return {!Promise<Object>}
   * @private
   */
  getPooolAccess_() {
    const url = addParamToUrl(this.accessUrl_, 'iid', this.itemID_);
    const urlPromise = this.accessSource_.buildUrl(url, false);
    return urlPromise
      .then((url) => {
        return this.accessSource_.getLoginUrl(url);
      })
      .then((url) => {
        dev().info(TAG, 'Authorization URL: ', url);
        return this.timer_
          .timeoutPromise(AUTHORIZATION_TIMEOUT, this.xhr_.fetchJson(url))
          .then((res) => res.json());
      });
  }

  /**
   * @return {!Element}
   * @private
   */
  getContainer_() {
    const paywallContainer = this.ampdoc.getElementById('poool');
    return user().assertElement(
      paywallContainer,
      'No element with id #poool found to render paywall into, got'
    );
  }

  /**
   * @private
   */
  renderPoool_() {
    const pooolContainer = this.getContainer_();
    const urlPromise = this.accessSource_.buildUrl(
      addParamsToUrl(this.iframeUrl_, {
        'bi': this.pooolConfig_['bundleID'],
        'iid': this.pooolConfig_['itemID'],
        'ce': this.pooolConfig_['cookiesEnabled'],
        'd':
          typeof this.pooolConfig_['debug'] !== 'undefined' &&
          this.pooolConfig_['debug'] !== null
            ? this.pooolConfig_['debug']
            : getMode().development || getMode().localDev,
        'fw': this.pooolConfig_['forceWidget'],
        'cs': this.pooolConfig_['customSegment'],
        'lo': this.pooolConfig_['locale'],
        'co': this.pooolConfig_['context'],
      }),
      false
    );

    return urlPromise.then((url) => {
      this.iframe_.src = url;
      listenFor(this.iframe_, 'release', this.onRelease_.bind(this));
      listenFor(this.iframe_, 'resize', this.onResize_.bind(this));
      listenFor(this.iframe_, 'click', this.onClick_.bind(this));
      pooolContainer.appendChild(this.iframe_);
    });
  }

  /**
   * @private
   */
  onRelease_() {
    const articlePreview = this.ampdoc
      .getRootNode()
      .querySelector('[poool-access-preview]');

    if (articlePreview) {
      this.mutator_.mutateElement(articlePreview, () => {
        articlePreview.setAttribute('amp-access-hide', '');
      });
    }

    const articleContent = this.ampdoc
      .getRootNode()
      .querySelector('[poool-access-content]');

    if (articleContent) {
      this.mutator_.mutateElement(articleContent, () => {
        articleContent.removeAttribute('amp-access-hide');
      });
    }

    resetStyles(this.iframe_, ['transform']);
  }

  /**
   * @private
   * @param {!Object} msg
   */
  onResize_(msg) {
    setStyle(this.iframe_, 'height', msg.height);
  }

  /**
   * @private
   * @param {!Object} msg
   */
  onClick_(msg) {
    if (msg.url) {
      this.navigation_.navigateTo(this.ampdoc.win, msg.url);
    }
  }

  /**
   * @return {!Promise}
   */
  pingback() {
    return Promise.resolve();
  }
}
