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

import {useLayoutEffect, useRef, useState} from './index';

/**
 * @param {object} ref
 * @return {?Array<IntersectionObserverEntry>}
 */
export function useIntersect(ref) {
  const {0: entries, 1: set} = useState([]);
  const observerRef = useRef(null);
  if (observerRef.current === null) {
    observerRef.current = new IntersectionObserver(set);
  }

  useLayoutEffect(() => {
    const {current: node} = ref;
    const {current: observer} = observerRef;
    observer.disconnect();
    if (node) {
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [ref.current]);
  return entries;
}
