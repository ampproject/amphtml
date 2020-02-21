/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../log';
import {useEffect, useRef} from './index';

/** @type {null|IntersectionObserver} */ let sharedObserver = null;

/**
 * @param {{current: HTMLElement}} ref
 * @param {function():(function():undefined|undefined)} fn
 */
export function useFnInView(ref, fn) {
  const isIntersectingRef = useRef(false);
  if (sharedObserver === null) {
    sharedObserver = new IntersectionObserver(entries => {
      const {isIntersecting} = entries[entries.length - 1];
      if (isIntersecting !== isIntersectingRef.current) {
        isIntersectingRef.current = isIntersecting;
        if (isIntersecting) {
          fn();
        }
      }
    });
  }
  useEffect(() => {
    const node = ref.current;
    if (node) {
      sharedObserver.observe(dev().assertElement(node));
    }
    return () => {
      isIntersectingRef.current = false;
      if (node) {
        sharedObserver.unobserve(dev().assertElement(node));
      }
    };
  }, [ref.current]);
}
