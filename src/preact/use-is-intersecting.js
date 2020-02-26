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
import {useEffect, useState} from './index';

/** @type {Map<!Element, function(*):undefined>} */ const setters = new Map();
/** @type {null|IntersectionObserver} */ const sharedObserver = new IntersectionObserver(
  setLastEntriesByTarget
);

/**
 * @param {{current: HTMLElement}} ref
 * @return {boolean}
 */
export function useIsIntersecting(ref) {
  const {0: isIntersecting, 1: setIsIntersecting} = useState(null);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      sharedObserver.observe(dev().assertElement(node));
      setters.set(node, setIsIntersecting);
    }
    return () => {
      if (node) {
        sharedObserver.unobserve(dev().assertElement(node));
        setters.delete(node);
      }
    };
  }, [ref.current]);

  return isIntersecting;
}

/**
 * @param {!Array<IntersectionObserverEntry>} entries
 */
function setLastEntriesByTarget(entries) {
  entries.reduceRight((seen, entry) => {
    if (!seen.has(entry.target)) {
      const set = setters.get(entry.target);
      if (set) {
        set(entry.isIntersecting);
      }
      return seen.add(entry.target);
    }
  }, new Set([]));
}
