<<<<<<< HEAD
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

import {useLayoutEffect} from '#preact';
=======
import {useCallback, useLayoutEffect} from '#preact';
>>>>>>> ee146180f7... `useMergeRefs` custom hook (#36024)

import {useAmpContext} from './context';

/**
 * Notifies Resources (if present) of a rerender in the component.
 * Every functional component **must** use this helper.
 */
export function useResourcesNotify() {
  const {notify} = useAmpContext();
  useLayoutEffect(() => {
    if (notify) {
      notify();
    }
  });
}

/**
 * @param {{current: ?}|function()} ref
 * @param {!Element} value
 */
function setRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Combines refs to pass into `ref` prop.
 * @param {!Array<*>} refs
 * @return {function(Element):function()}
 */
export function useMergeRefs(refs) {
  return useCallback(
    (element) => {
      for (let i = 0; i < refs.length; i++) {
        setRef(refs[i], element);
      }
    },
    // refs is an array, but ESLint cannot statically verify it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
