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

import * as hooks from /*OK*/ 'preact/hooks';
import * as preact from /*OK*/ 'preact';

// Defines the type interfaces for the approved Preact APIs.
// TODO: hydrate, isValidElement, Component

/**
 * @param {!PreactDef.FunctionalComponent|string} unusedType
 * @param {?Object=} unusedProps
 * @param {...*} var_args
 * @return {!PreactDef.VNode}
 */
export function createElement(unusedType, unusedProps, var_args) {
  return preact.createElement.apply(undefined, arguments);
}

/**
 * @param {!PreactDef.VNode} unusedElement
 * @param {?Object=} unusedProps
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!PreactDef.VNode}
 */
export function cloneElement(unusedElement, unusedProps, unusedChildren) {
  return preact.cloneElement.apply(undefined, arguments);
}

/**
 * @param {!PreactDef.VNode} vnode
 * @param {Node} container
 */
export function render(vnode, container) {
  preact.render(vnode, container, undefined);
}

/**
 * @param {?Object=} props
 * @return {PreactDef.Renderable}
 */
export function Fragment(props) {
  return preact.Fragment(props);
}

/**
 * @return {{current: (T|null)}}
 * @template T
 */
export function createRef() {
  return preact.createRef();
}

/**
 * @param {T} value
 * @return {!PreactDef.Context<T>}
 * @template T
 */
export function createContext(value) {
  return preact.createContext(value);
}

// Defines the type interfaces for the approved Preact Hooks APIs.
// TODO: useReducer, useImperativeHandle, useDebugValue, useErrorBoundary

/**
 * @param {S|function():S} initial
 * @return {{0: S, 1: function((S|function(S):S)):undefined}}
 * @template S
 */
export function useState(initial) {
  return hooks.useState(initial);
}

/**
 * @param {T|null} initial
 * @return {{current: (T|null)}}
 * @template T
 */
export function useRef(initial) {
  return hooks.useRef(initial);
}

/**
 * @param {function():(function():undefined|undefined)} effect
 * @param {!Array<*>=} opt_deps
 */
export function useEffect(effect, opt_deps) {
  hooks.useEffect(effect, opt_deps);
}

/**
 * @param {function():(function():undefined|undefined)} effect
 * @param {!Array<*>=} opt_deps
 */
export function useLayoutEffect(effect, opt_deps) {
  hooks.useLayoutEffect(effect, opt_deps);
}

/**
 * @param {PreactDef.Context<T>} context
 * @return {T}
 * @template T
 */
export function useContext(context) {
  return hooks.useContext(context);
}

/**
 * @param {function():T} cb
 * @param {!Array<*>=} opt_deps
 * @return {T}
 * @template T
 */
export function useMemo(cb, opt_deps) {
  return hooks.useMemo(cb, opt_deps);
}

/**
 * @param {function(...*):T|undefined} cb
 * @param {!Array<*>=} opt_deps
 * @return {function(...*):T|undefined}
 * @template T
 */
export function useCallback(cb, opt_deps) {
  return hooks.useCallback(cb, opt_deps);
}

/**
 * @param {{current: (T|null)}} ref
 * @param {function():T} create
 * @param {!Array<*>=} opt_deps
 * @return {undefined}
 * @template T
 */
export function useImperativeHandle(ref, create, opt_deps) {
  return hooks.useImperativeHandle(ref, create, opt_deps);
}

/**
 * @param {!PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return preact.toChildArray.apply(undefined, arguments);
}
