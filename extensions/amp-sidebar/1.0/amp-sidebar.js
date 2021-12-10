import {CSS} from '../../../build/amp-sidebar-1.0.css';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';
import {Services} from '#service/';
import {dict} from '#core/types/object';
import {
  Component,
  afterClose,
  beforeOpen,
  deferredMount,
  mutationObserverCallback,
  props,
  shadowCss,
  updatePropsForRendering,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @const {string} */
const TAG = 'amp-sidebar';

class AmpSidebar extends AmpPreactBaseElement {
  /** @override */
  static deferredMount(unusedElement) {
    deferredMount(unusedElement);
  }
  /** @override */
  constructor(element) {
    super(element);

    /** @private {!../../../src/service/history-impl.History} */
    this.history_ = null;

    /** @private {number|null} */
    this.historyId_ = null;

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    this.history_ = Services.historyForDoc(this.getAmpDoc());

    this.registerApiAction('toggle', (api) => api./*OK*/ toggle());
    this.registerApiAction('open', (api) => api./*OK*/ open());
    this.registerApiAction('close', (api) => api./*OK*/ close());

    return dict({
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
    });
  }

  /** @override */
  updatePropsForRendering(props) {
    updatePropsForRendering(props, this.element);
  }

  /** @override */
  attachedCallback() {
    super.attachedCallback();
    if (
      this.element.parentNode != this.element.ownerDocument.body &&
      this.element.parentNode != this.getAmpDoc().getBody()
    ) {
      this.user().warn(
        TAG,
        `${TAG} is recommended to be a direct child of the <body>` +
          ` element to preserve a logical DOM order.`
      );
    }
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-sidebar'),
      'expected global "bento" or specific "bento-sidbar" experiment to be enabled'
    );
    return true;
  }

  /** @protected */
  beforeOpen() {
    this.open_ = beforeOpen(this.element);
  }

  /** @override */
  afterOpen() {
    const sidebar = this.element.shadowRoot.querySelector('[part=sidebar]');
    this.setAsContainer?.(sidebar);

    this.history_
      .push(() => this.api().close())
      .then((historyId) => (this.historyId_ = historyId));
  }

  /** @override */
  afterClose() {
    this.open_ = afterClose(this.element);
    this.removeAsContainer?.();

    if (this.historyId_ != null) {
      this.history_.pop(this.historyId_);
      this.historyId_ = null;
    }
  }

  /** @override */
  mutationObserverCallback() {
    this.open_ = mutationObserverCallback(
      this.element,
      this.open_,
      () => this.api().open(),
      () => this.api().close()
    );
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer?.();
  }
}

/** @override */
AmpSidebar['Component'] = Component;

/** @override */
AmpSidebar['usesShadowDom'] = usesShadowDom;

/** @override */
AmpSidebar['shadowCss'] = shadowCss;

/** @override */
AmpSidebar['props'] = props;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSidebar, CSS);
});
