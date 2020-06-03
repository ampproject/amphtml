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

import {getAmpContext} from './context';
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from './index';

/**
 * @param {function()} callback
 */
export function useMountEffect(callback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [
    /* mount-only effect*/
  ]);
}

/**
 * @param {function()} callback
 */
export function useMountLayoutEffect(callback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(callback, [
    /* mount-only effect*/
  ]);
}

/**
 * Notifies Resources (if present) of a rerender in the component.
 * Every functional component **must** use this helper.
 */
export function useResourcesNotify() {
  const {'notify': notify} = useContext(getAmpContext());
  useLayoutEffect(() => {
    if (notify) {
      notify();
    }
  });
}

/**
 * Experimental hook to sync a state based on a property. The state is:
 * - Initialized from the property;
 * - Updated independently of the property when property is unchaged;
 * - Reset to the new property value when the property is updated.
 * @param {S|function():S} prop
 * @return {{0: S, 1: function((S|function(S):S)):undefined}}
 * @template S
 */
export function useStateFromProp(prop) {
  const valueRef = useRef(prop);
  const prevPropRef = useRef(prop);
  const [, setCounter] = useState(0);
  if (!Object.is(prop, prevPropRef.current)) {
    valueRef.current = prevPropRef.current = prop;
  }
  return {
    0: valueRef.current,
    // TBD/TODO: make a stable function. Per React's docs:
    // "React guarantees that setState function identity is stable and won't
    // change on re-renders."
    1: function set(value) {
      if (!Object.is(value, valueRef.current)) {
        valueRef.current = value;
        setCounter((state) => state + 1);
      }
    },
  };
}
