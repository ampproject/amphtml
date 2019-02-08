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
import {dev, devAssert} from '../../../src/log';
import {listenOncePromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {throttle} from '../../../src/utils/rate-limit';

const AMP_FORM_TEXTAREA_EXPAND_ATTR = 'autoexpand';

const AMP_FORM_TEXTAREA_SHRINK_DISABLED_ATTR = 'autoshrink-disabled';

const MIN_EVENT_INTERVAL_MS = 100;

const AMP_FORM_TEXTAREA_CLONE_CSS = 'i-amphtml-textarea-clone';

const AMP_FORM_TEXTAREA_CALCULATING_CSS = 'i-amphtml-textarea-calculating';

/**
 * This behavior can be removed when browsers implement `height: max-content`
 * for the textarea element.
 * https://github.com/w3c/csswg-drafts/issues/2141
 * @param {!Element} form
 */
export function installAmpFormTextarea(form) {
  form.addEventListener('input', e => {
    const element = dev().assertElement(e.target);
    if (element.tagName != 'TEXTAREA' ||
        !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
      return;
    }

    maybeResizeTextarea(element);
  });

  form.addEventListener('mousedown', e => {
    if (e.which != 1) {
      return;
    }

    const element = dev().assertElement(e.target);
    if (element.tagName != 'TEXTAREA' ||
        !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
      return;
    }

    maybeRemoveResizeBehavior(element);
  });

  const win = devAssert(form.ownerDocument.defaultView);
  win.addEventListener('resize', throttle(win, () => {
    const {length} = form.elements;
    for (let i = 0; i < length; i++) {
      const element = form.elements[i];
      if (element.tagName != 'TEXTAREA' ||
          !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
        continue;
      }

      maybeResizeTextarea(element);
    }
  }, MIN_EVENT_INTERVAL_MS));
}

/**
 * Remove the resize behavior if a user drags the resize handle and changes
 * the height of the textarea.
 * @param {!Element} element
 */
export function maybeRemoveResizeBehavior(element) {
  const resources = Services.resourcesForDoc(element);

  Promise.all([
    resources.measureElement(() => element.scrollHeight),
    listenOncePromise(element, 'mouseup'),
  ]).then(results => {
    const heightMouseDown = results[0];
    let heightMouseUp = 0;

    return resources.measureMutateElement(element, () => {
      heightMouseUp = element.scrollHeight;
    }, () => {
      if (heightMouseDown != heightMouseUp) {
        element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
      }
    });
  });
}

/**
 * Expand the textarea to fit its current text, if needed.
 * @param {!Element} element
 * @return {!Promise}
 */
export function maybeExpandTextarea(element) {
  const resources = Services.resourcesForDoc(element);
  const win = devAssert(element.ownerDocument.defaultView);

  let offset = 0;
  let scrollHeightPromise = null;

  if (element.hasAttribute(AMP_FORM_TEXTAREA_SHRINK_ATTR)) {
    scrollHeightPromise = getShrinkHeight(element);
  }

  return resources.measureMutateElement(element, () => {
    const computed = computedStyle(win, element);

    if (scrollHeightPromise == null) {
      scrollHeightPromise = Promise.resolve(element.scrollHeight);
    }

    if (computed.getPropertyValue('box-sizing') == 'content-box') {
      offset =
          -parseInt(computed.getPropertyValue('padding-top'), 10) +
          -parseInt(computed.getPropertyValue('padding-bottom'), 10);
    } else {
      offset =
          parseInt(computed.getPropertyValue('border-top-width'), 10) +
          parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    }
  }, () => {
    scrollHeightPromise.then(scrollHeight => {
      setStyle(element, 'height', px(scrollHeight + offset));
    });
  });
}

/**
 * If shrink behavior is enabled, get the amount to shrink or expand. This
 * uses a more expensive method to calculate the new height creating a temporary
 * clone of the node and setting its height to 0 to get the minimum scrollHeight
 * of the element's contents.
 * @param {!Element} textarea
 * @return {!Promise<number>}
 */
function getShrinkHeight(textarea) {
  const doc = devAssert(textarea.ownerDocument);
  const body = devAssert(doc.body);
  const resources = Services.resourcesForDoc(textarea);

  const clone = textarea.cloneNode(/*deep*/ false);
  clone.classList.add(AMP_FORM_TEXTAREA_CLONE_CSS);

  let height = 0;
  return resources.mutateElement(body, () => {
    // Prevent a jump from the textarea element scrolling
    textarea.scrollTop = 0; // TODO(cvializ): not if max height/scrollbar

    doc.body.appendChild(clone);
  }).then(() => {
    return resources.measureMutateElement(body, () => {
      height = clone.scrollHeight;
    }, () => {
      removeElement(clone);
    });
  }).then(() => height);
}
