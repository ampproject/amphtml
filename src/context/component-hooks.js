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

import {devAssert} from '../log';
import {protectedNoInline} from './scheduler';

const EMPTY_DEPS = [];

/**
 * @type {!./component.Component|undefined}
 */
let currentComponent;

/**
 * Sets the component as a current component and executes the callback. Clears
 * out the current component after the callback is done.
 *
 * @param {!./component.Component} component
 * @param {function()} callback
 * @package
 */
export function withComponent(component, callback) {
  currentComponent = component;
  try {
    callback();
  } finally {
    currentComponent = undefined;
  }
}

/**
 * @return {!./component.Component}
 */
function getComponent() {
  return devAssert(currentComponent);
}

/**
 * A reusable reference value hook. Mostly the same as the React's `useHook`.
 *
 * @param {T} def
 * @return {{current: T}}
 * @template T
 */
export function useRef(def = undefined) {
  return getComponent().allocRef(def);
}

/**
 * A hook to compute a persistent value. Mostly the same as the React's
 * `useMemo` API.
 *
 * @param {function():T} compute
 * @param {!Array} deps
 * @return {T}
 * @template T
 */
export function useMemo(compute, deps) {
  const ref = useRef();
  useSyncEffect(() => {
    ref.current = compute();
  }, deps);
  return ref.current;
}

/**
 * Functions similarly to `useMemo`, but besides being able to return a computed
 * value, it also provides a cleanup callback.
 *
 * @param {function(!Node, ...?):({value: T, dispose: function()}|function())} factory
 * @param {!Array=} deps
 * @return {T}
 * @template T
 */
export function useDisposable(factory, deps = undefined) {
  deps = deps || EMPTY_DEPS;
  const component = getComponent();
  const ref = component.allocRef();
  useSyncEffect(() => {
    const result = callFactory(
      factory,
      component.contextNode.node,
      devAssert(deps)
    );
    let value, dispose;
    if (typeof result == 'function') {
      dispose = result;
    } else {
      ({value, dispose} = result);
    }
    ref.current = value;
    return () => {
      ref.current = undefined;
      if (dispose) {
        dispose();
      }
    };
  }, deps);
  return ref.current;
}

/**
 * Similar to the React's `useEffect`, but it's executed synchronously.
 * Another distinction: if the `deps` argument is not provided, it's assumed
 * to be an empty array.
 *
 * @param {function():(void|function())} callback
 * @param {!Array=} deps
 */
export function useSyncEffect(callback, deps = undefined) {
  deps = deps || EMPTY_DEPS;
  const component = getComponent();
  const depRef = component.allocRef();
  const cleanupRef = component.allocRef();
  if (!depRef.current) {
    // Mounting.
    component.pushCleanup(() => {
      depRef.current = undefined;
      cleanupRef.current = undefined;
    });
  }
  const changed = !depRef.current || !eq(depRef.current, deps);
  if (changed) {
    depRef.current = deps.slice(0);

    // Cleanup.
    const cleanup = cleanupRef.current;
    if (cleanup) {
      cleanupRef.current = null;
      component.popCleanup(cleanup);
      protectedNoInline(cleanup);
    }

    const newCleanup = callback();
    if (newCleanup) {
      cleanupRef.current = newCleanup;
      component.pushCleanup(newCleanup);
    }
  }
}

/**
 * @param {!Array} a1
 * @param {!Array} a2
 * @return {boolean}
 */
function eq(a1, a2) {
  if (a1.length != a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * @param {function(...?):?} factory
 * @param {!Node} node
 * @param {!Array} deps
 * @return {?}
 */
function callFactory(factory, node, deps) {
  switch (deps.length) {
    case 0:
      return factory(node);
    case 1:
      return factory(node, deps[0]);
    case 2:
      return factory(node, deps[0], deps[1]);
    case 3:
      return factory(node, deps[0], deps[1], deps[2]);
    default:
      return factory.apply(null, [node].concat(deps));
  }
}
