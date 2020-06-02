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
import {getDeps, getId} from './component-meta';
import {isArray} from '../types';

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
export function setComponent(node, func, input = undefined) {
  const id = getId(func);
  const deps = getDeps(func);
  const contextNode = ContextNode.get(node);
  contextNode.setComponent(id, componentWithInputFactory, func, deps, input);
}

/**
 * Removes the component that has been previously installed with `setComponent`.
 *
 * @param {!Node} node
 * @param {function(...?)} func
 */
export function removeComponent(node, func) {
  const id = getId(func);
  const contextNode = ContextNode.get(node);
  contextNode.removeComponent(id);
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
  deps = isArray(deps) ? /** @type {!Array<!ContextProp>} */ (deps) : [deps];
  const id = getId(callback);
  const contextNode = ContextNode.get(node);
  contextNode.setComponent(id, subscriberFactory, callback, deps, NO_INPUT);
}

/**
 * Removes the subscriber prevoiously registered with `subscribe` API.
 *
 * @param {!Node} node
 * @param {function(...?)} callback
 */
export function unsubscribe(node, callback) {
  removeComponent(node, callback);
}

/**
 * Creates an input-based comonent.
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
