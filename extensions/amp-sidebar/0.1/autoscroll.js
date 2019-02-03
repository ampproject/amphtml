/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {computedStyle} from '../../../src/style';
import {dev, user} from '../../../src/log';
import {scopedQuerySelector} from '../../../src/dom';
/**
 * Given a container, find the first descendant element with the `autoscroll`
 * attribute and scrolls the first scroller ancestor of that element which is
 * not the root scroller enough so that the element becomes visible.
 *
 * Note that we never scroll the main scroller. `autoscroll` is only
 * meant to work for sub scrolling areas.
 * @param {!../../../src/service/viewport/viewport-impl.Viewport} viewport
 * @param {!Element} container
 */
export function handleAutoscroll(viewport, container) {
  dev().assertElement(container);
  // Container could be sidebar or a clone of toolbar,
  // in the sidebar case, we need to exclude toolbar since original toolbar
  // nodes are also inside a sidebar.
  const elem = scopedQuerySelector(container, ':not([toolbar]) [autoscroll]');
  if (!elem) {
    return;
  }

  // verify parent is overflow auto or scroll
  const win = container.ownerDocument.defaultView;
  const overflow = computedStyle(win, container)['overflow-y'];
  if (overflow != 'scroll' && overflow != 'auto') {
    user().error('amp-sidebar [autoscroll]',
        `'nav [toolbar]' element must be set to overflow 'scroll'
        or 'auto' for 'autoscroll' to work.`);
    return;
  }

  viewport.animateScrollWithinParent(elem, container, 0, 'ease-in', 'center');
}


