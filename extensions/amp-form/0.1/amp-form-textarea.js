import {AmpEvents_Enum} from '#core/constants/amp-events';
import {removeElement} from '#core/dom';
import {computedStyle, px, setStyle} from '#core/dom/style';
import {toArray} from '#core/types/array';
import {throttle} from '#core/types/function';

import {Services} from '#service';

import {listen, listenOncePromise} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';

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

    listen(root, AmpEvents_Enum.DOM_UPDATE, maybeInstall);
    maybeInstall();
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const root = ampdoc.getRootNode();

    /** @private @const */
    this.doc_ = root.ownerDocument || root;

    /** @private @const */
    this.win_ = /** @type {!Window} */ (devAssert(this.doc_.defaultView));

    /** @private @const */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private */
    this.unlisteners_ = [];

    this.unlisteners_.push(
      listen(root, 'input', (e) => {
        const element = dev().assertElement(e.target);
        if (
          element.tagName != 'TEXTAREA' ||
          !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)
        ) {
          return;
        }

        maybeResizeTextarea(element);
      })
    );

    this.unlisteners_.push(
      listen(root, 'mousedown', (e) => {
        if (e.which != 1) {
          return;
        }

        const element = dev().assertElement(e.target);
        // Handle all text area drag as we want to measure mutate and notify
        // the viewer of possible doc height changes.
        if (element.tagName != 'TEXTAREA') {
          return;
        }

        handleTextareaDrag(element);
      })
    );

    let cachedTextareaElements = root.querySelectorAll('textarea');
    this.unlisteners_.push(
      listen(root, AmpEvents_Enum.DOM_UPDATE, () => {
        cachedTextareaElements = root.querySelectorAll('textarea');
      })
    );
    const throttledResize = throttle(
      this.win_,
      (e) => {
        if (e.relayoutAll) {
          resizeTextareaElements(cachedTextareaElements);
        }
      },
      MIN_EVENT_INTERVAL_MS
    );
    this.unlisteners_.push(this.viewport_.onResize(throttledResize));

    handleInitialOverflowElements(cachedTextareaElements);
  }

  /**
   * Cleanup any consumed resources
   */
  dispose() {
    this.unlisteners_.forEach((unlistener) => unlistener());
  }
}

/**
 * For now, warn if textareas with initial overflow are present, and
 * prevent them from becoming autoexpand textareas.
 * @param {!IArrayLike<!Element>} textareas
 * @return {!Promise}
 */
export function handleInitialOverflowElements(textareas) {
  return Promise.all(
    toArray(textareas).map((element) => {
      return getHasOverflow(element).then((hasOverflow) => {
        if (hasOverflow) {
          user().warn(
            'AMP-FORM',
            '"textarea[autoexpand]" with initially scrolling content ' +
              'will not autoexpand.\n' +
              'See https://github.com/ampproject/amphtml/issues/20839'
          );
          element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
        }
      });
    })
  );
}

/**
 * Measure if any overflow is present on the element.
 * @param {!Element} element
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */
export function getHasOverflow(element) {
  const mutator = Services.mutatorForDoc(element);
  return mutator.measureElement(() => {
    return element./*OK*/ scrollHeight > element./*OK*/ clientHeight;
  });
}

/**
 * Attempt to resize all textarea elements
 * @param {!NodeList} elements
 */
function resizeTextareaElements(elements) {
  elements.forEach((element) => {
    if (
      element.tagName != 'TEXTAREA' ||
      !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)
    ) {
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
  const mutator = Services.mutatorForDoc(element);

  Promise.all([
    mutator.measureElement(() => element./*OK*/ scrollHeight),
    listenOncePromise(element, 'mouseup'),
  ]).then((results) => {
    const heightMouseDown = results[0];
    let heightMouseUp = 0;

    return mutator.measureMutateElement(
      element,
      () => {
        heightMouseUp = element./*OK*/ scrollHeight;
      },
      () => {
        maybeRemoveResizeBehavior(element, heightMouseDown, heightMouseUp);
      }
    );
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
  const mutator = Services.mutatorForDoc(element);
  const win = /** @type {!Window} */ (
    devAssert(element.ownerDocument.defaultView)
  );

  let offset = 0;
  let scrollHeight = 0;
  let maxHeight = 0;

  // The minScrollHeight is the minimimum height required to contain the
  // text content without showing a scrollbar.
  // This is different than scrollHeight, which is the larger of: 1. the
  // element's content, or 2. the element itself.
  const minScrollHeightPromise = getShrinkHeight(element);

  return mutator.measureMutateElement(
    element,
    () => {
      const computed = computedStyle(win, element);
      scrollHeight = element./*OK*/ scrollHeight;

      const maybeMaxHeight = parseInt(
        computed.getPropertyValue('max-height'),
        10
      );
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
    },
    () => {
      return minScrollHeightPromise.then((minScrollHeight) => {
        const height = minScrollHeight + offset;
        // Prevent the scrollbar from appearing
        // unless the text is beyond the max-height
        element.classList.toggle(AMP_FORM_TEXTAREA_MAX_CSS, height > maxHeight);

        // Prevent the textarea from shrinking if it has not yet expanded.
        const hasExpanded =
          AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA in element.dataset;

        // There is super specific a bug in Chrome affecting scrollHeight calculation
        // for textareas with padding when the document is zoomed in.
        // It makes the scrollHeight calculation off by ~1px.
        // This is why we have a small error margin.
        // TODO: Remove error margin when chrome bug is resolved (https://bugs.chromium.org/p/chromium/issues/detail?id=1171989).
        const errorMargin = /google/i.test(win.navigator.vendor) ? 3 : 0;
        const shouldResize =
          hasExpanded || scrollHeight <= minScrollHeight + errorMargin;

        if (shouldResize) {
          element.dataset[AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA] = '';
          // Set the textarea height to the height of the text
          setStyle(element, 'height', px(minScrollHeight + offset));
        }
      });
    }
  );
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
  const doc = /** @type {!Document} */ (devAssert(textarea.ownerDocument));
  const win = /** @type {!Window} */ (devAssert(doc.defaultView));
  const body = /** @type {!HTMLBodyElement} */ (devAssert(doc.body));
  const mutator = Services.mutatorForDoc(textarea);

  const clone = textarea.cloneNode(/*deep*/ false);
  clone.classList.add(AMP_FORM_TEXTAREA_CLONE_CSS);

  let cloneWidth = 0;
  let resultingHeight = 0;
  let shouldKeepTop = false;

  return mutator
    .measureMutateElement(
      body,
      () => {
        const computed = computedStyle(win, textarea);
        const maxHeight = parseInt(computed.getPropertyValue('max-height'), 10); // TODO(cvializ): what if it's a percent?
        cloneWidth = parseInt(computed.getPropertyValue('width'), 10);
        // maxHeight is NaN if the max-height property is 'none'.
        shouldKeepTop =
          isNaN(maxHeight) || textarea./*OK*/ scrollHeight < maxHeight;
      },
      () => {
        // Prevent a jump from the textarea element scrolling
        if (shouldKeepTop) {
          textarea./*OK*/ scrollTop = 0;
        }

        // Keep the clone's width consistent if the textarea was sized relative
        // to its parent element.
        setStyle(clone, 'width', px(cloneWidth));

        // Append the clone to the DOM so its scrollHeight can be read
        doc.body.appendChild(clone);
      }
    )
    .then(() => {
      return mutator.measureMutateElement(
        body,
        () => {
          resultingHeight = clone./*OK*/ scrollHeight;
        },
        () => {
          removeElement(clone);
        }
      );
    })
    .then(() => resultingHeight);
}
