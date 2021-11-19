import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
} from '#core/constants/action-constants';
import {CSS} from '../../../build/amp-lightbox-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '#utils/event-helper';
import {isExperimentOn} from '#experiments';
import {getWin} from '#core/window';
import {userAssert} from '#utils/log';
import {
  Component,
  isOpen,
  props,
  setIsOpen,
  shadowCss,
  usesShadowDom,
} from './element';
// AmpPreactBaseElement should be declared elsewhere and shared.
// We define it here to get around rule restrict-this-access.
import {PreactBaseElement as AmpPreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';

/** @const {string} */
const TAG = 'amp-lightbox';

/**
 * @param {Element} element
 * @param {string} eventName
 */
function triggerAmpEvent(element, eventName) {
  const event = createCustomEvent(
    getWin(element),
    `${element.localName}:${eventName}`
  );
  Services.actionServiceForDoc(element).trigger(
    element,
    eventName,
    event,
    ActionTrust_Enum.HIGH
  );
}

/** @extends {PreactBaseElement<LightboxDef.Api>} */
class AmpLightbox extends AmpPreactBaseElement {
  /** @override */
  constructor(element) {
    super(element);

    /** @private {!../../../src/service/history-impl.History} */
    this.history_ = null;

    /** @private {number|null} */
    this.historyId_ = null;
  }

  /** @override */
  init() {
    this.history_ = Services.historyForDoc(this.getAmpDoc());

    this.registerApiAction(
      DEFAULT_ACTION,
      (api) => api.open(),
      ActionTrust_Enum.LOW
    );
    this.registerApiAction('open', (api) => api.open(), ActionTrust_Enum.LOW);
    this.registerApiAction('close', (api) => api.close(), ActionTrust_Enum.LOW);

    return dict({
      'onBeforeOpen': () => this.onBeforeOpen_(),
      'onAfterOpen': () => this.onAfterOpen_(),
      'onAfterClose': () => this.onAfterClose_(),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-lightbox'),
      'expected global "bento" or specific "bento-lightbox" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @private */
  onBeforeOpen_() {
    setIsOpen(this.element, true);
    triggerAmpEvent(this.element, 'open');
  }

  /** @private */
  onAfterOpen_() {
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer(scroller);

    this.history_
      .push(() => this.api().close())
      .then((historyId) => (this.historyId_ = historyId));
  }

  /** @private */
  onAfterClose_() {
    setIsOpen(this.element, false);
    triggerAmpEvent(this.element, 'close');
    this.removeAsContainer?.();

    if (this.historyId_ != null) {
      this.history_.pop(this.historyId_);
      this.historyId_ = null;
    }
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer();
  }

  /** @override */
  mutationObserverCallback() {
    this.api().toggle(isOpen(this.element));
  }
}

/** @override */
AmpLightbox['Component'] = Component;

/** @override */
AmpLightbox['props'] = props;

/** @override */
AmpLightbox['usesShadowDom'] = usesShadowDom;

/** @override */
AmpLightbox['shadowCss'] = shadowCss;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightbox, CSS);
});
