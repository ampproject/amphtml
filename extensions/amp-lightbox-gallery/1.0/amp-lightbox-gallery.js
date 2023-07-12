import {BaseElement} from '#bento/components/bento-lightbox-gallery/1.0/base-element';

import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';
import {elementByTag} from '#core/dom/query';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-lightbox-gallery-1.0.css';

/** @const {string} */
const TAG = 'amp-lightbox-gallery';

/** @const {string} */
const DEFAULT_GALLERY_ID = 'amp-lightbox-gallery';

class AmpLightboxGallery extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
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
      (api, invocation) => this.openAction(api, invocation),
      ActionTrust_Enum.HIGH
    );
    this.registerApiAction(
      'open',
      (api, invocation) => this.openAction(api, invocation),
      ActionTrust_Enum.HIGH
    );
    return super.init();
  }

  /**
   * @param {*} api
   * @param {*} invocation
   */
  openAction(api, invocation) {
    const id = invocation?.args?.['id'];
    if (id) {
      this.getAmpDoc().getElementById(id)?.click();
    } else {
      api.open();
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-lightbox-gallery'),
      'expected global "bento" or specific "bento-lightbox-gallery" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  afterOpen() {
    super.afterOpen();
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer?.(scroller);
    triggerAnalyticsEvent(this.element, 'lightboxOpened');

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
  onViewGrid() {
    super.onViewGrid();
    triggerAnalyticsEvent(this.element, 'thumbnailsViewToggled');
  }

  /** @override */
  onToggleCaption() {
    super.onToggleCaption();
    triggerAnalyticsEvent(this.element, 'descriptionOverflowToggled');
  }

  /** @override */
  unmountCallback() {
    super.unmountCallback();
    this.removeAsContainer?.();
  }
}

/**
 * Tries to find an existing amp-lightbox-gallery, if there is none, it adds a
 * default one.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<undefined>}
 */
export function installLightboxGallery(ampdoc) {
  // Make sure to wait for the ampdoc to finish loading, see:
  // https://github.com/ampproject/amphtml/issues/19728#issuecomment-446033966
  return ampdoc
    .whenReady()
    .then(() => ampdoc.getBody())
    .then((body) => {
      const existingGallery = elementByTag(ampdoc.getRootNode(), TAG);
      if (!existingGallery) {
        const gallery = createElementWithAttributes(ampdoc.win.document, TAG, {
          'layout': 'nodisplay',
          'id': DEFAULT_GALLERY_ID,
        });
        body.appendChild(gallery);
        gallery.build();
      }
    });
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  Services.extensionsFor(AMP.win).addDocFactory(installLightboxGallery);
});
