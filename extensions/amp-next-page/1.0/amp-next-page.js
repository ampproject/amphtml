import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {NextPageService} from './service';

import {CSS} from '../../../build/amp-next-page-1.0.css';

const TAG = 'amp-next-page';
const SERVICE = 'next-page';

export class AmpNextPage extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?NextPageService} */
    this.nextPageService_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.nextPageService_ = Services.nextPageServiceForDoc(this.element);
    return this.nextPageService_.build(this.element);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerServiceForDoc(SERVICE, NextPageService);
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
