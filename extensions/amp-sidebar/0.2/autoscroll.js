import {scopedQuerySelector} from '#core/dom/query';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {user} from '#utils/log';

/**
 * Given a container, find the first descendant element with the `autoscroll`
 * attribute and scrolls the first scroller ancestor of that element which is
 * not the root scroller enough so that the element becomes visible.
 *
 * Note that we never scroll the main scroller. `autoscroll` is only
 * meant to work for sub scrolling areas of sidebar, including navbar.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} container
 */
export function handleAutoscroll(ampdoc, container) {
  // Container could be sidebar or a clone of toolbar,
  // in the sidebar case, we need to exclude toolbar since original toolbar
  // nodes are also inside a sidebar.
  const elem = scopedQuerySelector(container, ':not([toolbar]) [autoscroll]');
  if (!elem) {
    return;
  }

  // Verify parent is overflow auto or scroll.
  const overflow = computedStyle(ampdoc.win, container)['overflow-y'];
  if (overflow != 'scroll' && overflow != 'auto') {
    user().error(
      'AMP-SIDEBAR',
      `for 'autoscroll', 'nav [toolbar]' element must be set to overflow
        'scroll' or 'auto' for 'autoscroll' to work.`
    );
    return;
  }

  const duration = 0;
  const viewport = Services.viewportForDoc(ampdoc);
  viewport.animateScrollWithinParent(elem, container, 'center', duration);
}
