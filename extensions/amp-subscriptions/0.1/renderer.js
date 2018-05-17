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
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
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
    this.getRootElement_().classList.add(`${CSS_PREFIX}-ready`);

    // Check and add progress bar.
    this.addLoadingBar();
  }

  /**
   * @return {!Element}
   * @private
   */
  getRootElement_() {
    const root = this.ampdoc_.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /**
   * @param {string} type
   * @param {?boolean} state
   * @private
   */
  setState_(type, state) {
    this.resources_.mutateElement(this.ampdoc_.getBody() , () => {
      this.getRootElement_().classList.toggle(
          `${CSS_PREFIX}-${type}-unk`,
          state === null);
      this.getRootElement_().classList.toggle(
          `${CSS_PREFIX}-${type}-yes`,
          state === true);
      this.getRootElement_().classList.toggle(
          `${CSS_PREFIX}-${type}-no`,
          state === false);
    });
  }

  addLoadingBar() {
    return this.ampdoc_.whenReady().then(() => {
      if (!this.ampdoc_.getBody().querySelector(
          '[subscriptions-section=loading]')) {
        const element = createElementWithAttributes(this.ampdoc_.win.document,
            'div' ,
            dict({
              'class': 'i-amphtml-subs-progress',
              'subscriptions-section': 'loading',
            })
        );
        this.ampdoc_.getBody().appendChild(element);
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
      this.getRootElement_().classList.toggle(`${CSS_PREFIX}-${type}`, state);
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
