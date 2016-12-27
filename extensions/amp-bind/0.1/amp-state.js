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

import {bindForDoc} from '../../../src/bind';
import {isJsonScriptTag} from '../../../src/dom';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

const TAG = 'AMP-STATE';

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
    if (event && event.detail && event.detail.response) {
      this.updateState_(event.detail.response);
    }
  }

  /** @override */
  buildCallback() {
    const name = this.getName_();

    toggle(this.element, false);
    this.element.setAttribute('aria-hidden', 'true');

    let json;
    const children = this.element.children;
    if (children.length == 1) {
      const child = children[0];
      if (isJsonScriptTag(child)) {
        json = tryParseJson(children[0].textContent, e => {
          user().error(name, 'Failed to parse state. Is it valid JSON?', e);
        });
      } else {
        user().error(name,
            'State should be in a <script> tag with type="application/json"');
      }
    } else if (children.length > 1) {
      user().error(name, 'Should contain only one <script> child.');
    }

    this.updateState_(json, true);
  }

  /** @override */
  renderOutsideViewport() {
    // We want the state data to be available wherever it is in the document.
    return true;
  }

  /**
   * @param {?JSONType} json
   * @param {boolean=} opt_isInit
   * @private
   */
  updateState_(json, opt_isInit) {
    if (!json) {
      return;
    }
    const id = user().assert(this.element.id, '%s must have an id.', TAG);
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
    return '<' + TAG + '> ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }
}
