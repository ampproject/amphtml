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

import {AmpEvents} from '../../../src/amp-events';
import {Services} from '../../../src/services';
import {computedStyle, px, setStyle} from '../../../src/style';
import {dev, devAssert, user} from '../../../src/log';
import {iterateCursor, removeElement} from '../../../src/dom';
import {listen, listenOncePromise} from '../../../src/event-helper';
import {throttle} from '../../../src/utils/rate-limit';

const AMP_FORM_TEXTAREA_EXPAND_ATTR = 'autoexpand';

const MIN_EVENT_INTERVAL_MS = 100;

const AMP_FORM_TEXTAREA_CLONE_CSS = 'i-amphtml-textarea-clone';

const AMP_FORM_TEXTAREA_MAX_CSS = 'i-amphtml-textarea-max';

const AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA = 'iAmphtmlHasExpanded';

/**
 * Install expandable textarea behavior for the given form.
 *
 * This class should be able to be removed when browsers implement
 * `height: max-content` for the textarea element.
 * https://github.com/w3c/csswg-drafts/issues/2141
 */
export class AmpFormTextarea {
  /**
   * Install, monitor and cleanup the document as `textarea[autoexpand]`
   * elements are added and removed.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  static install(ampdoc) {
    const root = ampdoc.getRootNode();

    let ampFormTextarea = null;
    const maybeInstall = () => {
      const autoexpandTextarea = root.querySelector('textarea[autoexpand]');
      if (autoexpandTextarea && !ampFormTextarea) {
        ampFormTextarea = new AmpFormTextarea(ampdoc);
        return;
      }

      if (!autoexpandTextarea && ampFormTextarea) {
        ampFormTextarea.dispose();
        ampFormTextarea = null;
        return;
      }
    };

    listen(root, AmpEvents.DOM_UPDATE, maybeInstall);
    maybeInstall();
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const root = ampdoc.getRootNode();

    /** @private @const */
    this.doc_ = (root.ownerDocument || root);

    /** @private @const */
    this.win_ = devAssert(this.doc_.defaultView);

    /** @private @const */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private */
    this.unlisteners_ = [];

    this.unlisteners_.push(listen(root, 'input', e => {
      const element = dev().assertElement(e.target);
      if (element.tagName != 'TEXTAREA' ||
          !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
        return;
      }

      maybeResizeTextarea(element);
    }));

    this.unlisteners_.push(listen(root, 'mousedown', e => {
      if (e.which != 1) {
        return;
      }

      const element = dev().assertElement(e.target);
      if (element.tagName != 'TEXTAREA' ||
          !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
        return;
      }

      handleTextareaDrag(element);
    }));

    let cachedTextareaElements = root.querySelectorAll('textarea');
    this.unlisteners_.push(listen(root, AmpEvents.DOM_UPDATE, () => {
      cachedTextareaElements = root.querySelectorAll('textarea');
    }));
    const throttledResize = throttle(
        /** @type {!Window} */ (this.win_), e => {
          if (e.relayoutAll) {
            resizeTextareaElements(cachedTextareaElements);
          }
        }, MIN_EVENT_INTERVAL_MS);
    this.unlisteners_.push(this.viewport_.onResize(throttledResize));

    // For now, warn if textareas with initial overflow are present, and
    // prevent them from becoming autoexpand textareas.
    iterateCursor(cachedTextareaElements, element => {
      getHasOverflow(element).then(hasOverflow => {
        if (hasOverflow) {
          user().warn('AMP-FORM',
              '"textarea[autoexpand]" with initially scrolling content ' +
              'will not autoexpand.\n' +
              'See https://github.com/ampproject/amphtml/issues/20839');
          element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
        }
      });
    });
  }

  /**
   * Cleanup any consumed resources
   */
  dispose() {
    this.unlisteners_.forEach(unlistener => unlistener());
  }
}

/**
 * Measure if any overflow is present on the element.
 * @param {!Element} element
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */
export function getHasOverflow(element) {
  const resources = Services.resourcesForDoc(element);
  return resources.measureElement(() => {
    return element./*OK*/scrollHeight > element./*OK*/clientHeight;
  });
}

/**
 * Attempt to resize all textarea elements
 * @param {!IArrayLike<!Element>} elements
 */
function resizeTextareaElements(elements) {
  iterateCursor(elements, element => {
    if (element.tagName != 'TEXTAREA' ||
        !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
      return;
    }

    maybeResizeTextarea(element);
  });
}

/**
 * This makes no assumptions about the location of the resize handle, and it
 * assumes that if the user drags the mouse at any position and the height of
 * the textarea changes, then the user intentionally resized the textarea.
 * @param {!Element} element
 */
function handleTextareaDrag(element) {
  const resources = Services.resourcesForDoc(element);

  Promise.all([
    resources.measureElement(() => element./*OK*/scrollHeight),
    listenOncePromise(element, 'mouseup'),
  ]).then(results => {
    const heightMouseDown = results[0];
    let heightMouseUp = 0;

    return resources.measureMutateElement(element, () => {
      heightMouseUp = element./*OK*/scrollHeight;
    }, () => {
      maybeRemoveResizeBehavior(element, heightMouseDown, heightMouseUp);
    });
  });
}

/**
 * Remove the resize behavior if a user drags the resize handle and changes
 * the height of the textarea.
 * @param {!Element} element
 * @param {number} startHeight
 * @param {number} endHeight
 */
function maybeRemoveResizeBehavior(element, startHeight, endHeight) {
  if (startHeight != endHeight) {
    element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
  }
}

/**
 * Resize the textarea to fit its current text, by expanding or shrinking if
 * needed.
 * @param {!Element} element
 * @return {!Promise}
 * @visibleForTesting
 */
export function maybeResizeTextarea(element) {
  const resources = Services.resourcesForDoc(element);
  const win = devAssert(element.ownerDocument.defaultView);

  let offset = 0;
  let scrollHeight = 0;
  let maxHeight = 0;

  // The minScrollHeight is the minimimum height required to contain the
  // text content without showing a scrollbar.
  // This is different than scrollHeight, which is the larger of: 1. the
  // element's content, or 2. the element itself.
  const minScrollHeightPromise = getShrinkHeight(element);

  return resources.measureMutateElement(element, () => {
    const computed = computedStyle(
        /** @type {!Window} */ (win), element);
    scrollHeight = element./*OK*/scrollHeight;

    const maybeMaxHeight =
        parseInt(computed.getPropertyValue('max-height'), 10);
    maxHeight = isNaN(maybeMaxHeight) ? Infinity : maybeMaxHeight;

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
    return minScrollHeightPromise.then(minScrollHeight => {
      const height = minScrollHeight + offset;
      // Prevent the scrollbar from appearing
      // unless the text is beyond the max-height
      element.classList.toggle(AMP_FORM_TEXTAREA_MAX_CSS, height > maxHeight);

      // Prevent the textarea from shrinking if it has not yet expanded.
      const hasExpanded =
          AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA in element.dataset;
      const shouldResize = (hasExpanded || scrollHeight <= minScrollHeight);

      if (shouldResize) {
        element.dataset[AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA] = '';
        // Set the textarea height to the height of the text
        setStyle(element, 'height', px(minScrollHeight + offset));
      }
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
  const win = devAssert(doc.defaultView);
  const body = devAssert(doc.body);
  const resources = Services.resourcesForDoc(textarea);

  const clone = textarea.cloneNode(/*deep*/ false);
  clone.classList.add(AMP_FORM_TEXTAREA_CLONE_CSS);

  let height = 0;
  let shouldKeepTop = false;

  return resources.measureMutateElement(
      dev().assertElement(body), () => {
        const computed = computedStyle(/** @type {!Window} */ (win), textarea);
        const maxHeight = parseInt(computed.getPropertyValue('max-height'), 10); // TODO(cvializ): what if it's a percent?

        // maxHeight is NaN if the max-height property is 'none'.
        shouldKeepTop =
        (isNaN(maxHeight) || textarea./*OK*/scrollHeight < maxHeight);
      }, () => {
        // Prevent a jump from the textarea element scrolling
        if (shouldKeepTop) {
          textarea./*OK*/scrollTop = 0;
        }
        // Append the clone to the DOM so its scrollHeight can be read
        doc.body.appendChild(clone);
      }).then(() => {
    return resources.measureMutateElement(
        dev().assertElement(body), () => {
          height = clone./*OK*/scrollHeight;
        }, () => {
          removeElement(clone);
        });
  }).then(() => height);
}
