import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

export class AmpYotpo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {Array<Function>} */
    this.unlisteners_ = [];
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://staticw2.yotpo.com',
      opt_onLayout
    );
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('data-app-key'),
      'The data-app-key attribute is required for <amp-yotpo> %s',
      this.element
    );
    userAssert(
      this.element.getAttribute('data-widget-type'),
      'The data-widget-type attribute is required for <amp-yotpo> %s',
      this.element
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'yotpo');
    iframe.title = this.element.title || 'Yotpo widget';
    applyFillContent(iframe);

    const unlisten = listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.attemptChangeHeight(data['height']).catch(() => {
          /* do nothing */
        });
      },
      /* opt_is3P */ true
    );
    this.unlisteners_.push(unlisten);

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-yotpo', '0.1', (AMP) => {
  AMP.registerElement('amp-yotpo', AmpYotpo);
});
