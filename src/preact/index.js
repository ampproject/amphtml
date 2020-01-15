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
// TODO: hydrate, isValidElement, Component, cloneElement, toChildArray

/**
 * @param {!Preact.FunctionalComponent|string} unusedType
 * @param {(!Object|null)=} unusedProps
 * @param {...*} var_args
 * @return {!Preact.VNode}
 */
export function createElement(unusedType, unusedProps, var_args) {
  return preact.createElement.apply(undefined, arguments);
}

/**
 * @param {!Preact.VNode} vnode
 * @param {Node} container
 */
export function render(vnode, container) {
  preact.render(vnode, container, undefined);
}

/**
 * @param {!JsonObject} props
 * @return {Preact.Renderable}
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
 * @param {!Object} value
 * @return {!Preact.Context}
 */
export function createContext(value) {
  return preact.createContext(value);
}

// Defines the type interfaces for the approved Preact Hooks APIs.
// TODO: useReducer, useImperativeHandle, useMemo, useCallback, useDebugValue, useErrorBoundary

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
 * @param {Preact.Context} context
 * @return {!JsonObject}
 */
export function useContext(context) {
  return hooks.useContext(context);
}
