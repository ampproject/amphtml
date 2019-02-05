/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {computedStyle, px, setStyle} from '../../../src/style';

const AMP_FORM_TEXTAREA_EXPAND_ATTR = 'autoexpand';

/**
 * This behavior can be removed when browsers implement `height: max-content`
 * for the textarea element.
 * https://github.com/w3c/csswg-drafts/issues/2141
 * @param {!Element} form
 */
export function installAmpFormTextarea(form) {
  form.addEventListener('input', e => {
    const element = e.target;
    if (element.tagName != 'TEXTAREA' ||
        !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
      return;
    }
    maybeExpandTextarea(element);
  });
}

/**
 * Expand the textarea to fit its current text, if needed.
 * @param {!Element} element
 * @return {!Promise}
 */
export function maybeExpandTextarea(element) {
  const resources = Services.resourcesForDoc(element);
  const win = element.ownerDocument.defaultView;

  let padding = 0;
  let scrollHeight = 0;

  return resources.measureMutateElement(element, () => {
    const computed = computedStyle(win, element);

    scrollHeight = element.scrollHeight;
    padding =
        parseInt(computed.getPropertyValue('padding-top'), 10) +
        parseInt(computed.getPropertyValue('padding-bottom'), 10);
  }, () => {
    setStyle(element, 'height', px(scrollHeight - padding));
  });
}
