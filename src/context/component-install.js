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

import {Component} from './component';
import {ContextNode} from './node';
import {arrayOrSingleItemToArray} from '../types';
import {getDeps, getId} from './component-meta';
import {useInternalCallbackWithComponent} from './component-hooks';

const NO_INPUT = undefined;

/**
 * Installs or updates the component specified by its function. The component
 * function can be optionally annotated with `withMetaData` to provide
 * dependencies. Some key points:
 * - The component is only called when all dependencies are satisfied.
 * - The component is only called when either an input or any dependencies
 *   change.
 * - A component can optionally return a cleanup function.
 *
 * @param {!Node} node
 * @param {function(!Node, I, ...?)} func
 * @param {I} input
 * @template I
 */
export function mountComponent(node, func, input = undefined) {
  const id = getId(func);
  const deps = getDeps(func);
  const contextNode = ContextNode.get(node);
  contextNode.mountComponent(id, componentWithInputFactory, func, deps, input);
}

/**
 * Removes the component that has been previously installed with the
 * `mountComponent`.
 *
 * @param {!Node} node
 * @param {function(...?)} func
 */
export function unmountComponent(node, func) {
  const id = getId(func);
  const contextNode = ContextNode.get(node);
  contextNode.unmountComponent(id);
}

/**
 * Subscribes to the specified dependencies. The key API points:
 * - The subscriber is only called when all its dependencies are satisfied.
 * - If all its dependencies are satisfied at the time the subscriber is added,
 *   it's called right away.
 * - The subscriber is called whenever any of its dependencies change.
 * - A subscriber can optionally return a cleanup function.
 *
 * @param {!Node} node
 * @param {!ContextProp|!Array<!ContextProp>} deps
 * @param {function(...?)} callback
 */
export function subscribe(node, deps, callback) {
  deps = arrayOrSingleItemToArray(deps);
  const id = getId(callback);
  const contextNode = ContextNode.get(node);
  contextNode.mountComponent(id, subscriberFactory, callback, deps, NO_INPUT);
}

/**
 * Removes the subscriber prevoiously registered with `subscribe` API.
 *
 * @param {!Node} node
 * @param {function(...?)} callback
 */
export function unsubscribe(node, callback) {
  unmountComponent(node, callback);
}

/**
 * This hook returns a function that can be used to set a managed component. A
 * managed component can be set on this component's node or any other in the
 * same tree. When this component is removed, all managed components are also
 * removed.
 *
 * See `mountComponent` for more info.
 *
 * @return {function(function(!Node, I, ...?), I, !Node=)}
 * @template I
 */
export function useMountComponent() {
  return useInternalCallbackWithComponent(mountManagedComponent);
}

/**
 * This hook returns a function that can be used to remove a managed component,
 * that was previously set by the `useMountComponent`.
 *
 * See `unmountComponent` for more info.
 *
 * @return {function(function(...?), !Node=)}
 */
export function useUnmountComponent() {
  return useInternalCallbackWithComponent(unmountManagedComponent);
}

/**
 * This hook returns a function that can be used to set a managed subscriber. A
 * managed subscriber can be set on this component's node or any other in the
 * same tree. When this component is removed, all managed subscribers are also
 * removed.
 *
 * See `subscribe` for more info.
 *
 * @return {function((!ContextProp|!Array<!ContextProp>), function(...?), !Node=)}
 */
export function useSubscribe() {
  return useInternalCallbackWithComponent(subscribeManaged);
}

/**
 * This hook returns a function that can be used to remove a managed subscriber,
 * that was previously set by the `useSubscribe`.
 *
 * See `unsubscribe` for more info.
 *
 * @return {function(function(...?), !Node=)}
 */
export function useUnsubscribe() {
  return useInternalCallbackWithComponent(unmountManagedComponent);
}

/**
 * @param {!Component} component
 * @param {function(!Node, I, ...?)} func
 * @param {I} input
 * @param {!Node|undefined} node
 * @template I
 */
function mountManagedComponent(component, func, input, node) {
  const id = getId(func);
  const deps = getDeps(func);
  component.mountComponent(
    id,
    componentWithInputFactory,
    func,
    deps,
    input,
    node
  );
}

/**
 * @param {!Component} component
 * @param {function(...?)} func
 * @param {!Node} node
 */
function unmountManagedComponent(component, func, node) {
  const id = getId(func);
  component.unmountComponent(id, node);
}

/**
 * @param {!Component} component
 * @param {!ContextProp|!Array<!ContextProp>} deps
 * @param {function(...?)} callback
 * @param {!Node|undefined} node
 */
function subscribeManaged(component, deps, callback, node) {
  deps = arrayOrSingleItemToArray(deps);
  const id = getId(callback);
  component.mountComponent(
    id,
    subscriberFactory,
    callback,
    deps,
    NO_INPUT,
    node
  );
}

/**
 * Creates an input-based component.
 *
 * @param {*} id
 * @param {!./node.ContextNode} contextNode
 * @param {function(!Node, ...?)} func
 * @param {!Array<!ContextProp>} deps
 * @return {!./component.Component}
 */
function componentWithInputFactory(id, contextNode, func, deps) {
  const comp = (component, input, deps) => {
    const {node} = component.contextNode;
    switch (deps.length) {
      case 0:
        return func(node, input);
      case 1:
        return func(node, input, deps[0]);
      case 2:
        return func(node, input, deps[0], deps[1]);
      case 3:
        return func(node, input, deps[0], deps[1], deps[2]);
      default:
        return func.apply(null, [node, input].concat(deps));
    }
  };
  return new Component(id, contextNode, comp, deps);
}

/**
 * Creates a subscriber.
 *
 * @param {*} id
 * @param {!./node.ContextNode} contextNode
 * @param {function(...?)} callback
 * @param {!Array<!ContextProp>} deps
 * @return {!./component.Component}
 */
function subscriberFactory(id, contextNode, callback, deps) {
  const comp = (component, unusedInput, deps) => {
    switch (deps.length) {
      case 0:
        return callback();
      case 1:
        return callback(deps[0]);
      case 2:
        return callback(deps[0], deps[1]);
      case 3:
        return callback(deps[0], deps[1], deps[2]);
      default:
        return callback.apply(null, deps);
    }
  };
  return new Component(id, contextNode, comp, deps);
}
