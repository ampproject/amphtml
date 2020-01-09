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

/** @externs */

/** @const */
var preact = {}

/**
 * @typedef {function(!JsonObject):(preact.VNode|null)}
 */
preact.FunctionalComponent

/**
 * @interface
 */
preact.VNode = function() {}

/**
 * @interface
 */
preact.Context = function() {}

/**
 * @param {!JsonObject} props
 * @return {preact.VNode|null}
 */
preact.Context.prototype.Provider = function(props) {};

/**
 * @interface
 */
preact.Context.prototype.Consumer = function() {};

/*
Preact:
export {
  E as render,
  H as hydrate,
  h as createElement,
  h,
  y as Fragment,
  p as createRef,
  l as isValidElement,
  d as Component,
  I as cloneElement,
  L as createContext,
  b as toChildArray,
  A as _unmount,
  n as options
};
*/

/**
 * preact.h
 * @param {!preact.FunctionalComponent|string} type
 * @param {(!Object|null)=} props
 * @param {...*} children
 * @return {!preact.VNode}
 */
var h$$module$node_modules$preact$dist$preact_module = function(type, props, ...children) {}

/**
 * preact.createElement
 * @param {!preact.FunctionalComponent|string} type
 * @param {(!Object|null)=} props
 * @param {...*} children
 * @return {!preact.VNode}
 */
var createElement$$module$node_modules$preact$dist$preact_module = function(type, props, ...children) {}

/**
 * preact.render
 * @param {!preact.VNode} vnode
 * @param {Node} container
 */
var E$$module$node_modules$preact$dist$preact_module = function(vnode, container) {}

/**
 * preact.Fragment
 */
var y$$module$node_modules$preact$dist$preact_module = preact.FunctionalComponent;

/**
 * preact.createContext
 * @param {!Object} value
 * @return {!preact.Context}
 */
var y$$module$node_modules$preact$dist$preact_module = function(value) {};

/*
Hooks:
export {
  v as useState,
  m as useReducer,
  p as useEffect,
  l as useLayoutEffect,
  d as useRef,
  s as useImperativeHandle,
  y as useMemo,
  T as useCallback,
  w as useContext,
  A as useDebugValue,
  F as useErrorBoundary
};
*/

/**
 * hooks.useRef
 * @param {*=} ref
 */
var d$$module$node_modules$preact$hooks$dist$hooks_module = function(ref) {}

/**
 * hooks.useEffect
 * @param {function():(function()|undefined)} effect
 * @param {!Array<*>=} memo
 */
var p$$module$node_modules$preact$hooks$dist$hooks_module = function(effect, memo) {}

/**
 * hooks.useLayoutEffect
 * @param {function():(function()|undefined)} effect
 * @param {!Array<*>=} memo
 */
var l$$module$node_modules$preact$hooks$dist$hooks_module = function(effect, memo) {}
