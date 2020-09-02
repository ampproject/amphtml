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

import {ContextNode} from './node';
import {deepScan} from './scan';
import {pushIfNotExist} from '../utils/array';
import {throttleTail} from './scheduler';

/**
 * @param {!Node} root
 * @param {!ContextProp} prop
 * @param {boolean} prescan
 * @param {function(!Node)} callback
 * @return {!UnlistenDef}
 */
export function observeInput(root, prop, prescan, callback) {
  const contextNode = ContextNode.get(root);

  const pending = [];

  const queue = throttleTail(() => {
    const copy = pending.slice(0);
    pending.length = 0;
    callback(copy);
  }, setTimeout);

  const enqueue = (node) => {
    pushIfNotExist(pending, node);
    queue();
  };

  const observer = (node, inputProp) => {
    if (inputProp.key == prop.key) {
      enqueue(node);
    }
  };

  // QQQQ: not implemented.
  // contextNode.values.addObserver(observer);

  if (prescan) {
    setTimeout(() => {
      deepScan(contextNode, (childContextNode) => {
        if (childContextNode.values.has(prop)) {
          enqueue(childContextNode.node);
        }
        return true;
      });
    });
  }

  return () => {
    contextNode.values.removeObserver(observer);
  };
}
