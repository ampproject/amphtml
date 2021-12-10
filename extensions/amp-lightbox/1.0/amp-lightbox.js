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
import {dict} from '#core/types/object';
import {
  Component,
  afterLightboxClose,
  beforeLightboxOpen,
  props,
  shadowCss,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @const {string} */
const TAG = 'amp-lightbox';

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
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
    });
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

  /** @protected */
  beforeOpen() {
    this.open_ = beforeLightboxOpen(this.element, this.triggerEvent.bind(this));
  }

  /** @override */
  afterOpen() {
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer?.(scroller);

    this.history_
      .push(() => this.api().close())
      .then((historyId) => (this.historyId_ = historyId));
  }

  /** @override */
  afterClose() {
    this.open_ = afterLightboxClose(this.element, this.triggerEvent.bind(this));
    this.removeAsContainer?.();

    if (this.historyId_ != null) {
      this.history_.pop(this.historyId_);
      this.historyId_ = null;
    }
  }

  /** @override */
  mutationObserverCallback() {
    const open = this.element.hasAttribute('open');
    if (open === this.open_) {
      return;
    }
    this.open_ = open;
    open ? this.api().open() : this.api().close();
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer?.();
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
