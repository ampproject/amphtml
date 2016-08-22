/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/* jslint esnext:true */

import {CSS} from '../../../build/amp-timeline-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

/**
 * The implementation of `amp-timeline` component. See {@link ../amp-timeline.md} for
 * the spec.
 */
export class AmpTimeline extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @const @private {!NodeList} */

    this.sections_ = this.getRealChildren();
    this.sections_.forEach(section => {
      // Check that there is a section tag defined
      user.assert(
          section.tagName.toLowerCase() == 'section',
          'The first element in a timeline should be a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-timeline/amp-timeline.md. Found in: %s', section);
      const sectionComponents_ = section.children;
      let listExists = false;

      Array.from(sectionComponents_).forEach(elem => {

        if (elem.tagName.toLowerCase() == 'ul' &&
           elem.classList.contains('amp-timeline-list')) {
          listExists = true;
          const items = elem.children;

          Array.from(items).forEach((item, index) => {
            const card = item.children[0];

            // each item must be a li with class item
            user.assert(item.tagName.toLowerCase() == 'li' &&
                   item.classList.contains('amp-timeline-item'),
                   'Each item in the timeline must be a <li> tag ' +
                   'with class amp-timeline-item. Item number: %s, ' +
                   'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
                   'amp-timeline/amp-timeline.md. Found in: %s',
                   index + 1, this.element);

            // each item must contain only one card element
            user.assert(item.children.length == 1 &&
                   card.tagName.toLowerCase() == 'div' &&
                   card.classList.contains('amp-timeline-card'),
                  'Each item in the timeline must contain only one child ' +
                  'card element with class amp-timeline-card.' +
                  'Item number: %s, ' +
                  'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
                  'amp-timeline/amp-timeline.md. Found in: %s',
                  index + 1, this.element);
          });
        }
      });

      // If there is no ul with class timeline
      if (!listExists) {
        // Check the timeline items container
        user.assert(false,
               'The timeline should contain an ul with class ' +
               'amp-timeline-list, ' +
               'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
               'amp-timeline/amp-timeline.md. Found in: %s', this.element);
      }
    });
  }
}

AMP.registerElement('amp-timeline', AmpTimeline, CSS);
