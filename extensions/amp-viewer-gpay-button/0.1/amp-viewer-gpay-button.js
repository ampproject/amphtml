/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AmpPaymentGoogleIntegration} from '../../../src/service/payments/amp-payment-google';
import {Layout} from '../../../src/layout';
import {getServiceForDoc} from '../../../src/service';

/** @const {string} */
const TAG = 'amp-viewer-gpay-button';

/**
 * The implementation of `amp-viewer-gpay-button` component.
 */
class AmpViewerGpayButton extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /** @override */
  buildCallback() {
    /**
     * @private {!AmpPaymentGoogleIntegration}
     */
    this.paymentsIntegration_ = getServiceForDoc(
      this.win.document,
      'amp-payment-google-integration'
    );
    this.paymentsIntegration_.startGpayButton(this.element);
  }

  /** @override */
  layoutCallback() {
    return this.paymentsIntegration_.whenButtonReady();
  }

  /** @override */
  getTag_() {
    return TAG;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc('amp-payment-google-integration', function(ampdoc) {
    return new AmpPaymentGoogleIntegration(ampdoc);
  });
  AMP.registerElement(TAG, AmpViewerGpayButton);
});
