/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {batchFetchJsonFor} from '../../../src/batched-json';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-render';

const AMP_STATE_URI_SCHEME = 'amp-state:';
const AMP_SCRIPT_URI_SCHEME = 'amp-script:';

/**
 * Returns true if element's src points to amp-state.
 * @param {?string} src
 * @return {boolean}
 */
const isAmpStateSrc = (src) => src && src.startsWith(AMP_STATE_URI_SCHEME);

/**
 * Returns true if element's src points to an amp-script function.
 * @param {?string} src
 * @return {boolean}
 */
const isAmpScriptSrc = (src) => src && src.startsWith(AMP_SCRIPT_URI_SCHEME);

class AmpRender extends BaseElement {
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
      isExperimentOn(this.win, 'amp-render'),
      'Experiment "amp-render" is not turned on.'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'getJson': this.getJsonFn_(),
    });
  }

  /**
   * Returns the correct fetch function for amp-state, amp-script or
   * to fetch remote JSON.
   *
   * @return {Function}
   * @private
   */
  getJsonFn_() {
    const src = this.element.getAttribute('src');
    if (!src) {
      // TODO(dmanek): assert that src is provided instead of silently failing below.
      return () => {};
    }
    if (isAmpStateSrc(src)) {
      return this.getAmpStateJson.bind(null, this.element);
    }
    if (isAmpScriptSrc(src)) {
      // TODO(dmanek): implement this
      return () => {};
    }
    return batchFetchJsonFor.bind(null, this.getAmpDoc(), this.element);
  }

  /**
   * TODO: this implementation is identical to one in amp-data-display &
   * amp-date-countdown. Move it to a common file and import it.
   *
   * @override
   */
  checkPropsPostMutations() {
    const templates =
      this.templates_ ||
      (this.templates_ = Services.templatesForDoc(this.element));
    const template = templates.maybeFindTemplate(this.element);
    if (template != this.template_) {
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
  }

  /**
   * TODO: this implementation is identical to one in amp-data-display &
   * amp-date-countdown. Move it to a common file and import it.
   *
   * @override
   */
  isReady(props) {
    if (this.template_ && !('render' in props)) {
      // The template is specified, but not available yet.
      return false;
    }
    return true;
  }

  /**
   * Gets the json an amp-list that has an "amp-state:" uri. For example,
   * src="amp-state:json.path".
   *
   * TODO: this implementation is identical to one in amp-list. Move it
   * to a common file and import it
   *
   * TODO: Add src as a param once this method is moved out of this class
   * to support src binding (https://github.com/ampproject/amphtml/pull/33189#discussion_r598743971).
   *
   * @param {!AmpElement} element
   * @return {Promise<!JsonObject>}
   */
  getAmpStateJson(element) {
    const src = element.getAttribute('src');
    if (!src) {
      return Promise.resolve({});
    }
    return Services.bindForDocOrNull(element)
      .then((bind) => {
        userAssert(bind, '"amp-state:" URLs require amp-bind to be installed.');
        const ampStatePath = src.slice(AMP_STATE_URI_SCHEME.length);
        return bind.getStateAsync(ampStatePath).catch((err) => {
          const stateKey = ampStatePath.split('.')[0];
          user().error(
            TAG,
            `'amp-state' element with id '${stateKey}' was not found.`
          );
          throw err;
        });
      })
      .then((json) => {
        userAssert(
          typeof json !== 'undefined',
          `[amp-render] No data was found at provided uri: ${src}`
        );
        return json;
      });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpRender);
});
