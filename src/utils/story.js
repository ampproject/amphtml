import {waitForChildPromise} from '#core/dom';
import {closestAncestorElementBySelector} from '#core/dom/query';

import {Services} from '#service';

/**
 * Checks if an element descends from `amp-story` in order to configure
 * story-specific behavior.
 *
 * This utility has a tree-scanning cost.
 * @param {!Element} element
 * @return {boolean}
 */
export function descendsFromStory(element) {
  return !!closestAncestorElementBySelector(element, 'amp-story');
}

/**
 * Returns true if the document is an amp-story.
 * Times out after `timeout` ms (default is 2000).
 *
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 */
export function isStoryDocument(ampdoc) {
  return ampdoc.waitForBodyOpen().then(() => {
    const body = ampdoc.getBody();
    const childPromise = waitForChildPromise(
      body,
      () => !!body.firstElementChild
    );
    // 2s timeout for edge case where body has no element children.
    return Services.timerFor(ampdoc.win)
      .timeoutPromise(2000, childPromise)
      .then(
        () => body.firstElementChild.tagName === 'AMP-STORY',
        () => false
      );
  });
}
