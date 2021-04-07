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

import {BaseElement} from './base-element';
import {Services} from '../../../src/services';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const {string} */
const TAG = 'amp-date-countdown';

class AmpDateCountdown extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-date-countdown'),
      'expected global "bento" or specific "bento-date-countdown" experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  checkPropsPostMutations() {
    const templates =
      this.templates_ ||
      (this.templates_ = Services.templatesForDoc(this.element));
    const template = templates.maybeFindTemplate(this.element);
    if (template === this.template_) {
      return;
    }
    this.template_ = template;
    if (template) {
      // Only overwrite `render` when template is ready to minimize FOUC.
      templates.whenReady(template).then(() => {
        if (template != this.template_) {
          // A new template has been set while the old one was initializing.
          return;
        }
        this.mutateProps(
          dict({
            'render': (data) => {
              return templates
                .renderTemplateAsString(dev().assertElement(template), data)
                .then((html) => dict({'__html': html}));
            },
          })
        );
      });
    } else {
      this.mutateProps(dict({'render': null}));
    }
  }

  /** @override */
  isReady(props) {
    if (this.template_ && !('render' in props)) {
      // The template is specified, but not available yet.
      return false;
    }
    return true;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpDateCountdown);
});
