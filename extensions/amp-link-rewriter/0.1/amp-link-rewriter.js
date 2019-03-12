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

import {LinkShifter} from './link-shifter';
import {Priority} from '../../../src/service/navigation';
import {Services} from '../../../src/services';
import {getConfigOpts} from './config-options';
import {getScopeElements} from './helper';

export class AmpLinkRewriter extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = null;

    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = null;

    /* @private {?./link-shifter} */
    this.shifter_ = null;

    /** @private {?Object} */
    this.configOpts_ = {};

    /** @private {?Object} */
    this.listElements_ = null;
  }

  /** @override */
  buildCallback() {

    this.ampDoc_ = this.getAmpDoc();
    this.viewer_ = Services.viewerForDoc(this.ampDoc_);

    this.configOpts_ = getConfigOpts(this.element);

    return this.ampDoc_.whenBodyAvailable()
        .then(this.letsRockIt_.bind(this));
  }

  /**
   * @private
   */
  letsRockIt_() {
    this.shifter_ = new LinkShifter(
        this.element,
        this.viewer_);

    this.attachClickEvent_();
  }

  /**
   * @private
   */
  attachClickEvent_() {
    this.listElements_ = getScopeElements(
        this.ampDoc_,
        this.configOpts_);

    this.listElements_.forEach(nodeElement => {

      const navigation = Services.navigationForDoc(nodeElement);
      navigation.registerAnchorMutator((anchor, event) => {
        this.shifter_.clickHandler(event);
      },
      Priority.LINK_REWRITER_MANAGER);

    });

    return true;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}

AMP.extension('amp-link-rewriter', '0.1', AMP => {
  AMP.registerElement('amp-link-rewriter', AmpLinkRewriter);
});
