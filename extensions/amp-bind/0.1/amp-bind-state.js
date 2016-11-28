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

import {bindServiceForDoc} from '../../../src/bind'
import {isJsonScriptTag} from '../../../src/dom';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

export class AmpBindState extends AMP.BaseElement {
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
  buildCallback() {
    const TAG = this.getName_();

    this.element.setAttribute('aria-hidden', 'true');

    const id = this.element.id;
    if (!id) {
      user().error(TAG, 'Element must have an id.');
    }

    let json;
    const children = this.element.children;
    if (children.length == 1) {
      const child = children[0];
      if (isJsonScriptTag(child)) {
        json = tryParseJson(children[0].textContent, e => {
          user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
        });
      } else {
        user().error(TAG,
            'State should be in a <script> tag with type="application/json"');
      }
    } else if (children.length > 1) {
      user().error(TAG, 'Should contain only one <script> child.');
    }

    if (id && json) {
      const state = Object.create(null);
      state[id] = json;

      const bindService = bindServiceForDoc(this.getAmpDoc());
      bindService.setState(state);
    }
  }

  /** @override */
  layoutCallback() {
    // Now that we are rendered, stop rendering the element to reduce
    // resource consumption.
    toggle(this.element, false);

    return Promise.resolve();
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return 'AmpBindState ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }
}
