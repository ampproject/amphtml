import {Keys_Enum} from '#core/constants/key-codes';
import {getDataParamsFromAttributes} from '#core/dom';
import {toggle} from '#core/dom/style';
import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {getSocialConfig} from './amp-social-share-config';

import {CSS} from '../../../build/amp-social-share-0.1.css';
import {openWindowDialog} from '../../../src/open-window-dialog';
import {addParamsToUrl} from '../../../src/url';

const TAG = 'amp-social-share';

class AmpSocialShare extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?string} */
    this.shareEndpoint_ = null;

    /** @private @const {!JsonObject} */
    this.params_ = {};

    /** @private {?../../../src/service/platform-impl.Platform} */
    this.platform_ = null;

    /** @private {?string} */
    this.href_ = null;

    /** @private {?string} */
    this.target_ = null;

    /** @private {?Array<string>} */
    this.bindingVars_ = null;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const typeAttr = userAssert(
      element.getAttribute('type'),
      'The type attribute is required. %s',
      element
    );
    userAssert(
      !/\s/.test(typeAttr),
      'Space characters are not allowed in type attribute value. %s',
      element
    );

    this.platform_ = Services.platformFor(this.win);

    const systemShareSupported = 'share' in this.win.navigator;
    if (typeAttr === 'system') {
      // Hide/ignore system component if navigator.share unavailable
      if (!systemShareSupported) {
        toggle(element, false);
        return;
      }
    } else {
      // Hide/ignore non-system component if system share wants to be unique
      const systemOnly =
        systemShareSupported &&
        !!this.win.document.querySelectorAll(
          'amp-social-share[type=system][data-mode=replace]'
        ).length;
      if (systemOnly) {
        toggle(element, false);
        return;
      }
    }
    const typeConfig = getSocialConfig(typeAttr) || {};
    if (typeConfig['obsolete']) {
      toggle(element, false);
      user().warn(TAG, `Skipping obsolete share button ${typeAttr}`);
      return;
    }
    this.shareEndpoint_ = userAssert(
      element.getAttribute('data-share-endpoint') ||
        typeConfig['shareEndpoint'],
      'The data-share-endpoint attribute is required. %s',
      element
    );
    Object.assign(
      this.params_,
      typeConfig['defaultParams'],
      getDataParamsFromAttributes(element)
    );

    this.bindingVars_ = typeConfig['bindings'];

    element.setAttribute('role', 'button');
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    if (!element.getAttribute('aria-label')) {
      element.setAttribute('aria-label', `Share by ${typeAttr}`);
    }
    element.addEventListener('click', () => this.handleClick_());
    element.addEventListener('keydown', this.handleKeyPress_.bind(this));
    element.classList.add(`amp-social-share-${typeAttr}`);
  }

  /** @override */
  layoutCallback() {
    // Do not layout if the component returns before
    // this.shareEndpoint_ is resolved from buildCallback.
    if (!this.shareEndpoint_) {
      return Promise.resolve();
    }

    const hrefWithVars = addParamsToUrl(
      dev().assertString(this.shareEndpoint_),
      this.params_
    );
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    const bindings = {};
    if (this.bindingVars_) {
      this.bindingVars_.forEach((name) => {
        const bindingName = name.toUpperCase();
        bindings[bindingName] = this.params_[name];
      });
    }

    return urlReplacements
      .expandUrlAsync(hrefWithVars, bindings)
      .then((href) => {
        this.href_ = href;
        // mailto:, sms: protocols breaks when opened in _blank on iOS Safari
        const {protocol} = Services.urlForDoc(this.element).parse(href);
        const isMailTo = protocol === 'mailto:';
        const isSms = protocol === 'sms:';
        this.target_ =
          this.platform_.isIos() && (isMailTo || isSms)
            ? '_top'
            : this.element.hasAttribute('data-target')
              ? this.element.getAttribute('data-target')
              : '_blank';
        if (isSms) {
          // http://stackoverflow.com/a/19126326
          // This code path seems to be stable for both iOS and Android.
          this.href_ = this.href_.replace('?', '?&');
        }
      });
  }

  /**
   * Handle key presses on the element.
   * @param {!Event} event
   * @private
   */
  handleKeyPress_(event) {
    const {key} = event;
    if (key == Keys_Enum.SPACE || key == Keys_Enum.ENTER) {
      event.preventDefault();
      this.handleActivation_();
    }
  }

  /**
   * Handle clicks on the element.
   * @private
   */
  handleClick_() {
    this.handleActivation_();
  }

  /** @private */
  handleActivation_() {
    userAssert(this.href_ && this.target_, 'Clicked before href is set.');
    const href = dev().assertString(this.href_);
    const target = dev().assertString(this.target_);
    if (this.shareEndpoint_ === 'navigator-share:') {
      const {navigator} = this.win;
      devAssert(navigator.share);
      const dataStr = href.substr(href.indexOf('?'));
      const data = parseQueryString(dataStr);
      // Spreading data into an Object since Chrome uses the Object prototype.
      // TODO:(crbug.com/1123689): Remove this workaround once WebKit fix is released.
      navigator.share({...data}).catch((e) => {
        user().warn(TAG, e.message, dataStr);
      });
    } else {
      const windowFeatures = 'resizable,scrollbars,width=640,height=480';
      openWindowDialog(this.win, href, target, windowFeatures);
    }
  }
}

AMP.extension('amp-social-share', '0.1', (AMP) => {
  AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
});
