/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-fresh-0.1.css';
import {copyChildren} from '../../../src/dom';
import {
  ampFreshManagerForDoc,
  installAmpFreshManagerForDoc,
} from './amp-fresh-manager';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';


/** @const */
const TAG = 'amp-fresh';

export class AmpFresh extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isExperimentOn_ = false;

    /** @private {string} */
    this.ampFreshId_ = '';

    /** @private {?./amp-fresh-manager.AmpFreshManager} */
    this.manager_ = null;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.win, TAG);

    user().assert(this.isExperimentOn_, `Experiment ${TAG} disabled`);

    this.ampFreshId_ = user().assert(this.element.getAttribute('id'),
        'amp-fresh must have an id.');

    installAmpFreshManagerForDoc(this.element);
    this.manager_ = ampFreshManagerForDoc(this.element);

    this.manager_.register(this.ampFreshId_, this);
  }

  /**
   * @param {!Element} surrogateAmpFresh
   */
  update(surrogateAmpFresh) {
    // Never reparent the surrogate to the current document's subtree
    // as this will trigger custom element life cycles,
    // importing it shouldn't trigger.
    /** @const {!Element} */
    const orphanSurrogate = dev().assertElement(
      this.win.document.adoptNode(surrogateAmpFresh));
    this.mutateElement(() => {
      this.element.textContent = '';
      copyChildren(orphanSurrogate, this.element);
      this.setFreshReady();
    });
  }

  /**
   * Toggles the element to be visible and active.
   */
  setFreshReady() {
    this.element.classList.add('amp-fresh-ready');
  }
}

AMP.registerElement('amp-fresh', AmpFresh, CSS);
