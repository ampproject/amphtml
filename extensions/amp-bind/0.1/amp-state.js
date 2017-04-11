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

import {bindForDoc} from '../../../src/services';
import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

export class AmpState extends AMP.BaseElement {
  /** @override */
  getPriority() {
    // Loads after other content.
    return 1;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  activate(invocation) {
    const event = invocation.event;
    if (event && event.detail) {
      this.updateState_(event.detail.response);
    }
  }

  /** @override */
  buildCallback() {
    // Allow integration test to access this class in testing mode.
    user().assert(getMode().test || isExperimentOn(this.win, 'amp-bind'),
        `Experiment "amp-bind" is disabled.`);

    const TAG = this.getName_();

    toggle(this.element, /* opt_display */ false);
    this.element.setAttribute('aria-hidden', 'true');

    // Fetch JSON from endpoint at `src` attribute if it exists,
    // otherwise parse child script tag.
    if (this.element.hasAttribute('src')) {
      fetchBatchedJsonFor(this.getAmpDoc(), this.element).then(json => {
        this.updateState_(json, /* opt_isInit */ true);
      });
      if (this.element.children.length > 0) {
        user().error(TAG, 'Should not have children if src attribute exists.');
      }
    } else {
      const children = this.element.children;
      if (children.length == 1) {
        const firstChild = children[0];
        if (isJsonScriptTag(firstChild)) {
          const json = tryParseJson(firstChild.textContent, e => {
            user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
          });
          this.updateState_(json, /* opt_isInit */ true);
        } else {
          user().error(TAG,
              'State should be in a <script> tag with type="application/json"');
        }
      } else if (children.length > 1) {
        user().error(TAG, 'Should contain only one <script> child.');
      }
    }
  }

  /** @override */
  renderOutsideViewport() {
    // We want the state data to be available wherever it is in the document.
    return true;
  }

  /**
   * @param {*} json
   * @param {boolean=} opt_isInit
   * @private
   */
  updateState_(json, opt_isInit) {
    if (json === undefined || json === null) {
      return;
    }
    const id = user().assert(this.element.id, '<amp-state> must have an id.');
    const state = Object.create(null);
    state[id] = json;
    bindForDoc(this.getAmpDoc()).then(bind => {
      bind.setState(state, opt_isInit);
    });
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return '<amp-state> ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }
}
