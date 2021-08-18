

import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-sidebar-1.0.css';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';
import {Services} from '#service/';

/** @const {string} */
const TAG = 'amp-sidebar';

class AmpSidebar extends BaseElement {
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

    this.registerApiAction('toggle', (api) => api./*OK*/ toggle());
    this.registerApiAction('open', (api) => api./*OK*/ open());
    this.registerApiAction('close', (api) => api./*OK*/ close());

    return super.init();
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

  /** @override */
  afterOpen() {
    super.afterOpen();
    const sidebar = this.element.shadowRoot.querySelector('[part=sidebar]');
    this.setAsContainer?.(sidebar);

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
  AMP.registerElement(TAG, AmpSidebar, CSS);
});
