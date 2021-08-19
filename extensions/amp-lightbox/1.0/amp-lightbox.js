import {ActionTrust, DEFAULT_ACTION} from '#core/constants/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-lightbox-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '../../../src/event-helper';
import {isExperimentOn} from '#experiments';
import {toWin} from '#core/window';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-lightbox';

/** @extends {PreactBaseElement<LightboxDef.Api>} */
class AmpLightbox extends BaseElement {
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
      ActionTrust.LOW
    );
    this.registerApiAction('open', (api) => api.open(), ActionTrust.LOW);
    this.registerApiAction('close', (api) => api.close(), ActionTrust.LOW);

    return super.init();
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      toWin(element.ownerDocument.defaultView),
      `amp-lightbox.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust.HIGH
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
