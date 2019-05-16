/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {childElementByTag, createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';

const CSS_PREFIX = 'i-amphtml-subs';

export class Renderer {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    // Initial state is "unknown".
    this.setGrantState(null);
    this.getBodyElement_().classList.add(`${CSS_PREFIX}-ready`);

    // Check and add progress bar.
    this.addLoadingBar();
  }

  /**
   * @return {!Element}
   * @private
   */
  getBodyElement_() {
    return this.ampdoc_.getBody();
  }

  /**
   * @param {string} type
   * @param {?boolean} state
   * @private
   */
  setState_(type, state) {
    this.resources_.mutateElement(this.ampdoc_.getBody(), () => {
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-unk`,
        state === null
      );
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-yes`,
        state === true
      );
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-no`,
        state === false
      );
    });
  }

  /**
   * Adds a loading bar.
   *
   * @return {!Promise}
   */
  addLoadingBar() {
    return this.ampdoc_.whenReady().then(() => {
      const body = this.ampdoc_.getBody();
      if (!body.querySelector('[subscriptions-section=loading]')) {
        const element = createElementWithAttributes(
          this.ampdoc_.win.document,
          'div',
          dict({
            'class': 'i-amphtml-subs-progress',
            'subscriptions-section': 'loading',
          })
        );
        // The loading indicator will be either inserted right before the
        // `<footer>` node or appended as the last child.
        body.insertBefore(element, childElementByTag(body, 'footer'));
      }
    });
  }

  /**
   * @param {string} type
   * @param {boolean} state
   * @private
   */
  toggleState_(type, state) {
    this.resources_.mutateElement(this.ampdoc_.getBody(), () => {
      this.getBodyElement_().classList.toggle(`${CSS_PREFIX}-${type}`, state);
    });
  }

  /**
   * @param {?boolean} state
   */
  setGrantState(state) {
    this.setState_('grant', state);
  }

  /**
   * @param {boolean} loading
   */
  toggleLoading(loading) {
    this.toggleState_('loading', loading);
  }
}
