import {BaseElement} from '#bento/components/bento-lightbox/1.0/base-element';

import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
} from '#core/constants/action-constants';
import {getWin} from '#core/window';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-lightbox-1.0.css';

/** @const {string} */
const TAG = 'amp-lightbox';

/** @extends {PreactBaseElement<LightboxDef.Api>} */
class AmpLightbox extends setSuperClass(BaseElement, AmpPreactBaseElement) {
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

    return super.init();
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      getWin(element),
      `amp-lightbox.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust_Enum.HIGH
    );

    super.triggerEvent(element, eventName, detail);
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

  /** @override */
  afterOpen() {
    super.afterOpen();
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer?.(scroller);

    this.history_
      .push(() => this.api().close())
      .then((historyId) => (this.historyId_ = historyId));
  }

  /** @override */
  afterClose() {
    super.afterClose();
    this.removeAsContainer?.();

    if (this.historyId_ != null) {
      this.history_.pop(this.historyId_);
      this.historyId_ = null;
    }
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer?.();
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightbox, CSS);
});
