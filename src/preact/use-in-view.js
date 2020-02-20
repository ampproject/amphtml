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

import {useEffect, useRef} from './index';

/**
 * @param {{current: HTMLElement}} ref
 * @param {function():(function():undefined|undefined)} effect
 * @param {!Array<*>=} opt_deps
 */
export function useInViewEffect(ref, effect, opt_deps) {
  const isIntersectingRef = useRef(false);
  /** @type {{current: (null|function():undefined|undefined)}} */ const unsubscribeRef = useRef(
    null
  );
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(entries => {
      const {isIntersecting} = entries[entries.length - 1];
      if (isIntersecting !== isIntersectingRef.current) {
        isIntersectingRef.current = isIntersecting;
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (isIntersecting) {
          unsubscribeRef.current = effect();
        }
      }
    });
    if (node) {
      observer.observe(node);
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      isIntersectingRef.current = false;
      unsubscribeRef.current = null;
      observer.disconnect();
    };
  }, [ref.current].concat(opt_deps));
}
