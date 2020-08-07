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

import {areEqualOrdered} from '../utils/array';
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
 * @param {T} initialValue
 * @return {{current: T}}
 * @template T
 */
export function useRef(initialValue = undefined) {
  return getComponent().allocRef(initialValue);
}

/**
 * @param {function(!./component.Component, ...?):?} callback
 * @return {function(...?):?}
 * @package
 */
export function useComponentCallback(callback) {
  const ref = useRef();
  if (!ref.current) {
    const component = getComponent();
    ref.current = callback.bind(null, component);
  }
  return ref.current;
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
export function useDisposableMemo(factory, deps = undefined) {
  deps = deps || EMPTY_DEPS;
  const component = getComponent();
  const ref = useRef();
  useSyncEffect(() => {
    const {value, dispose} = callFactory(
      factory,
      component.contextNode.node,
      devAssert(deps)
    );
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

  const changed = !depRef.current || !areEqualOrdered(depRef.current, deps);
  if (!changed) {
    return;
  }

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

/**
 * This hook returns a function that can be used to set a child property. A
 * child property can be set on the component's node or any other in the same
 * tree. When this component is removed, all child properties are also removed.
 *
 * See `setProp` for more info.
 *
 * @return {function(!ContextProp<T>, T, !Node=)}
 * @template T
 */
export function useSetChildProp() {
  return useComponentCallback(setChildProp);
}

/**
 * This hook returns a function that can be used to remove a child property,
 * that was previously set by the `useSetChildProp`.
 *
 * See `removeProp` for more info.
 *
 * @return {function(!ContextProp, !Node=)}
 */
export function useRemoveChildProp() {
  return useComponentCallback(removeChildProp);
}

/**
 * @param {!./component.Component} component
 * @param {!ContextProp<T>} prop
 * @param {T} value
 * @param {!Node|undefined} node
 * @template T
 */
function setChildProp(component, prop, value, node) {
  component.setProp(prop, value, node);
}

/**
 * @param {!./component.Component} component
 * @param {!ContextProp} prop
 * @param {!Node|undefined} node
 */
function removeChildProp(component, prop, node) {
  component.removeProp(prop, node);
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
