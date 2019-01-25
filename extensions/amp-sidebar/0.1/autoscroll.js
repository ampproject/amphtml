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

import {dev} from '../../../src/log';
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
  return;
  dev().assertElement(container);
  const elem = scopedQuerySelector(container, ':not([toolbar]) [autoscroll]');
  if (!elem) {
    return;
  }
  viewport.animateScrollWithinParent(elem, container);
}


