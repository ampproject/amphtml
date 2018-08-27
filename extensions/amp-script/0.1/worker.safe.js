var WorkerThread = (function (exports) {
  'use strict';

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  let count = 0;
  let transfer = [];
  const mapping = new Map();
  /**
   * Stores a node in mapping, and makes the index available on the Node directly.
   * @param node Node to store and modify with index
   * @return index Node was stored with in mapping
   */

  function store(node) {
    if (node._index_ !== undefined) {
      return node._index_;
    }

    mapping.set(node._index_ = ++count, node);
    transfer.push(node);
    return count;
  }
  /**
   * Retrieves a node based on an index.
   * @param index location in map to retrieve a Node for
   * @return either the Node represented in index position, or null if not available.
   */

  function get(index) {
    // mapping has a 1 based index, since on first store we ++count before storing.
    return !!index && mapping.get(index) || null;
  }
  /**
   * Returns nodes registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume() {
    const copy = transfer;
    transfer = [];
    return copy;
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const toLower = string => string.toLowerCase();
  const keyValueString = (key, value) => `${key}="${value}"`;

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const observers = [];
  let pendingMutations = false;

  const match = (observerTarget, target) => observerTarget !== null && target._index_ === observerTarget._index_;

  const pushMutation = (observer, record) => {
    observer.pushRecord(record);

    if (!pendingMutations) {
      pendingMutations = true;
      Promise.resolve().then(() => {
        pendingMutations = false;
        observers.forEach(observer => observer.callback(observer.takeRecords()));
      });
    }
  };
  /**
   * When DOM mutations occur, Nodes will call this method with MutationRecords
   * These records are then pushed into MutationObserver instances that match the MutationRecord.target
   * @param record MutationRecord to push into MutationObservers.
   */


  function mutate(record) {
    observers.forEach(observer => {
      if (!observer.options.subtreeFlattened || record.type === 4
      /* COMMAND */
      ) {
          pushMutation(observer, record);
          return;
        }

      let target = record.target;
      let matched = match(observer.target, target);

      if (!matched) {
        do {
          if (matched = match(observer.target, target)) {
            pushMutation(observer, record);
            break;
          }
        } while (target = target.parentNode);
      }
    });
  }
  class MutationObserver {
    constructor(callback) {
      this._records_ = [];
      this.callback = callback;
    }
    /**
     * Register the MutationObserver instance to observe a Nodes mutations.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @param target Node to observe DOM mutations
     */


    observe(target, options) {
      this.disconnect();
      this.target = target;
      this.options = Object.assign({
        subtreeFlattened: false
      }, options);
      observers.push(this);
    }
    /**
     * Stop the MutationObserver instance from observing a Nodes mutations.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     */


    disconnect() {
      this.target = null;
      const index = observers.indexOf(this);

      if (index >= 0) {
        observers.splice(index, 1);
      }
    }
    /**
     * Empties the MutationObserver instance's record queue and returns what was in there.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @return Mutation Records stored on this MutationObserver instance.
     */


    takeRecords() {
      return this._records_.splice(0, this._records_.length);
    }
    /**
     * NOTE: This method doesn't exist on native MutationObserver.
     * @param record MutationRecord to store for this instance.
     */


    pushRecord(record) {
      this._records_.push(record);
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  let count$1 = 0;
  let transfer$1 = [];
  const mapping$1 = new Map();
  /**
   * Stores a string in mapping and returns the index of the location.
   * @param value string to store
   * @return location in map
   */

  function store$1(value) {
    if (mapping$1.has(value)) {
      // Safe to cast since we verified the mapping contains the value
      return mapping$1.get(value);
    }

    mapping$1.set(value, ++count$1);
    transfer$1.push(value);
    return count$1;
  }
  /**
   * Returns strings registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume$1() {
    const strings = transfer$1;
    transfer$1 = [];
    return strings;
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  let globalDocument = null;
  /**
   * Propagates a property change for a Node to itself and all childNodes.
   * @param node Node to start applying change to
   * @param property Property to modify
   * @param value New value to apply
   */

  const propagate = (node, property, value) => {
    node[property] = value;
    node.childNodes.forEach(child => propagate(child, property, value));
  }; // https://developer.mozilla.org/en-US/docs/Web/API/Node
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  //
  // Please note, in this implmentation Node doesn't extend EventTarget.
  // This is intentional to reduce the number of classes.


  class Node {
    constructor(nodeType, nodeName) {
      this.childNodes = [];
      this.parentNode = null;
      this.isConnected = false;
      this._handlers_ = {};
      this.nodeType = nodeType;
      this.nodeName = nodeName; // The first Node created is the global document.

      if (globalDocument === null) {
        globalDocument = this;
      }

      this.ownerDocument = globalDocument;
      this._index_ = store(this);
    } // Unimplemented Properties
    // Node.baseURI – https://developer.mozilla.org/en-US/docs/Web/API/Node/baseURI
    // Unimplemented Methods
    // Node.compareDocumentPosition() – https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    // Node.getRootNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
    // Node.isDefaultNamespace() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isDefaultNamespace
    // Node.isEqualNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
    // Node.isSameNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isSameNode
    // Node.lookupPrefix() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupPrefix
    // Node.lookupNamespaceURI() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupNamespaceURI
    // Node.normalize() – https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize
    // Implemented at Element/Text layer
    // Node.nodeValue – https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
    // Node.cloneNode – https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode

    /**
     * Getter returning the text representation of Element.childNodes.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * @return text from all childNodes.
     */


    get textContent() {
      let textContent = '';
      const childNodes = this.childNodes;

      if (childNodes.length) {
        childNodes.forEach(childNode => textContent += childNode.textContent);
        return textContent;
      }

      return '';
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
     * @return Node's first child in the tree, or null if the node has no children.
     */


    get firstChild() {
      return this.childNodes.length > 0 ? this.childNodes[0] : null;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild
     * @return The last child of a node, or null if there are no child elements.
     */


    get lastChild() {
      return this.childNodes.length > 0 ? this.childNodes[this.childNodes.length - 1] : null;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
     * @return node immediately following the specified one in it's parent's childNodes, or null if one doesn't exist.
     */


    get nextSibling() {
      if (this.parentNode === null) {
        return null;
      }

      const parentChildNodes = this.parentNode.childNodes;
      return parentChildNodes[parentChildNodes.indexOf(this) + 1] || null;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling
     * @return node immediately preceding the specified one in its parent's childNodes, or null if the specified node is the first in that list.
     */


    get previousSibling() {
      if (this.parentNode === null) {
        return null;
      }

      const parentChildNodes = this.parentNode.childNodes;
      return parentChildNodes[parentChildNodes.indexOf(this) - 1] || null;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/hasChildNodes
     * @return boolean if the Node has childNodes.
     */


    hasChildNodes() {
      return this.childNodes.length > 0;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
     * @param otherNode
     * @return whether a Node is a descendant of a given Node
     */


    contains(otherNode) {
      if (this.childNodes.length > 0) {
        if (this.childNodes.includes(this)) {
          return true;
        }

        return this.childNodes.some(child => child.contains(otherNode));
      }

      return otherNode === this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
     * @param child
     * @param referenceNode
     * @return child after it has been inserted.
     */


    insertBefore(child, referenceNode) {
      if (child === null) {
        return null;
      }

      if (child === this) {
        // The new child cannot contain the parent.
        return child;
      }

      if (referenceNode == null) {
        // When a referenceNode is not valid, appendChild(child).
        this.appendChild(child);
        mutate({
          addedNodes: [child],
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      if (this.childNodes.indexOf(referenceNode) >= 0) {
        // Should only insertBefore direct children of this Node.
        child.remove(); // Removing a child can cause this.childNodes to change, meaning we need to splice from its updated location.

        this.childNodes.splice(this.childNodes.indexOf(referenceNode), 0, child);
        child.parentNode = this;
        propagate(child, 'isConnected', this.isConnected);
        mutate({
          addedNodes: [child],
          nextSibling: referenceNode,
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      return null;
    }
    /**
     * Adds the specified childNode argument as the last child to the current node.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
     * @param child Child Node to append to this Node.
     */


    appendChild(child) {
      child.remove();
      child.parentNode = this;
      propagate(child, 'isConnected', this.isConnected);
      this.childNodes.push(child);
      mutate({
        addedNodes: [child],
        previousSibling: this.childNodes[this.childNodes.length - 2],
        type: 2
        /* CHILD_LIST */
        ,
        target: this
      });
    }
    /**
     * Removes a child node from the current element.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
     * @param child Child Node to remove from this Node.
     * @return Node removed from the tree or null if the node wasn't attached to this tree.
     */


    removeChild(child) {
      const index = this.childNodes.indexOf(child);
      const exists = index >= 0;

      if (exists) {
        child.parentNode = null;
        propagate(child, 'isConnected', false);
        this.childNodes.splice(index, 1);
        mutate({
          removedNodes: [child],
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      return null;
    } // TODO(KB): Verify behaviour.

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild
     * @param newChild new Node to replace old Node.
     * @param oldChild existing Node to be replaced.
     * @return child that was replaced.
     */


    replaceChild(newChild, oldChild) {
      if (newChild !== oldChild) {
        const index = this.childNodes.indexOf(oldChild);

        if (index >= 0) {
          oldChild.parentNode = null;
          propagate(oldChild, 'isConnected', false);
          this.childNodes.splice(index, 1, newChild);
          mutate({
            addedNodes: [newChild],
            removedNodes: [oldChild],
            type: 2
            /* CHILD_LIST */
            ,
            target: this
          });
        }
      }

      return oldChild;
    }
    /**
     * Removes this Node from the tree it belogs too.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
     */


    remove() {
      this.parentNode && this.parentNode.removeChild(this);
    }
    /**
     * Add an event listener to callback when a specific event type is dispatched.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @param type Event Type (i.e 'click')
     * @param handler Function called when event is dispatched.
     */


    addEventListener(type, handler) {
      const handlers = this._handlers_[toLower(type)];

      let index = 0;

      if (handlers && handlers.length > 0) {
        index = handlers.push(handler);
      } else {
        this._handlers_[toLower(type)] = [handler];
      }

      mutate({
        target: this,
        type: 4
        /* COMMAND */
        ,
        addedEvents: [{
          [9
          /* type */
          ]: store$1(type),
          [7
          /* _index_ */
          ]: this._index_,
          [33
          /* index */
          ]: index
        }]
      });
    }
    /**
     * Remove a registered event listener for a specific event type.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
     * @param type Event Type (i.e 'click')
     * @param handler Function to stop calling when event is dispatched.
     */


    removeEventListener(type, handler) {
      const handlers = this._handlers_[toLower(type)];

      const index = !!handlers ? handlers.indexOf(handler) : -1;

      if (index >= 0) {
        handlers.splice(index, 1);
        mutate({
          target: this,
          type: 4
          /* COMMAND */
          ,
          removedEvents: [{
            [9
            /* type */
            ]: store$1(type),
            [7
            /* _index_ */
            ]: this._index_,
            [33
            /* index */
            ]: index
          }]
        });
      }
    }
    /**
     * Dispatch an event for this Node.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
     * @param event Event to dispatch to this node and potentially cascade to parents.
     */


    dispatchEvent(event) {
      let target = event.currentTarget = this;
      let handlers;
      let iterator;

      do {
        handlers = target && target._handlers_ && target._handlers_[toLower(event.type)];

        if (handlers) {
          for (iterator = handlers.length; iterator--;) {
            if ((handlers[iterator].call(target, event) === false || event._end) && event.cancelable) {
              break;
            }
          }
        }
      } while (event.bubbles && !(event.cancelable && event._stop) && (target = target && target.parentNode));

      return !event.defaultPrevented;
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class DOMTokenList {
    /**
     * The DOMTokenList interface represents a set of space-separated tokens.
     * It is indexed beginning with 0 as with JavaScript Array objects and is case-sensitive.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
     * @param defineOn Element or class extension to define getter/setter pair for token list access.
     * @param element Specific Element instance to modify when value is changed.
     * @param attributeName Name of the attribute used by Element to access DOMTokenList.
     * @param accessorKey Key used to access DOMTokenList directly from specific element.
     * @param propertyName Key used to access DOMTokenList as string getter/setter.
     */
    constructor(defineOn, element, attributeName, accessorKey, propertyName) {
      this.array_ = [];
      this.element_ = element;
      this.attributeName_ = attributeName;
      this.storeAttributeMethod_ = element.storeAttributeNS_.bind(element);
      element.propertyBackedAttributes_[attributeName] = [() => this.value, value => this.value = value];

      if (accessorKey && propertyName) {
        Object.defineProperty(defineOn.prototype, propertyName, {
          enumerable: true,
          configurable: true,

          get() {
            return this[accessorKey].value;
          },

          set(value) {
            this[accessorKey].value = value;
          }

        });
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
     * @return string representation of tokens (space delimitted).
     */


    get value() {
      return this.array_.join(' ');
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/length
     * @return integer representing the number of objects stored in the object.
     */


    get length() {
      return this.array_.length;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
     * @param collection String of values space delimited to replace the current DOMTokenList with.
     */


    set value(collection) {
      const oldValue = this.value;
      const newValue = collection.trim(); // Replace current tokens with new tokens.

      this.array_.splice(0, this.array_.length, ...(newValue !== '' ? newValue.split(/\s+/) : ''));
      this.mutationCompleteHandler_(oldValue, newValue);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/item
     * @param index number from DOMTokenList entities to retrieve value of
     * @return value stored at the index requested, or undefined if beyond known range.
     */


    item(index) {
      return this.array_[index];
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains
     * @param token value the DOMTokenList is tested for.
     * @return boolean indicating if the token is contained by the DOMTokenList.
     */


    contains(token) {
      return this.array_.includes(token);
    }
    /**
     * Add a token or tokens to the list.
     * Note: All duplicates are removed, and the first token's position with the value is preserved.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add
     * @param tokens each token is a string to add to a TokenList.
     */


    add(...tokens) {
      const oldValue = this.value;
      this.array_.splice(0, this.array_.length, ...new Set(this.array_.concat(tokens)));
      this.mutationCompleteHandler_(oldValue, this.value);
    }
    /**
     * Remove a token or tokens from the list.
     * Note: All duplicates are removed, and the first token's position with the value is preserved.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove
     * @param tokens each token is a string to remove from a TokenList.
     */


    remove(...tokens) {
      const oldValue = this.value;
      this.array_.splice(0, this.array_.length, ...new Set(this.array_.filter(token => !tokens.includes(token))));
      this.mutationCompleteHandler_(oldValue, this.value);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace
     * @param token
     * @param newToken
     */


    replace(token, newToken) {
      if (!this.array_.includes(token)) {
        return;
      }

      const oldValue = this.value;
      const set = new Set(this.array_);

      if (token !== newToken) {
        set.delete(token);

        if (newToken !== '') {
          set.add(newToken);
        }
      }

      this.array_.splice(0, this.array_.length, ...set);
      this.mutationCompleteHandler_(oldValue, this.value);
    }
    /**
     * Adds or removes a token based on its presence in the token list.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
     * @param token string to add or remove from the token list
     * @param force changes toggle into a one way-only operation. true => token added. false => token removed.
     * @return true if the token is in the list following mutation, false if not.
     */


    toggle(token, force) {
      if (!this.array_.includes(token)) {
        if (force !== false) {
          // Note, this will add the token if force is undefined (not passed into the method), or true.
          this.add(token);
        }

        return true;
      } else if (force !== true) {
        // Note, this will remove the token if force is undefined (not passed into the method), or false.
        this.remove(token);
        return false;
      }

      return true;
    }
    /**
     * Report tokenList mutations to MutationObserver.
     * @param oldValue value before mutation
     * @param value value after mutation
     * @private
     */


    mutationCompleteHandler_(oldValue, value) {
      this.storeAttributeMethod_(null, this.attributeName_, value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this.element_,
        attributeName: this.attributeName_,
        value,
        oldValue
      });
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const toString = attributes => attributes.map(({
    name,
    value
  }) => keyValueString(name, value)).join(' ');
  const matchPredicate = (namespaceURI, name) => attr => attr.namespaceURI === namespaceURI && attr.name === name;

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  class CharacterData extends Node {
    constructor(data, nodeType, nodeName) {
      super(nodeType, nodeName);
      this._data_ = data;
    } // Unimplemented Methods
    // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
    // NonDocumentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
    // CharacterData.appendData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/appendData
    // CharacterData.deleteData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/deleteData
    // CharacterData.insertData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/insertData
    // CharacterData.replaceData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/replaceData
    // CharacterData.substringData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/substringData

    /**
     * @return Returns the string contained in private CharacterData.data
     */


    get data() {
      return this._data_;
    }
    /**
     * @param value string value to store as CharacterData.data.
     */


    set data(value) {
      const oldValue = this.data;
      this._data_ = value;
      mutate({
        target: this,
        type: 1
        /* CHARACTER_DATA */
        ,
        value,
        oldValue
      });
    }
    /**
     * @return Returns the size of the string contained in CharacterData.data
     */


    get length() {
      return this._data_.length;
    }
    /**
     * @return Returns the string contained in CharacterData.data
     */


    get nodeValue() {
      return this._data_;
    }
    /**
     * @param value string value to store as CharacterData.data.
     */


    set nodeValue(value) {
      this.data = value;
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  class Text extends CharacterData {
    constructor(data) {
      super(data, 3
      /* TEXT_NODE */
      , '#text');
      this._transferredFormat_ = {
        [7
        /* _index_ */
        ]: this._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      };
      this._creationFormat_ = {
        [7
        /* _index_ */
        ]: this._index_,
        [8
        /* transferred */
        ]: 0
        /* FALSE */
        ,
        [0
        /* nodeType */
        ]: 3
        /* TEXT_NODE */
        ,
        [1
        /* nodeName */
        ]: store$1('#text'),
        [5
        /* textContent */
        ]: store$1(this.data)
      };
    } // Unimplemented Properties
    // Text.isElementContentWhitespace – https://developer.mozilla.org/en-US/docs/Web/API/Text/isElementContentWhitespace
    // Text.wholeText – https://developer.mozilla.org/en-US/docs/Web/API/Text/wholeText
    // Text.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Text/assignedSlot


    hydrate() {
      return this._creationFormat_;
    }
    /**
     * textContent getter, retrieves underlying CharacterData data.
     * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
     */


    get textContent() {
      return this.data;
    }
    /**
     * textContent setter, mutates underlying CharacterData data.
     * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
     * @param value new value
     */


    set textContent(value) {
      // Mutation Observation is performed by CharacterData.
      this.nodeValue = value;
    }
    /**
     * Breaks Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
     * @param offset number position to split text at.
     * @return Text Node after the offset.
     */


    splitText(offset) {
      const remainderTextNode = new Text(this.data.slice(offset, this.data.length));
      const parentNode = this.parentNode;
      this.nodeValue = this.data.slice(0, offset);

      if (parentNode !== null) {
        // When this node is attached to the DOM, the remainder text needs to be inserted directly after.
        const parentChildNodes = parentNode.childNodes;
        const insertBeforePosition = parentChildNodes.indexOf(this) + 1;
        const insertBeforeNode = parentChildNodes.length >= insertBeforePosition ? parentChildNodes[insertBeforePosition] : null;
        return parentNode.insertBefore(remainderTextNode, insertBeforeNode);
      }

      return remainderTextNode;
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  const hyphenateKey = key => toLower(key.replace(/(webkit|ms|moz|khtml)/g, '-$1').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-'));

  const appendKeys = keys => {
    const keysToAppend = keys.filter(key => !CSSStyleDeclaration.prototype.hasOwnProperty(key));

    if (keysToAppend.length <= 0) {
      return;
    }

    const previousPrototypeLength = CSSStyleDeclaration.prototype.length || 0;

    if (previousPrototypeLength !== 0) {
      CSSStyleDeclaration.prototype.length = previousPrototypeLength + keysToAppend.length;
    } else {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'length', {
        configurable: true,
        writable: true,
        value: keysToAppend.length
      });
    }

    keysToAppend.forEach((key, index) => {
      const hyphenatedKey = hyphenateKey(key);
      CSSStyleDeclaration.prototype[index + previousPrototypeLength] = hyphenatedKey;
      Object.defineProperties(CSSStyleDeclaration.prototype, {
        [key]: {
          get() {
            return this.getPropertyValue(hyphenatedKey);
          },

          set(value) {
            this.setProperty(hyphenatedKey, value);
          }

        }
      });
    });
  };
  class CSSStyleDeclaration {
    constructor(element) {
      this.properties_ = {};
      this.storeAttributeMethod_ = element.storeAttributeNS_.bind(element);
      this.element_ = element;

      if (element && element.propertyBackedAttributes_) {
        element.propertyBackedAttributes_.style = [() => this.cssText, value => this.cssText = value];
      }
    }
    /**
     * Retrieve the value for a given property key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue
     * @param key the name of the property to retrieve the value for.
     * @return value stored for the provided key.
     */


    getPropertyValue(key) {
      return this.properties_[key] || '';
    }
    /**
     * Remove a value for a given property key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty
     * @param key the name of the property to retrieve the value for.
     * @return previously stored value for the provided key.
     */


    removeProperty(key) {
      const oldValue = this.getPropertyValue(key);
      this.properties_[key] = null;
      this.mutationCompleteHandler_(this.cssText);
      return oldValue;
    }
    /**
     * Stores a given value for the provided key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty
     * @param key modify this key
     * @param value store this value
     */


    setProperty(key, value) {
      this.properties_[key] = value;
      this.mutationCompleteHandler_(this.cssText);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
     * @return css text string representing known and valid style declarations.
     */


    get cssText() {
      let value;
      let returnValue = '';

      for (let key in this.properties_) {
        if ((value = this.getPropertyValue(key)) !== '') {
          returnValue += `${key}: ${value}; `;
        }
      }

      return returnValue.trim();
    }
    /**
     * Replace all style declarations with new values parsed from a cssText string.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
     * @param value css text string to parse and store
     */


    set cssText(value) {
      this.properties_ = {};
      const values = value.split(/[:;]/);
      const length = values.length;

      for (let index = 0; index + 1 < length; index += 2) {
        this.properties_[toLower(values[index].trim())] = values[index + 1].trim();
      }

      this.mutationCompleteHandler_(this.cssText);
    }
    /**
     * Report CSSStyleDeclaration mutations to MutationObserver.
     * @param value value after mutation
     * @private
     */


    mutationCompleteHandler_(value) {
      const oldValue = this.storeAttributeMethod_(null, 'style', value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this.element_,
        attributeName: 'style',
        value,
        oldValue
      });
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  // To future authors: It would be great if we could enforce that elements are not modified by a ConditionPredicate.
  const tagNameConditionPredicate = tagNames => element => tagNames.includes(element.tagName);
  const matchChildrenElements = (element, conditionPredicate) => {
    const matchingElements = [];
    element.children.forEach(child => {
      if (conditionPredicate(child)) {
        matchingElements.push(child);
      }

      matchingElements.push(...matchChildrenElements(child, conditionPredicate));
    });
    return matchingElements;
  };
  const matchChildElement = (element, conditionPredicate) => {
    let returnValue = null;
    element.children.some(child => {
      if (conditionPredicate(child)) {
        returnValue = child;
        return true;
      }

      const grandChildMatch = matchChildElement(child, conditionPredicate);

      if (grandChildMatch !== null) {
        returnValue = grandChildMatch;
        return true;
      }

      return false;
    });
    return returnValue;
  };
  const matchNearestParent = (element, conditionPredicate) => {
    while (element = element.parentNode) {
      if (conditionPredicate(element)) {
        return element;
      }
    }

    return null;
  };

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const reflectProperties = (properties, defineOn) => {
    properties.forEach(pair => {
      for (let key in pair) {
        const defaultValue = pair[key][0];
        const propertyIsNumber = typeof defaultValue === 'number';
        const propertyIsBoolean = typeof defaultValue === 'boolean';
        const attributeKey = pair[key][1] || toLower(key);
        Object.defineProperty(defineOn.prototype, key, {
          enumerable: true,

          get() {
            const storedAttribute = this.getAttribute(attributeKey);

            if (propertyIsBoolean) {
              return storedAttribute !== null ? storedAttribute === 'true' : defaultValue;
            }

            const castableValue = storedAttribute || defaultValue;
            return propertyIsNumber ? Number(castableValue) : String(castableValue);
          },

          set(value) {
            this.setAttribute(attributeKey, String(value));
          }

        });
      }
    });
  };

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  const isElementPredicate = node => node.nodeType === 1
  /* ELEMENT_NODE */
  ;

  const NODE_NAME_MAPPING = {};
  function registerSubclass(nodeName, subclass) {
    NODE_NAME_MAPPING[nodeName] = subclass;
  }
  class Element extends Node {
    constructor(nodeType, nodeName, namespaceURI) {
      super(nodeType, nodeName);
      this.attributes = [];
      this.propertyBackedAttributes_ = {};
      this.classList = new DOMTokenList(Element, this, 'class', 'classList', 'className');
      this.style = new CSSStyleDeclaration(this);
      this.namespaceURI = namespaceURI;
      this._transferredFormat_ = {
        [7
        /* _index_ */
        ]: this._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      };
      this._creationFormat_ = {
        [7
        /* _index_ */
        ]: this._index_,
        [8
        /* transferred */
        ]: 0
        /* FALSE */
        ,
        [0
        /* nodeType */
        ]: this.nodeType,
        [1
        /* nodeName */
        ]: store$1(this.nodeName),
        [6
        /* namespaceURI */
        ]: this.namespaceURI === null ? undefined : store$1(this.namespaceURI)
      };
    }
    /**
     * When hydrating the tree, we need to send HydrateableNode representations
     * for the main thread to process and store items from for future modifications.
     */


    hydrate() {
      return Object.assign({}, this._creationFormat_, this.childNodes.length > 0 ? {
        [4
        /* childNodes */
        ]: this.childNodes.map(node => node.hydrate())
      } : {}, this.attributes.length > 0 ? {
        [2
        /* attributes */
        ]: this.attributes.map(attribute => [store$1(attribute.namespaceURI || 'null'), store$1(attribute.name), store$1(attribute.value)])
      } : {});
    } // Unimplemented properties
    // Element.clientHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
    // Element.clientLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
    // Element.clientTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
    // Element.clientWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
    // Element.querySelector – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
    // Element.querySelectorAll – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    // set Element.innerHTML – https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
    // Element.localName – https://developer.mozilla.org/en-US/docs/Web/API/Element/localName
    // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
    // Element.prefix – https://developer.mozilla.org/en-US/docs/Web/API/Element/prefix
    // NonDocummentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
    // Element.scrollHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
    // Element.scrollLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
    // Element.scrollLeftMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
    // Element.scrollTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
    // Element.scrollTopMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
    // Element.scrollWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
    // Element.shadowRoot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot
    // Element.slot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/slot
    // Element.tabStop – https://developer.mozilla.org/en-US/docs/Web/API/Element/tabStop
    // Element.undoManager – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoManager
    // Element.undoScope – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoScope
    // Unimplemented Methods
    // Element.attachShadow() – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
    // Element.animate() – https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
    // Element.closest() – https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    // Element.getAttributeNames() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
    // Element.getBoundingClientRect() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    // Element.getClientRects() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
    // Element.getElementsByTagNameNS() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagNameNS
    // Element.insertAdjacentElement() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
    // Element.insertAdjacentHTML() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
    // Element.insertAdjacentText() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentText
    // Element.matches() – https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
    // Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
    // Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    // Element.releasePointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/releasePointerCapture
    // Element.requestFullscreen() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
    // Element.requestPointerLock() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock
    // Element.scrollIntoView() – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    // Element.setCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
    // Element.setPointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // Mixins not implemented
    // Slotable.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Slotable/assignedSlot

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
     * @return string representation of serialized HTML describing the Element and its descendants.
     */


    get outerHTML() {
      return `<${[this.nodeName, toString(this.attributes)].join(' ').trim()}>${this.innerHTML}</${this.nodeName}>`;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
     * @return string representation of serialized HTML describing the Element's descendants.
     */


    get innerHTML() {
      const childNodes = this.childNodes;

      if (childNodes.length) {
        return childNodes.map(child => child.nodeType === 1
        /* ELEMENT_NODE */
        ? child.outerHTML : child.textContent).join('');
      }

      return '';
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * @param text new text replacing all childNodes content.
     */


    set textContent(text) {
      // TODO(KB): Investigate removing all children in a single .splice to childNodes.
      this.childNodes.forEach(childNode => childNode.remove());
      this.appendChild(new Text(text));
    }
    /**
     * Getter returning the text representation of Element.childNodes.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * @return text from all childNodes.
     */


    get textContent() {
      return super.textContent;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
     * @return string tag name (i.e 'div')
     */


    get tagName() {
      return this.nodeName;
    }
    /**
     * Getter returning children of an Element that are Elements themselves.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
     * @return Element objects that are children of this ParentNode, omitting all of its non-element nodes.
     */


    get children() {
      return this.childNodes.filter(isElementPredicate);
    }
    /**
     * Getter returning the number of child elements of a Element.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/childElementCount
     * @return number of child elements of the given Element.
     */


    get childElementCount() {
      return this.children.length;
    }
    /**
     * Getter returning the first Element in Element.childNodes.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/firstElementChild
     * @return first childNode that is also an element.
     */


    get firstElementChild() {
      return this.childNodes.find(isElementPredicate) || null;
    }
    /**
     * Getter returning the last Element in Element.childNodes.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/lastElementChild
     * @return first childNode that is also an element.
     */


    get lastElementChild() {
      const children = this.children;
      return children[children.length - 1] || null;
    }
    /**
     * Sets the value of an attribute on this element using a null namespace.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
     * @param name attribute name
     * @param value attribute value
     */


    setAttribute(name, value) {
      this.setAttributeNS(null, name, value);
    }
    /**
     * Get the value of an attribute on this Element with the null namespace.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
     * @param name attribute name
     * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
     */


    getAttribute(name) {
      return this.getAttributeNS(null, name);
    }
    /**
     * Remove an attribute from this element in the null namespace.
     *
     * Method returns void, so it is not chainable.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
     * @param name attribute name
     */


    removeAttribute(name) {
      this.removeAttributeNS(null, name);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute
     * @param name attribute name
     * @return Boolean indicating if the element has the specified attribute.
     */


    hasAttribute(name) {
      return this.hasAttributeNS(null, name);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes
     * @return Boolean indicating if the element has any attributes.
     */


    hasAttributes() {
      return this.attributes.length > 0;
    }
    /**
     * Sets the value of an attribute on this Element with the provided namespace.
     *
     * If the attribute already exists, the value is updated; otherwise a new attribute is added with the specified name and value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttributeNS
     * @param namespaceURI
     * @param name attribute name
     * @param value attribute value
     */


    setAttributeNS(namespaceURI, name, value) {
      if (this.propertyBackedAttributes_[name] !== undefined) {
        if (!this.attributes.find(matchPredicate(namespaceURI, name))) {
          this.attributes.push({
            namespaceURI,
            name,
            value
          });
        }

        this.propertyBackedAttributes_[name][1](value);
        return;
      }

      const oldValue = this.storeAttributeNS_(namespaceURI, name, value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this,
        attributeName: name,
        attributeNamespace: namespaceURI,
        value,
        oldValue
      });
    }

    storeAttributeNS_(namespaceURI, name, value) {
      const attr = this.attributes.find(matchPredicate(namespaceURI, name));
      const oldValue = attr && attr.value || '';

      if (attr) {
        attr.value = value;
      } else {
        this.attributes.push({
          namespaceURI,
          name,
          value
        });
      }

      return oldValue;
    }
    /**
     * Get the value of an attribute on this Element with the specified namespace.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS
     * @param namespaceURI attribute namespace
     * @param name attribute name
     * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
     */


    getAttributeNS(namespaceURI, name) {
      const attr = this.attributes.find(matchPredicate(namespaceURI, name));

      if (attr) {
        return this.propertyBackedAttributes_[name] !== undefined ? this.propertyBackedAttributes_[name][0]() : attr.value;
      }

      return null;
    }
    /**
     * Remove an attribute from this element in the specified namespace.
     *
     * Method returns void, so it is not chainable.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
     * @param namespaceURI attribute namespace
     * @param name attribute name
     */


    removeAttributeNS(namespaceURI, name) {
      const index = this.attributes.findIndex(matchPredicate(namespaceURI, name));

      if (index >= 0) {
        const oldValue = this.attributes[index].value;
        this.attributes.splice(index, 1);
        mutate({
          type: 0
          /* ATTRIBUTES */
          ,
          target: this,
          attributeName: name,
          attributeNamespace: namespaceURI,
          oldValue
        });
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributeNS
     * @param namespaceURI attribute namespace
     * @param name attribute name
     * @return Boolean indicating if the element has the specified attribute.
     */


    hasAttributeNS(namespaceURI, name) {
      return this.attributes.some(matchPredicate(namespaceURI, name));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
     * @param names contains one more more classnames to match on. Multiples are space seperated, indicating an AND operation.
     * @return Element array with matching classnames
     */


    getElementsByClassName(names) {
      const inputClassList = names.split(' '); // TODO(KB) – Compare performance of [].some(value => DOMTokenList.contains(value)) and regex.
      // const classRegex = new RegExp(classNames.split(' ').map(name => `(?=.*${name})`).join(''));

      return matchChildrenElements(this, element => inputClassList.some(inputClassName => element.classList.contains(inputClassName)));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
     * @param tagName the qualified name to look for. The special string "*" represents all elements.
     * @return Element array with matching tagnames
     */


    getElementsByTagName(tagName) {
      return matchChildrenElements(this, tagName === '*' ? _ => true : element => element.tagName === tagName);
    }

  }
  reflectProperties([{
    id: ['']
  }], Element);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLElement extends Element {
    /**
     * Find the nearest parent form element.
     * Implemented in HTMLElement since so many extensions of HTMLElement repeat this functionality. This is not to spec.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
     * @return nearest parent form element.
     */
    get form() {
      return matchNearestParent(this, tagNameConditionPredicate(['form']));
    }

  } // Reflected properties
  // HTMLElement.accessKey => string, reflected attribute
  // HTMLElement.contentEditable => string, reflected attribute
  // HTMLElement.dir => string, reflected attribute
  // HTMLElement.lang => string, reflected attribute
  // HTMLElement.title => string, reflected attribute
  // HTMLElement.draggable => boolean, reflected attribute
  // HTMLElement.hidden => boolean, reflected attribute
  // HTMLElement.noModule => boolean, reflected attribute
  // HTMLElement.spellcheck => boolean, reflected attribute
  // HTMLElement.translate => boolean, reflected attribute

  reflectProperties([{
    accessKey: ['']
  }, {
    contentEditable: ['inherit']
  }, {
    dir: ['']
  }, {
    lang: ['']
  }, {
    title: ['']
  }, {
    draggable: [false]
  }, {
    hidden: [false]
  }, {
    noModule: [false]
  }, {
    spellcheck: [true]
  }, {
    translate: [true]
  }], HTMLElement); // Properties
  // HTMLElement.accessKeyLabel => string, readonly value of "accessKey"
  // HTMLElement.isContentEditable => boolean, readonly value of contentEditable
  // HTMLElement.nonce => string, NOT REFLECTED
  // HTMLElement.tabIndex => number, reflected attribute
  // Layout Properties (TBD)
  // HTMLElement.offsetHeight => double, readonly
  // HTMLElement.offsetLeft => double, readonly
  // HTMLElement.offsetParent => Element
  // HTMLElement.offsetTop => double, readonly
  // HTMLElement.offsetWidth => double, readonly
  // Unimplemented Properties
  // HTMLElement.contextMenu => HTMLElement
  // HTMLElement.dataset => Map<string (get/set), string>
  // HTMLElement.dropzone => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.inert => boolean, reflected
  // HTMLElement.itemScope => boolean
  // HTMLElement.itemType => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemId => string
  // HTMLElement.itemRef => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemProp => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemValue => object
  // HTMLElement.properties => HTMLPropertiesCollection, readonly

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLAnchorElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this.relList = new DOMTokenList(HTMLAnchorElement, this, 'rel', 'relList', 'rel');
    }
    /**
     * Returns the href property/attribute value
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/toString
     * @return string href attached to HTMLAnchorElement
     */


    toString() {
      return this.href;
    }
    /**
     * A Synonym for the Node.textContent property getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     * @return value of text node direct child of this Element.
     */


    get text() {
      return this.textContent;
    }
    /**
     * A Synonym for the Node.textContent property setter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     * @param text replacement for all current childNodes.
     */


    set text(text) {
      this.textContent = text;
    }

  }
  registerSubclass('a', HTMLAnchorElement); // Reflected properties, strings.
  // HTMLAnchorElement.href => string, reflected attribute
  // HTMLAnchorElement.hreflang => string, reflected attribute
  // HTMLAnchorElement.media => string, reflected attribute
  // HTMLAnchorElement.target => string, reflected attribute
  // HTMLAnchorElement.type => string, reflected attribute

  reflectProperties([{
    href: ['']
  }, {
    hreflang: ['']
  }, {
    media: ['']
  }, {
    target: ['']
  }, {
    type: ['']
  }], HTMLAnchorElement); // Unimplemented
  // HTMLAnchorElement.download => string, reflected attribute
  // HTMLAnchorElement.type => Is a DOMString that reflects the type HTML attribute, indicating the MIME type of the linked resource.
  // Unimplemented URL parse of href attribute due to IE11 compatibility and low usage.
  // Note: Implementation doable using a private url property

  /*
    class {
      private url: URL | null = null;

      constructor(...) {
        // Element.getAttribute('href') => Element.href.
        Object.assign(this.propertyBackedAttributes_, {
          href: this.href,
        });
      }

      get href(): string {
        return this.url ? this.url.href : '';
      }
      set href(url: string) {
        this.url = new URL(url);
        this.setAttribute('href', this.url.href);
      }
    }
  */
  // HTMLAnchorElement.host => string
  // HTMLAnchorElement.hostname => string
  // HTMLAnchorElement.protocol => string
  // HTMLAnchorElement.pathname => string
  // HTMLAnchorElement.search => string
  // HTMLAnchorElement.hash => string
  // HTMLAnchorElement.username => string
  // HTMLAnchorElement.password => string
  // HTMLAnchorElement.origin => string, readonly (getter no setter)

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLButtonElement extends HTMLElement {}
  registerSubclass('button', HTMLButtonElement); // Reflected properties, strings.
  // HTMLButtonElement.formAction => string, reflected attribute
  // HTMLButtonElement.formEnctype => string, reflected attribute
  // HTMLButtonElement.formMethod => string, reflected attribute
  // HTMLButtonElement.formTarget => string, reflected attribute
  // HTMLButtonElement.name => string, reflected attribute
  // HTMLButtonElement.type => string, reflected attribute (default submit)
  // HTMLButtonElement.value => string, reflected attribute
  // HTMLButtonElement.autofocus => boolean, reflected attribute
  // HTMLButtonElement.disabled => boolean, reflected attribute

  reflectProperties([{
    formAction: ['']
  }, {
    formEnctype: ['']
  }, {
    formMethod: ['']
  }, {
    formTarget: ['']
  }, {
    name: ['']
  }, {
    type: ['submit']
  }, {
    value: ['']
  }, {
    autofocus: [false]
  }, {
    disabled: [false]
  }], HTMLButtonElement); // Not reflected
  // HTMLButtonElement.formNoValidate => boolean
  // HTMLButtonElement.validity => ValidityState, readonly
  // Unimplemented
  // HTMLButtonElement.form => HTMLFormElement | null, readonly
  // HTMLButtonElement.labels => Array<HTMLLabelElement>, readonly
  // HTMLButtonElement.menu => HTMLMenuElement
  // HTMLButtonElement.willValidate => boolean, readonly
  // HTMLButtonElement.validationMessage => string, readonly

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLDataElement extends HTMLElement {}
  registerSubclass('data', HTMLDataElement); // Reflected properties, strings.
  // HTMLEmbedElement.value => string, reflected attribute

  reflectProperties([{
    value: ['']
  }], HTMLDataElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLEmbedElement extends HTMLElement {}
  registerSubclass('embed', HTMLEmbedElement); // Reflected properties, strings.
  // HTMLEmbedElement.height => string, reflected attribute
  // HTMLEmbedElement.src => string, reflected attribute
  // HTMLEmbedElement.type => string, reflected attribute
  // HTMLEmbedElement.width => string, reflected attribute

  reflectProperties([{
    height: ['']
  }, {
    src: ['']
  }, {
    type: ['']
  }, {
    width: ['']
  }], HTMLEmbedElement); // Unimplemented
  // HTMLEmbedElement.align => string, not reflected
  // HTMLEmbedElement.name => string, not reflected

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const MATCHING_CHILD_ELEMENT_TAGNAMES = 'button fieldset input object output select textarea'.split(' ');
  /**
   * The HTMLFormControlsCollection interface represents a collection of HTML form control elements.
   * It is mixedin to both HTMLFormElement and HTMLFieldSetElement.
   */

  const HTMLFormControlsCollectionMixin = defineOn => {
    Object.defineProperty(defineOn.prototype, 'elements', {
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection
       * @return Element array matching children of specific tagnames.
       */
      get() {
        return matchChildrenElements(this, tagNameConditionPredicate(MATCHING_CHILD_ELEMENT_TAGNAMES));
      }

    });
  };

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLFieldSetElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
     * @return hardcoded string 'fieldset'
     */
    get type() {
      return this.tagName;
    }

  }
  registerSubclass('fieldset', HTMLFieldSetElement);
  HTMLFormControlsCollectionMixin(HTMLFieldSetElement); // Reflected properties
  // HTMLFieldSetElement.name => string, reflected attribute
  // HTMLFieldSetElement.disabled => boolean, reflected attribute

  reflectProperties([{
    name: ['']
  }, {
    disabled: [false]
  }], HTMLFieldSetElement); // Unimplemented properties
  // HTMLFieldSetElement.validity
  // HTMLFieldSetElement.willValidate
  // HTMLFieldSetElement.validationMessage

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLFormElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
     * @return number of controls in the form
     */
    get length() {
      return this.elements.length;
    }

  }
  registerSubclass('form', HTMLFormElement);
  HTMLFormControlsCollectionMixin(HTMLFormElement); // Reflected properties
  // HTMLFormElement.name => string, reflected attribute
  // HTMLFormElement.method => string, reflected attribute
  // HTMLFormElement.target => string, reflected attribute
  // HTMLFormElement.action => string, reflected attribute
  // HTMLFormElement.enctype => string, reflected attribute
  // HTMLFormElement.acceptCharset => string, reflected attribute
  // HTMLFormElement.autocomplete => string, reflected attribute
  // HTMLFormElement.autocapitalize => string, reflected attribute

  reflectProperties([{
    name: ['']
  }, {
    method: ['get']
  }, {
    target: ['']
  }, {
    action: ['']
  }, {
    enctype: ['application/x-www-form-urlencoded']
  }, {
    acceptCharset: ['', 'accept-charset']
  }, {
    autocomplete: ['on']
  }, {
    autocapitalize: ['sentences']
  }], HTMLFormElement); // Unimplemented properties
  // HTMLFormElement.encoding => string, reflected attribute
  // HTMLFormElement.noValidate => boolean, reflected attribute

  /*
  Unimplemented, TBD:

  Named inputs are added to their owner form instance as properties, and can overwrite native properties
  if they share the same name (eg a form with an input named action will have its action property return
  that input instead of the form's action HTML attribute).
  */

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLIFrameElement extends HTMLElement {
    constructor() {
      super(...arguments); // HTMLIFrameElement.sandbox, DOMTokenList, reflected attribute

      this.sandbox = new DOMTokenList(HTMLIFrameElement, this, 'sandbox', null, null);
    }

  }
  registerSubclass('iframe', HTMLIFrameElement); // Reflected properties
  // HTMLIFrameElement.allow => string, reflected attribute
  // HTMLIFrameElement.allowFullscreen => boolean, reflected attribute
  // HTMLIFrameElement.csp => string, reflected attribute
  // HTMLIFrameElement.height => string, reflected attribute
  // HTMLIFrameElement.name => string, reflected attribute
  // HTMLIFrameElement.referrerPolicy => string, reflected attribute
  // HTMLIFrameElement.src => string, reflected attribute
  // HTMLIFrameElement.srcdoc => string, reflected attribute
  // HTMLIFrameElement.width => string, reflected attribute

  reflectProperties([{
    allow: ['']
  }, {
    allowFullscreen: [false]
  }, {
    csp: ['']
  }, {
    height: ['']
  }, {
    name: ['']
  }, {
    referrerPolicy: ['']
  }, {
    src: ['']
  }, {
    srcdoc: ['']
  }, {
    width: ['']
  }], HTMLIFrameElement); // Unimplemented Properties
  // HTMLIFrameElement.allowPaymentRequest => boolean, reflected attribute
  // HTMLIFrameElement.contentDocument => Document, read only (active document in the inline frame's nested browsing context)
  // HTMLIFrameElement.contentWindow => WindowProxy, read only (window proxy for the nested browsing context)

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLImageElement extends HTMLElement {}
  registerSubclass('img', HTMLImageElement); // Reflected Properties
  // HTMLImageElement.alt => string, reflected attribute
  // HTMLImageElement.crossOrigin => string, reflected attribute
  // HTMLImageElement.height => number, reflected attribute
  // HTMLImageElement.isMap => boolean, reflected attribute
  // HTMLImageElement.referrerPolicy => string, reflected attribute
  // HTMLImageElement.src => string, reflected attribute
  // HTMLImageElement.sizes => string, reflected attribute
  // HTMLImageElement.srcset => string, reflected attribute
  // HTMLImageElement.useMap => string, reflected attribute
  // HTMLImageElement.width => number, reflected attribute

  reflectProperties([{
    alt: ['']
  }, {
    crossOrigin: ['']
  }, {
    height: [0]
  }, {
    isMap: [false]
  }, {
    referrerPolicy: ['']
  }, {
    src: ['']
  }, {
    sizes: ['']
  }, {
    srcset: ['']
  }, {
    useMap: ['']
  }, {
    width: [0]
  }], HTMLImageElement); // Unimplmented Properties
  // HTMLImageElement.complete Read only
  // Returns a Boolean that is true if the browser has finished fetching the image, whether successful or not. It also shows true, if the image has no src value.
  // HTMLImageElement.currentSrc Read only
  // Returns a DOMString representing the URL to the currently displayed image (which may change, for example in response to media queries).
  // HTMLImageElement.naturalHeight Read only
  // Returns a unsigned long representing the intrinsic height of the image in CSS pixels, if it is available; else, it shows 0.
  // HTMLImageElement.naturalWidth Read only
  // Returns a unsigned long representing the intrinsic width of the image in CSS pixels, if it is available; otherwise, it will show 0.

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  /**
   * The HTMLInputLabels interface represents a collection of input getters for their related label Elements.
   * It is mixedin to both HTMLInputElement, HTMLMeterElement, and HTMLProgressElement.
   */

  const HTMLInputLabelsMixin = defineOn => {
    Object.defineProperty(defineOn.prototype, 'labels', {
      /**
       * Getter returning label elements associated to this meter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLProgressElement/labels
       * @return label elements associated to this meter.
       */
      get() {
        return matchChildrenElements(this.ownerDocument || this, element => element.tagName === 'label' && element.for && element.for === this.id);
      }

    });
  };

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLInputElement extends HTMLElement {}
  registerSubclass('input', HTMLInputElement);
  HTMLInputLabelsMixin(HTMLInputElement); // Reflected Properties
  // HTMLInputElement.formAction => string, reflected attribute
  // HTMLInputElement.formEncType	=> string, reflected attribute
  // HTMLInputElement.formMethod => string, reflected attribute
  // HTMLInputElement.formTarget => string, reflected attribute
  // HTMLInputElement.name => string, reflected attribute
  // HTMLInputElement.type => string, reflected attribute
  // HTMLInputElement.disabled => boolean, reflected attribute
  // HTMLInputElement.autofocus => boolean, reflected attribute
  // HTMLInputElement.required => boolean, reflected attribute
  // HTMLInputElement.defaultChecked => boolean, reflected attribute ("checked")
  // HTMLInputElement.alt => string, reflected attribute
  // HTMLInputElement.height => number, reflected attribute
  // HTMLInputElement.src => string, reflected attribute
  // HTMLInputElement.width => number, reflected attribute
  // HTMLInputElement.accept => string, reflected attribute
  // HTMLInputElement.autocomplete => string, reflected attribute
  // HTMLInputElement.maxLength => number, reflected attribute
  // HTMLInputElement.size => number, reflected attribute
  // HTMLInputElement.pattern => string, reflected attribute
  // HTMLInputElement.placeholder => string, reflected attribute
  // HTMLInputElement.readOnly => boolean, reflected attribute
  // HTMLInputElement.min => string, reflected attribute
  // HTMLInputElement.max => string, reflected attribute
  // HTMLInputElement.defaultValue => string, reflected attribute
  // HTMLInputElement.dirname => string, reflected attribute
  // HTMLInputElement.multiple => boolean, reflected attribute
  // HTMLInputElement.step => string, reflected attribute
  // HTMLInputElement.autocapitalize => string, reflected attribute

  reflectProperties([{
    formAction: ['']
  }, {
    formEncType: ['']
  }, {
    formMethod: ['']
  }, {
    formTarget: ['']
  }, {
    name: ['']
  }, {
    type: ['text']
  }, {
    disabled: [false]
  }, {
    autofocus: [false]
  }, {
    required: [false]
  }, {
    defaultChecked: [false, 'checked']
  }, {
    alt: ['']
  }, {
    height: [0]
  }, {
    src: ['']
  }, {
    width: [0]
  }, {
    accept: ['']
  }, {
    autocomplete: ['']
  }, {
    maxLength: [0]
  }, {
    size: [0]
  }, {
    pattern: ['']
  }, {
    placeholder: ['']
  }, {
    readOnly: [false]
  }, {
    min: ['']
  }, {
    max: ['']
  }, {
    defaultValue: ['', 'value']
  }, {
    dirName: ['']
  }, {
    multiple: [false]
  }, {
    step: ['']
  }, {
    autocapitalize: ['']
  }], HTMLInputElement); // TODO(KB) Not Reflected Properties
  // HTMLInputElement.value => string
  // HTMLInputElement.checked	=> boolean
  // HTMLInputElement.indeterminate => boolean
  // Unimplemented Properties
  // HTMLInputElement.formNoValidate => string, reflected attribute
  // HTMLInputElement.validity => ValidityState, readonly
  // HTMLInputElement.validationMessage => string, readonly
  // HTMLInputElement.willValidate => boolean, readonly
  // HTMLInputElement.allowdirs => boolean
  // HTMLInputElement.files	=> Array<File>
  // HTMLInputElement.webkitdirectory	=> boolean, reflected attribute
  // HTMLInputElement.webkitEntries => Array<FileSystemEntry>
  // HTMLInputElement.selectionStart => number
  // HTMLInputElement.selectionEnd => number
  // HTMLInputElement.selectionDirection => string
  // HTMLInputElement.list => Element, read only (element pointed by list attribute)
  // HTMLInputElement.valueAsDate => Date
  // HTMLInputElement.valueAsNumber => number
  // Unimplemented Methods
  // HTMLInputElement.setSelectionRange()
  // HTMLInputElement.setRangeText()
  // HTMLInputElement.setCustomValidity()
  // HTMLInputElement.checkValidity()
  // HTMLInputElement.stepDown()
  // HTMLInputElement.stepUp()

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLLabelElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control
     * @return input element
     */
    get control() {
      const htmlFor = this.getAttribute('for');

      if (htmlFor !== null) {
        return this.ownerDocument && this.ownerDocument.getElementById(htmlFor);
      }

      return matchChildElement(this, tagNameConditionPredicate(['input']));
    }

  }
  registerSubclass('label', HTMLLabelElement); // Reflected Properties
  // HTMLLabelElement.htmlFor => string, reflected attribute 'for'

  reflectProperties([{
    htmlFor: ['', 'for']
  }], HTMLLabelElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLLinkElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this.relList = new DOMTokenList(HTMLLinkElement, this, 'rel', 'relList', 'rel');
    }

  }
  registerSubclass('link', HTMLLinkElement); // Reflected Properties
  // HTMLLinkElement.as => string, reflected attribute
  // HTMLLinkElement.crossOrigin => string, reflected attribute
  // HTMLLinkElement.disabled => boolean, reflected attribute
  // HTMLLinkElement.href => string, reflected attribute
  // HTMLLinkElement.hreflang => string, reflected attribute
  // HTMLLinkElement.media => string, reflected attribute
  // HTMLLinkElement.referrerPolicy => string, reflected attribute
  // HTMLLinkElement.sizes => string, reflected attribute
  // HTMLLinkElement.type => string, reflected attribute

  reflectProperties([{
    as: ['']
  }, {
    crossOrigin: ['']
  }, {
    disabled: [false]
  }, {
    href: ['']
  }, {
    hreflang: ['']
  }, {
    media: ['']
  }, {
    referrerPolicy: ['']
  }, {
    sizes: ['']
  }, {
    type: ['']
  }], HTMLLinkElement); // Unimplemented Properties
  // LinkStyle.sheet Read only
  // Returns the StyleSheet object associated with the given element, or null if there is none.

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLMapElement extends HTMLElement {
    /**
     * Getter returning area elements associated to this map.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement
     * @return area elements associated to this map.
     */
    get areas() {
      return matchChildrenElements(this, element => element.tagName === 'area');
    }

  }
  registerSubclass('link', HTMLMapElement); // Reflected Properties
  // HTMLMapElement.name => string, reflected attribute

  reflectProperties([{
    name: ['']
  }], HTMLMapElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLMeterElement extends HTMLElement {}
  registerSubclass('meter', HTMLMeterElement);
  HTMLInputLabelsMixin(HTMLMeterElement); // Reflected Properties
  // HTMLMeterElement.high => number, reflected attribute
  // HTMLMeterElement.low => number, reflected attribute
  // HTMLMeterElement.max => number, reflected attribute
  // HTMLMeterElement.min => number, reflected attribute
  // HTMLMeterElement.optimum => number, reflected attribute
  // HTMLMeterElement.value => number, reflected attribute

  reflectProperties([{
    high: [0]
  }, {
    low: [0]
  }, {
    max: [1]
  }, {
    min: [0]
  }, {
    optimum: [0]
  }, {
    value: [0]
  }], HTMLMeterElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLModElement extends HTMLElement {}
  registerSubclass('del', HTMLModElement);
  registerSubclass('ins', HTMLModElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute
  // HTMLModElement.datetime => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }, {
    datetime: ['']
  }], HTMLModElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLOListElement extends HTMLElement {}
  registerSubclass('ol', HTMLOListElement); // Reflected Properties
  // HTMLModElement.reversed => boolean, reflected attribute
  // HTMLModElement.start => number, reflected attribute
  // HTMLOListElement.type => string, reflected attribute

  reflectProperties([{
    reversed: [false]
  }, {
    start: [1]
  }, {
    type: ['']
  }], HTMLOListElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLOptionElement extends HTMLElement {
    constructor(nodeType, nodeName, namespaceURI) {
      super(nodeType, nodeName, namespaceURI);
      this.isSelected = false;
      this.propertyBackedAttributes_.selected = [() => String(this.isSelected), value => this.selected = value === 'true'];
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return position of the option within the list of options it's within, or zero if there is no valid parent.
     */


    get index() {
      return this.parentNode && this.parentNode.children.indexOf(this) || 0;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return label attribute value or text content if there is no attribute.
     */


    get label() {
      return this.getAttribute('label') || this.textContent;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @param label new label value to store as an attribute.
     */


    set label(label) {
      this.setAttribute('label', label);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return boolean based on if the option element is selected.
     */


    get selected() {
      return this.isSelected;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @param value new selected boolean value.
     */


    set selected(value) {
      this.isSelected = value; // TODO(KB) This is a mutation.
    }
    /**
     * A Synonym for the Node.textContent property getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return value of text node direct child of this Element.
     */


    get text() {
      return this.textContent;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @param text new text content to store for this Element.
     */


    set text(text) {
      this.textContent = text;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return value attribute value or text content if there is no attribute.
     */


    get value() {
      return this.getAttribute('value') || this.textContent;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @param value new value for an option element.
     */


    set value(value) {
      this.setAttribute('value', value);
    }

  }
  registerSubclass('option', HTMLOptionElement); // Reflected Properties
  // HTMLOptionElement.defaultSelected => boolean, reflected attribute
  // HTMLOptionElement.disabled => boolean, reflected attribute
  // HTMLOptionElement.type => string, reflected attribute

  reflectProperties([{
    defaultSelected: [false, 'selected']
  }, {
    disabled: [false]
  }, {
    type: ['']
  }], HTMLOptionElement); // Implemented at HTMLElement
  // HTMLOptionElement.form, Read only	=> HTMLFormElement

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLProgressElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this._indeterminate = true;
      this._value = 0;
    }

    get position() {
      return this._indeterminate ? -1 : this._value / this.max;
    }

    get value() {
      return this._value;
    }

    set value(value) {
      this._indeterminate = false;
      this._value = value; // TODO(KB) This is a property mutation needing tracked.
    }

  }
  registerSubclass('progress', HTMLProgressElement);
  HTMLInputLabelsMixin(HTMLProgressElement); // Reflected Properties
  // HTMLModElement.max => number, reflected attribute

  reflectProperties([{
    max: [1]
  }], HTMLProgressElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLQuoteElement extends HTMLElement {}
  registerSubclass('blockquote', HTMLQuoteElement);
  registerSubclass('q', HTMLQuoteElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }], HTMLQuoteElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLScriptElement extends HTMLElement {
    /**
     * A Synonym for the Node.textContent property getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
     * @return value of text node direct child of this Element.
     */
    get text() {
      return this.textContent;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
     * @param text new text content to store for this Element.
     */


    set text(text) {
      this.textContent = text;
    }

  }
  registerSubclass('script', HTMLScriptElement); // Reflected Properties
  // HTMLScriptElement.type => string, reflected attribute
  // HTMLScriptElement.src => string, reflected attribute
  // HTMLScriptElement.charset => string, reflected attribute
  // HTMLScriptElement.async => boolean, reflected attribute
  // HTMLScriptElement.defer => boolean, reflected attribute
  // HTMLScriptElement.crossOrigin => string, reflected attribute
  // HTMLScriptElement.noModule => boolean, reflected attribute

  reflectProperties([{
    type: ['']
  }, {
    src: ['']
  }, {
    charset: ['']
  }, {
    async: [false]
  }, {
    defer: [false]
  }, {
    crossOrigin: ['']
  }, {
    noModule: [false]
  }], HTMLScriptElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const isOptionPredicate = tagNameConditionPredicate(['option']);

  const isSelectedOptionPredicate = element => element.tagName === 'option' && element.selected;

  class HTMLSelectElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this._size_ = -1
      /* UNMODIFIED */
      ;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
     * @return number of controls in the form
     */


    get length() {
      return matchChildrenElements(this, isOptionPredicate).length;
    }
    /**
     * Getter returning option elements that are direct children of a HTMLSelectElement
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
     * @return Element "options" objects that are direct children.
     */


    get options() {
      return this.children.filter(isOptionPredicate);
    }
    /**
     * Getter returning the index of the first selected <option> element.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
     * @return the index of the first selected option element, or -1 if no element is selected.
     */


    get selectedIndex() {
      const firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
      return firstSelectedChild ? this.children.indexOf(firstSelectedChild) : -1;
    }
    /**
     * Setter making the <option> element at the passed index selected.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
     * @param selectedIndex index number to make selected.
     */


    set selectedIndex(selectedIndex) {
      this.children.forEach((element, index) => {
        element.selected = index === selectedIndex;
      });
    }
    /**
     * Getter returning the <option> elements selected.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions
     * @return array of Elements currently selected.
     */


    get selectedOptions() {
      return matchChildrenElements(this, isSelectedOptionPredicate);
    }
    /**
     * Getter returning the size of the select element (by default 1 for single and 4 for multiple)
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
     * @return size of the select element.
     */


    get size() {
      return this._size_ === -1
      /* UNMODIFIED */
      ? this.multiple ? 4
      /* MULTIPLE */
      : 1
      /* SINGLE */
      : this._size_;
    }
    /**
     * Override the size of this element (each positive unit is the height of a single option)
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
     * @param size number to set the size to.
     */


    set size(size) {
      this._size_ = size > 0 ? size : this.multiple ? 4
      /* MULTIPLE */
      : 1
      /* SINGLE */
      ;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
     * @return string representing the select element type.
     */


    get type() {
      return this.multiple ? "select-one"
      /* MULTIPLE */
      : "select-multiple"
      /* SINGLE */
      ;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
     * @return the value of the first selected option
     */


    get value() {
      const firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
      return firstSelectedChild ? firstSelectedChild.value : '';
    }

  }
  registerSubclass('select', HTMLSelectElement);
  HTMLInputLabelsMixin(HTMLSelectElement); // Reflected Properties
  // HTMLSelectElement.multiple => boolean, reflected attribute
  // HTMLSelectElement.name => string, reflected attribute
  // HTMLSelectElement.required => boolean, reflected attribute

  reflectProperties([{
    multiple: [false]
  }, {
    name: ['']
  }, {
    required: [false]
  }], HTMLSelectElement); // Implemented on HTMLElement
  // HTMLSelectElement.form => HTMLFormElement, readonly
  // Unimplemented Properties
  // HTMLSelectElement.validation => string
  // HTMLSelectElement.validity => ValidityState
  // HTMLSelectElement.willValidate => boolean

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLSourceElement extends HTMLElement {}
  registerSubclass('source', HTMLSourceElement); // Reflected Properties
  // HTMLSourceElement.media => string, reflected attribute
  // HTMLSourceElement.sizes => string, reflected attribute
  // HTMLSourceElement.src => string, reflected attribute
  // HTMLSourceElement.srcset => string, reflected attribute
  // HTMLSourceElement.type => string, reflected attribute

  reflectProperties([{
    media: ['']
  }, {
    sizes: ['']
  }, {
    src: ['']
  }, {
    srcset: ['']
  }, {
    type: ['']
  }], HTMLSourceElement); // Unimplemented Properties
  // HTMLSourceElement.keySystem => string

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLStyleElement extends HTMLElement {}
  registerSubclass('style', HTMLStyleElement); // Reflected Properties
  // HTMLStyleElement.media => string, reflected attribute
  // HTMLStyleElement.type => string, reflected attribute

  reflectProperties([{
    media: ['']
  }, {
    type: ['']
  }], HTMLStyleElement); // Unimplemented Properties
  // HTMLStyleElement.disabled => boolean
  // HTMLStyleElement.scoped => boolean, reflected attribute
  // HTMLStyleElement.sheet => StyleSheet, read only

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLTableCellElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this.headers = new DOMTokenList(HTMLTableCellElement, this, 'headers', null, null);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement
     * @return position of the cell within the parent tr, if not nested in a tr the value is -1.
     */


    get cellIndex() {
      const parent = matchNearestParent(this, tagNameConditionPredicate(['tr']));
      return parent !== null ? matchChildrenElements(parent, tagNameConditionPredicate(['th', 'td'])).indexOf(this) : -1;
    }

  }
  registerSubclass('th', HTMLTableCellElement);
  registerSubclass('td', HTMLTableCellElement); // Reflected Properties
  // HTMLTableCellElement.abbr => string, reflected attribute
  // HTMLTableCellElement.colSpan => number, reflected attribute
  // HTMLTableCellElement.rowSpan => number, reflected attribute
  // HTMLTableCellElement.scope => string, reflected attribute

  reflectProperties([{
    abbr: ['']
  }, {
    colSpan: [1]
  }, {
    rowSpan: [1]
  }, {
    scope: ['']
  }], HTMLTableCellElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLTableColElement extends HTMLElement {}
  registerSubclass('col', HTMLTableColElement); // Reflected Properties
  // HTMLTableColElement.span => number, reflected attribute

  reflectProperties([{
    span: [1]
  }], HTMLTableColElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  const removeElement = element => element && element.remove();

  const insertBeforeElementsWithTagName = (parent, element, tagNames) => {
    const insertBeforeElement = matchChildElement(parent, element => !tagNames.includes(element.tagName));

    if (insertBeforeElement) {
      parent.insertBefore(element, insertBeforeElement);
    } else {
      parent.appendChild(element);
    }
  };

  class HTMLTableElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
     * @return first matching caption Element or null if none exists.
     */
    get caption() {
      return matchChildElement(this, tagNameConditionPredicate(['caption']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
     * @param element new caption element to replace the existing, or become the first element child.
     */


    set caption(newElement) {
      if (newElement && newElement.tagName === 'caption') {
        // If a correct object is given,
        // it is inserted in the tree as the first child of this element and the first <caption>
        // that is a child of this element is removed from the tree, if any.
        removeElement(this.caption);
        this.insertBefore(newElement, this.firstElementChild);
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
     * @return first matching thead Element or null if none exists.
     */


    get tHead() {
      return matchChildElement(this, tagNameConditionPredicate(['thead']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
     * @param newElement new thead element to insert in this table.
     */


    set tHead(newElement) {
      if (newElement && newElement.tagName === 'thead') {
        // If a correct object is given,
        // it is inserted in the tree immediately before the first element that is
        // neither a <caption>, nor a <colgroup>, or as the last child if there is no such element.
        // Additionally, the first <thead> that is a child of this element is removed from the tree, if any.
        removeElement(this.tHead);
        insertBeforeElementsWithTagName(this, newElement, ['caption', 'colgroup']);
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
     * @return first matching thead Element or null if none exists.
     */


    get tFoot() {
      return matchChildElement(this, tagNameConditionPredicate(['tfoot']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
     * @param newElement new tfoot element to insert in this table.
     */


    set tFoot(newElement) {
      if (newElement && newElement.tagName === 'tfoot') {
        // If a correct object is given,
        // it is inserted in the tree immediately before the first element that is neither a <caption>,
        // a <colgroup>, nor a <thead>, or as the last child if there is no such element, and the first <tfoot> that is a child of
        // this element is removed from the tree, if any.
        removeElement(this.tFoot);
        insertBeforeElementsWithTagName(this, newElement, ['caption', 'colgroup', 'thead']);
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
     * @return array of 'tr' tagname elements
     */


    get rows() {
      return matchChildrenElements(this, tagNameConditionPredicate(['tr']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
     * @return array of 'tbody' tagname elements
     */


    get tBodies() {
      return matchChildrenElements(this, tagNameConditionPredicate(['tbody']));
    }

  }
  registerSubclass('table', HTMLTableElement); // Unimplemented Properties
  // HTMLTableElement.sortable => boolean
  // Unimplemented Methods
  // HTMLTableElement.createTHead()
  // HTMLTableElement.deleteTHead()
  // HTMLTableElement.createTFoot()
  // HTMLTableElement.deleteTFoot()
  // HTMLTableElement.createCaption()
  // HTMLTableElement.deleteCaption()
  // HTMLTableElement.insertRow()
  // HTMLTableElement.deleteRow()

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const TABLE_SECTION_TAGNAMES = 'table tbody thead tfoot'.split(' ');

  const indexInAncestor = (element, isValidAncestor) => {
    const parent = matchNearestParent(element, isValidAncestor); // TODO(KB): This is either a HTMLTableElement or HTMLTableSectionElement.

    return parent === null ? -1 : parent.rows.indexOf(element);
  };

  class HTMLTableRowElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
     * @return td and th elements that are children of this row.
     */
    get cells() {
      return matchChildrenElements(this, tagNameConditionPredicate(['td', 'th']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
     * @return position of the row within a table, if not nested within in a table the value is -1.
     */


    get rowIndex() {
      return indexInAncestor(this, tagNameConditionPredicate(['table']));
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
     * @return position of the row within a parent section, if not nested directly in a section the value is -1.
     */


    get sectionRowIndex() {
      return indexInAncestor(this, tagNameConditionPredicate(TABLE_SECTION_TAGNAMES));
    }
    /**
     * Removes the cell in provided position of this row.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
     * @param index position of the cell in the row to remove.
     */


    deleteCell(index) {
      const cell = this.cells[index];
      cell && cell.remove();
    }
    /**
     * Insert a new cell ('td') in the row at a specified position.
     * @param index position in the children to insert before.
     * @return newly inserted td element.
     */


    insertCell(index) {
      const cells = this.cells;
      const td = this.ownerDocument.createElement('td');

      if (index < 0 || index >= cells.length) {
        this.appendChild(td);
      } else {
        this.insertBefore(td, this.children[index]);
      }

      return td;
    }

  }
  registerSubclass('tr', HTMLTableRowElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class HTMLTableSectionElement extends HTMLElement {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
     * @return All rows (tr elements) within the table section.
     */
    get rows() {
      return matchChildrenElements(this, tagNameConditionPredicate(['tr']));
    }
    /**
     * Remove a node in a specified position from the section.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
     * @param index position in the section to remove the node of.
     */


    deleteRow(index) {
      const rows = this.rows;

      if (index >= 0 || index <= rows.length) {
        rows[index].remove();
      }
    }
    /**
     * Insert a new row ('tr') in the row at a specified position.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
     * @param index position in the children to insert before.
     * @return newly inserted tr element.
     */


    insertRow(index) {
      const rows = this.rows;
      const tr = this.ownerDocument.createElement('tr');

      if (index < 0 || index >= rows.length) {
        this.appendChild(tr);
      } else {
        this.insertBefore(tr, this.children[index]);
      }

      return tr;
    }

  }
  registerSubclass('thead', HTMLTableSectionElement);
  registerSubclass('tfoot', HTMLTableSectionElement);
  registerSubclass('tbody', HTMLTableSectionElement);

  // <blockquote> and <q>
  class HTMLTimeElement extends HTMLElement {}
  registerSubclass('time', HTMLTimeElement); // Reflected Properties
  // HTMLTimeElement.dateTime => string, reflected attribute

  reflectProperties([{
    dateTime: ['']
  }], HTMLTimeElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class SVGElement extends Element {}
  registerSubclass('svg', SVGElement);

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class Event {
    constructor(type, opts) {
      this._stop = false;
      this._end = false;
      this.type = type;
      this.bubbles = !!opts.bubbles;
      this.cancelable = !!opts.cancelable;
    }

    stopPropagation() {
      this._stop = true;
    }

    stopImmediatePropagation() {
      this._end = this._stop = true;
    }

    preventDefault() {
      this.defaultPrevented = true;
    }

  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  let document;
  let observing = false;
  let hydrated = false;

  const serializeNodes = nodes => nodes.map(node => node._transferredFormat_);
  /**
   *
   * @param mutations
   */


  function serializeHydration(mutations) {
    consume();
    const hydratedNode = document.body.hydrate();
    const events = [];
    mutations.forEach(mutation => {
      if (mutation.type === 4
      /* COMMAND */
      && mutation.addedEvents) {
        mutation.addedEvents.forEach(addEvent => {
          events.push(addEvent);
        });
      }
    });
    return {
      [9
      /* type */
      ]: 2
      /* HYDRATE */
      ,
      [39
      /* strings */
      ]: consume$1(),
      [35
      /* nodes */
      ]: hydratedNode,
      [20
      /* addedEvents */
      ]: events
    };
  }
  /**
   *
   * @param mutations
   */


  function serializeMutations(mutations) {
    const nodes = consume().map(node => node._creationFormat_);
    const transferrableMutations = [];
    mutations.forEach(mutation => {
      let transferable = {
        [9
        /* type */
        ]: mutation.type,
        [10
        /* target */
        ]: mutation.target._index_
      };
      mutation.addedNodes && (transferable[11
      /* addedNodes */
      ] = serializeNodes(mutation.addedNodes));
      mutation.removedNodes && (transferable[12
      /* removedNodes */
      ] = serializeNodes(mutation.removedNodes));
      mutation.nextSibling && (transferable[14
      /* nextSibling */
      ] = mutation.nextSibling._transferredFormat_);
      mutation.attributeName != null && (transferable[15
      /* attributeName */
      ] = store$1(mutation.attributeName));
      mutation.attributeNamespace != null && (transferable[16
      /* attributeNamespace */
      ] = store$1(mutation.attributeNamespace));
      mutation.oldValue != null && (transferable[19
      /* oldValue */
      ] = store$1(mutation.oldValue));
      mutation.propertyName && (transferable[17
      /* propertyName */
      ] = store$1(mutation.propertyName));
      mutation.value != null && (transferable[18
      /* value */
      ] = store$1(mutation.value));
      mutation.addedEvents && (transferable[20
      /* addedEvents */
      ] = mutation.addedEvents);
      mutation.removedEvents && (transferable[21
      /* removedEvents */
      ] = mutation.removedEvents);
      transferrableMutations.push(transferable);
    });
    return {
      [9
      /* type */
      ]: 3
      /* MUTATE */
      ,
      [39
      /* strings */
      ]: consume$1(),
      [35
      /* nodes */
      ]: nodes,
      [34
      /* mutations */
      ]: transferrableMutations
    };
  }
  /**
   *
   * @param incoming
   * @param postMessage
   */


  function handleMutations(incoming, postMessage) {
    if (postMessage) {
      postMessage(hydrated === false ? serializeHydration(incoming) : serializeMutations(incoming));
    }

    hydrated = true;
  }
  /**
   *
   * @param doc
   * @param postMessage
   */


  function observe(doc, postMessage) {
    if (!observing) {
      document = doc;
      new doc.defaultView.MutationObserver(mutations => handleMutations(mutations, postMessage)).observe(doc.body);
      observing = true;
    } else {
      console.error('observe() was called more than once.');
    }
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */

  function propagate$1() {
    if (typeof addEventListener !== 'undefined') {
      addEventListener('message', ({
        data
      }) => {
        if (data[9
        /* type */
        ] !== 1
        /* EVENT */
        ) {
            return;
          }

        const event = data[37
        /* event */
        ];
        const node = get(event[7
        /* _index_ */
        ]);

        if (node !== null) {
          const target = event[10
          /* target */
          ];
          node.dispatchEvent(Object.assign(new Event(event[9
          /* type */
          ], {
            bubbles: event[22
            /* bubbles */
            ],
            cancelable: event[23
            /* cancelable */
            ]
          }), {
            cancelBubble: event[24
            /* cancelBubble */
            ],
            defaultPrevented: event[26
            /* defaultPrevented */
            ],
            eventPhase: event[27
            /* eventPhase */
            ],
            isTrusted: event[28
            /* isTrusted */
            ],
            returnValue: event[29
            /* returnValue */
            ],
            target: get(target ? target[7
            /* _index_ */
            ] : null),
            timeStamp: event[30
            /* timeStamp */
            ],
            scoped: event[31
            /* scoped */
            ],
            keyCode: event[32
            /* keyCode */
            ]
          }));
        }
      });
    }
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */

  function propagate$2() {
    if (typeof addEventListener !== 'function') {
      return;
    }

    addEventListener('message', ({
      data
    }) => {
      if (data[9
      /* type */
      ] !== 5
      /* SYNC */
      ) {
          return;
        }

      const sync = data[38
      /* sync */
      ];
      const node = get(sync[7
      /* _index_ */
      ]);

      if (node) {
        node.value = sync[18
        /* value */
        ];
      }
    });
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  class Document extends Element {
    constructor() {
      super(9
      /* DOCUMENT_NODE */
      , '#document', null);
      this.documentElement = this;

      this.createElement = tagName => this.createElementNS(null, tagName);

      this.createElementNS = (namespaceURI, tagName) => new (NODE_NAME_MAPPING[tagName] || HTMLElement)(1
      /* ELEMENT_NODE */
      , tagName, namespaceURI);

      this.createTextNode = text => new Text(text);

      this.defaultView = {
        document: this,
        MutationObserver,
        Document,
        Node,
        Text,
        Element,
        SVGElement,
        Event
      };
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
     * @return Element with matching id attribute.
     */


    getElementById(id) {
      return matchChildElement(this.body, element => element.id === id);
    }

  }
  /**
   *
   * @param postMessageMethod
   */

  function createDocument(postMessageMethod) {
    // Use local references of privileged functions that are used asynchronously
    // (e.g. `postMessage`) to prevent overwriting by 3P JS.
    const _postMessage = postMessageMethod;
    const doc = new Document();
    doc.isConnected = true;
    doc.appendChild(doc.body = doc.createElement('body'));

    if (_postMessage) {
      observe(doc, _postMessage);
      propagate$1();
      propagate$2();
    }

    return doc;
  }
  /** Should only be used for testing. */

  const documentForTesting = undefined;

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  const WHITELISTED_GLOBALS = ['Array', 'ArrayBuffer', 'Blob', 'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean', 'Cache', 'CustomEvent', 'DataView', 'Date', 'Error', 'EvalError', 'Event', 'EventTarget', 'Float32Array', 'Float64Array', 'Function', 'Infinity', 'Int16Array', 'Int32Array', 'Int8Array', 'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TextDecoder', 'TextEncoder', 'TypeError', 'URIError', 'URL', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap', 'WeakSet', 'atob', 'btoa', 'caches', 'clearInterval', 'clearTimeout', 'console', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'eval', 'fetch', 'indexedDB', 'isFinite', 'isNaN', 'onerror', 'onrejectionhandled', 'onunhandledrejection', 'parseFloat', 'parseInt', 'performance', 'setTimeout', 'setInterval', 'undefined', 'unescape'];
  const doc = createDocument(self.postMessage);
  const workerDOM = {
    document: doc,
    addEventListener: doc.addEventListener.bind(doc),
    removeEventListener: doc.removeEventListener.bind(doc),
    localStorage: {},
    location: {},
    url: '/',
    appendKeys
  };
  /**
   * Walks up a global's prototype chain and dereferences non-whitelisted properties
   * until EventTarget is reached.
   * @param global
   */

  function dereferenceGlobals(global) {
    function deleteUnsafe(object, property) {
      if (WHITELISTED_GLOBALS.indexOf(property) >= 0) {
        return;
      }

      try {
        console.info(`  Deleting ${property}...`);
        delete object[property];
      } catch (e) {
        console.warn(e);
      }
    }

    let current = global;

    while (current && current.constructor !== EventTarget) {
      console.info('Removing references from:', current);
      Object.getOwnPropertyNames(current).forEach(prop => {
        deleteUnsafe(current, prop);
      });
      current = Object.getPrototypeOf(current);
    }
  }

  dereferenceGlobals(self);

  exports.workerDOM = workerDOM;

  return exports;

}({}));
//# sourceMappingURL=worker.safe.mjs.map