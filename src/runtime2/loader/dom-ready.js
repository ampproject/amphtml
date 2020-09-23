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

import {
  CanRender,
} from '../../contextprops';
import {
  contextProp,
  removeProp,
  setProp,
  subscribe,
  unsubscribe,
  useSyncEffect,
} from '../../context';
import {hasNextNodeInDocumentOrder} from '../../dom';

/** @type {!ContextProp<?function(!Element)>} */
// eslint-disable-next-line local/no-export-side-effect
export const DomReadyProp = contextProp('DomReady', {
  recursive: true,
  defaultValue: null,
});

/**
 * @param {!Node} root
 * @param {boolean} treeReady
 */
export function DomReadyProvider(root, treeReady) {
  useSyncEffect(() => {
    if (treeReady) {
      return;
    }

    let pending = [];

    const checkPending = () => {
      for (let i = 0; i < pending.length; i++) {
        const node = pending[i];
        if (hasNextNodeInDocumentOrder(node, root)) {
          // Remove resource before build to remove it from the pending list
          // in either case the build succeed or throws an error.
          pending.splice(i--, 1);
          removeProp(node, CanRender, DomReadyProvider);
        }
      }
    };

    /**
     * @param {!Node} node
     */
    const onReady = (node) => {
      if (!pending) {
        removeProp(node, CanRender, DomReadyProvider);
      } else if (!pending.includes(node)) {
        pending.push(node);
        checkPending();
      }
    };

    setProp(root, DomReadyProp, DomReadyProvider, onReady);

    return () => {
      removeProp(root, DomReadyProp, DomReadyProvider);
      for (let i = 0; i < pending.length; i++) {
        const node = pending[i];
        removeProp(node, CanRender, DomReadyProvider);
      }
      pending = null;
    };
  }, [treeReady]);
}

/**
 * @param {!Node} node
 */
export function blockRender(node) {
  setProp(node, CanRender, DomReadyProvider, false);

  // QQQ: subcribeOnce?
  const handler = (onReady) => {
    if (onReady) {
      onReady(node);
    } else {
      removeProp(node, CanRender, DomReadyProvider);
    }
    unsubscribe(node, handler);
  };

  subscribe(node, [DomReadyProp], handler);
}
