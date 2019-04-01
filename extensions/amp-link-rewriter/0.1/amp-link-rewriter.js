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

import {Layout} from '../../../src/layout';
import {LinkRewriter} from './link-rewriter';
import {Priority} from '../../../src/service/navigation';
import {Services} from '../../../src/services';
import {getConfigOpts} from './config-options';

export class AmpLinkRewriter extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = this.getAmpDoc();

    /** @private {?./link-rewriter.LinkRewriter} */
    this.rewriter_ = null;

    /** @private {string} */
    this.referrer_ = '';

    this.navigation_ = Services.navigationForDoc(this.ampDoc_);
  }

  /** @override */
  buildCallback() {
    const viewer = Services.viewerForDoc(this.ampDoc_);

    /**
     * We had to get referrerUrl here because when we use expandUrlSync()
     * inside LinkRewriter it doesn't retrieve the referrerUrl
     */
    return this.ampDoc_.whenBodyAvailable()
        .then(() => viewer.getReferrerUrl())
        .then(referrer => this.referrer_ = referrer)
        .then(this.letsRockIt_.bind(this));
  }

  /**
   * @private
   */
  letsRockIt_() {
    this.rewriter_ = new LinkRewriter(
        this.referrer_,
        this.element,
        this.ampDoc_);

    this.attachClickEvent_();
  }

  /**
   * @private
   */
  attachClickEvent_() {
    this.navigation_.registerAnchorMutator(anchor => {
      this.rewriter_.handleClick(anchor);
    }, Priority.LINK_REWRITER_MANAGER);

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}

AMP.extension('amp-link-rewriter', '0.1', AMP => {
  AMP.registerElement('amp-link-rewriter', AmpLinkRewriter);
});
