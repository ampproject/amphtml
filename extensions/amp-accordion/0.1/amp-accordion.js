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

import {Layout} from '../../../src/layout';
import {assert} from '../../../src/asserts';
import {isExperimentOn} from '../../../src/experiments';
import {log} from '../../../src/log';

/** @const */
const EXPERIMENT = 'amp-accordion';

/** @const */
const TAG = 'AmpAccordion';

class AmpAccordion extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    /** @const @private {!NodeList} */
    this.sections_ = this.getRealChildren();

    /** @const @private {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      log.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
      return;
    }
    this.sections_.forEach(section => {
      assert(
          section.tagName.toLowerCase() == 'section',
          'Sections should be enclosed in a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const sectionComponents_ = section.children;
      assert(
          sectionComponents_.length == 2,
          'Each section must have exactly two children. ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const header = sectionComponents_[0];
      const content = sectionComponents_[1];
      header.classList.add('-amp-accordion-header');
      content.classList.add('-amp-accordion-content');
      header.addEventListener('click', event => {
        event.preventDefault();
        this.mutateElement(() => {
          if (section.hasAttribute('expanded')) {
            section.removeAttribute('expanded');
          } else {
            section.setAttribute('expanded', '');
          }
        }, content);
      });
    });
  }
}

AMP.registerElement('amp-accordion', AmpAccordion, $CSS$);
