var WorkerThread = (function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
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
  var toLower = function toLower(value) {
    return value.toLowerCase();
  };
  var toUpper = function toUpper(value) {
    return value.toUpperCase();
  };
  var containsIndexOf = function containsIndexOf(pos) {
    return pos !== -1;
  };
  var keyValueString = function keyValueString(key, value) {
    return "".concat(key, "=\"").concat(value, "\"");
  };

  var tagNameConditionPredicate = function tagNameConditionPredicate(tagNames) {
    return function (element) {
      return tagNames.includes(element.tagName);
    };
  };
  var elementPredicate = function elementPredicate(node) {
    return node.nodeType === 1;
  }
  /* ELEMENT_NODE */
  ;
  var matchChildrenElements = function matchChildrenElements(node, conditionPredicate) {
    var matchingElements = [];
    node.childNodes.forEach(function (child) {
      if (elementPredicate(child)) {
        if (conditionPredicate(child)) {
          matchingElements.push(child);
        }

        matchingElements.push.apply(matchingElements, _toConsumableArray(matchChildrenElements(child, conditionPredicate)));
      }
    });
    return matchingElements;
  };
  var matchChildElement = function matchChildElement(element, conditionPredicate) {
    var returnValue = null;
    element.children.some(function (child) {
      if (conditionPredicate(child)) {
        returnValue = child;
        return true;
      }

      var grandChildMatch = matchChildElement(child, conditionPredicate);

      if (grandChildMatch !== null) {
        returnValue = grandChildMatch;
        return true;
      }

      return false;
    });
    return returnValue;
  };
  var matchNearestParent = function matchNearestParent(element, conditionPredicate) {
    while (element = element.parentNode) {
      if (conditionPredicate(element)) {
        return element;
      }
    }

    return null;
  };
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
   * @param attrSelector the selector we are trying to match for.
   * @param element the element being tested.
   * @return boolean for whether we match the condition
   */

  var matchAttrReference = function matchAttrReference(attrSelector, element) {
    if (!attrSelector) {
      return false;
    }

    var equalPos = attrSelector.indexOf('=');
    var selectorLength = attrSelector.length;
    var caseInsensitive = attrSelector.charAt(selectorLength - 2) === 'i';
    var endPos = caseInsensitive ? selectorLength - 3 : selectorLength - 1;

    if (equalPos !== -1) {
      var equalSuffix = attrSelector.charAt(equalPos - 1);
      var possibleSuffixes = ['~', '|', '$', '^', '*'];
      var attrString = possibleSuffixes.includes(equalSuffix) ? attrSelector.substring(1, equalPos - 1) : attrSelector.substring(1, equalPos);
      var rawValue = attrSelector.substring(equalPos + 1, endPos);
      var rawAttrValue = element.getAttribute(attrString);

      if (rawAttrValue) {
        var casedValue = caseInsensitive ? toLower(rawValue) : rawValue;
        var casedAttrValue = caseInsensitive ? toLower(rawAttrValue) : rawAttrValue;

        switch (equalSuffix) {
          case '~':
            return casedAttrValue.split(' ').indexOf(casedValue) !== -1;

          case '|':
            return casedAttrValue === casedValue || casedAttrValue === "".concat(casedValue, "-");

          case '^':
            return casedAttrValue.startsWith(casedValue);

          case '$':
            return casedAttrValue.endsWith(casedValue);

          case '*':
            return casedAttrValue.indexOf(casedValue) !== -1;

          default:
            return casedAttrValue === casedValue;
        }
      }

      return false;
    } else {
      return element.hasAttribute(attrSelector.substring(1, endPos));
    }
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
  var phase = 0
  /* Initializing */
  ;
  var set = function set(newPhase) {
    return phase = newPhase;
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
  var count = 0;
  var transfer = [];
  var mapping = new Map();
  /**
   * Override the store for a node during the initialization phase.
   * @param node Node to store and modify with index
   * @param override Override number to use as the identifier.
   *
   * NOTE: THIS IS ONLY TO BE USED DURING INITIALIZATION.
   */

  function storeOverride(node, override) {
    if (phase === 0
    /* Initializing */
    ) {
        mapping.set(node[7
        /* index */
        ] = override, node);
        count = Math.max(count, override);
      }

    return override;
  }
  /**
   * Stores a node in mapping, and makes the index available on the Node directly.
   * @param node Node to store and modify with index
   * @return index Node was stored with in mapping
   */

  function store(node) {
    if (node[7
    /* index */
    ] !== undefined) {
      return node[7
      /* index */
      ];
    }

    mapping.set(node[7
    /* index */
    ] = ++count, node);

    if (phase > 0
    /* Initializing */
    ) {
        // After Initialization, include all future dom node creation into the list for next transfer.
        transfer.push(node);
      }

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
    var copy = transfer;
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
  var count$1 = 0;
  var transfer$1 = [];
  var mapping$1 = new Map();
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

    mapping$1.set(value, count$1);
    transfer$1.push(value);
    return count$1++;
  }
  /**
   * Returns strings registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume$1() {
    var strings = transfer$1;
    transfer$1 = [];
    return strings;
  }

  var pending = false;
  var pendingMutations = [];
  function transfer$2(document, mutation) {
    if (phase > 0
    /* Initializing */
    && document[58
    /* allowTransfer */
    ]) {
      pending = true;
      pendingMutations = pendingMutations.concat(mutation);
      Promise.resolve().then(function (_) {
        if (pending) {
          var _document$postMessage;

          var nodes = new Uint16Array(consume().reduce(function (acc, node) {
            return acc.concat(node[8
            /* creationFormat */
            ]);
          }, [])).buffer;
          var mutations = new Uint16Array(pendingMutations).buffer;
          document.postMessage((_document$postMessage = {}, _defineProperty(_document$postMessage, 54
          /* phase */
          , phase), _defineProperty(_document$postMessage, 12
          /* type */
          , phase === 2
          /* Mutating */
          ? 3
          /* MUTATE */
          : 2), _defineProperty(_document$postMessage, 37
          /* nodes */
          , nodes), _defineProperty(_document$postMessage, 41
          /* strings */
          , consume$1()), _defineProperty(_document$postMessage, 36
          /* mutations */
          , mutations), _document$postMessage), [nodes, mutations]);
          pendingMutations = [];
          pending = false;
          set(2
          /* Mutating */
          );
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
  var _a;
  var observers = [];
  var pendingMutations$1 = false;

  var match = function match(observerTarget, target) {
    return observerTarget !== null && target[7
    /* index */
    ] === observerTarget[7
    /* index */
    ];
  };

  var pushMutation = function pushMutation(observer, record) {
    observer.pushRecord(record);

    if (!pendingMutations$1) {
      pendingMutations$1 = true;
      Promise.resolve().then(function () {
        pendingMutations$1 = false;
        observers.forEach(function (observer) {
          return observer.callback(observer.takeRecords());
        });
      });
    }
  };
  /**
   * When DOM mutations occur, Nodes will call this method with MutationRecords
   * These records are then pushed into MutationObserver instances that match the MutationRecord.target
   * @param record MutationRecord to push into MutationObservers.
   */


  function mutate(document, record, transferable) {
    transfer$2(document, transferable);
    observers.forEach(function (observer) {
      var target = record.target;

      do {
        if (match(observer.target, target)) {
          pushMutation(observer, record);
          break;
        }
      } while (target = target.parentNode);
    });
  }
  var MutationObserver =
  /*#__PURE__*/
  function () {
    function MutationObserver(callback) {
      _classCallCheck(this, MutationObserver);

      this[_a] = [];
      this.callback = callback;
    }
    /**
     * Register the MutationObserver instance to observe a Nodes mutations.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @param target Node to observe DOM mutations
     */


    _createClass(MutationObserver, [{
      key: "observe",
      value: function observe(target, options) {
        this.disconnect();
        this.target = target;
        this.options = options || {};
        observers.push(this);
      }
      /**
       * Stop the MutationObserver instance from observing a Nodes mutations.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
       */

    }, {
      key: "disconnect",
      value: function disconnect() {
        this.target = null;
        var index = observers.indexOf(this);

        if (index >= 0) {
          observers.splice(index, 1);
        }
      }
      /**
       * Empties the MutationObserver instance's record queue and returns what was in there.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
       * @return Mutation Records stored on this MutationObserver instance.
       */

    }, {
      key: "takeRecords",
      value: function takeRecords() {
        return this[42
        /* records */
        ].splice(0, this[42
        /* records */
        ].length);
      }
      /**
       * NOTE: This method doesn't exist on native MutationObserver.
       * @param record MutationRecord to store for this instance.
       */

    }, {
      key: "pushRecord",
      value: function pushRecord(record) {
        this[42
        /* records */
        ].push(record);
      }
    }]);

    return MutationObserver;
  }();
  _a = 42
  /* records */
  ;

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
  var _a$1;
  /**
   * Propagates a property change for a Node to itself and all childNodes.
   * @param node Node to start applying change to
   * @param property Property to modify
   * @param value New value to apply
   */

  var propagate = function propagate(node, property, value) {
    node[property] = value;
    node.childNodes.forEach(function (child) {
      return propagate(child, property, value);
    });
  }; // https://developer.mozilla.org/en-US/docs/Web/API/Node
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  //
  // Please note, in this implmentation Node doesn't extend EventTarget.
  // This is intentional to reduce the number of classes.

  var Node =
  /*#__PURE__*/
  function () {
    function Node(nodeType, nodeName, ownerDocument, overrideIndex) {
      _classCallCheck(this, Node);

      this.childNodes = [];
      this.parentNode = null;
      this.isConnected = false;
      this[_a$1] = {};
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.ownerDocument = ownerDocument || this;
      this[45
      /* scopingRoot */
      ] = this;
      this[7
      /* index */
      ] = overrideIndex ? storeOverride(this, overrideIndex) : store(this);
      this[9
      /* transferredFormat */
      ] = [this[7
      /* index */
      ]];
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


    _createClass(Node, [{
      key: "getTextContent",

      /**
       * Use `this.getTextContent()` instead of `super.textContent` to avoid incorrect or expensive ES5 transpilation.
       */
      value: function getTextContent() {
        var textContent = '';
        var childNodes = this.childNodes;

        if (childNodes.length) {
          childNodes.forEach(function (childNode) {
            return textContent += childNode.textContent;
          });
          return textContent;
        }

        return '';
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
       * @return Node's first child in the tree, or null if the node has no children.
       */

    }, {
      key: "hasChildNodes",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/hasChildNodes
       * @return boolean if the Node has childNodes.
       */
      value: function hasChildNodes() {
        return this.childNodes.length > 0;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
       * @param otherNode
       * @return whether a Node is a descendant of a given Node
       */

    }, {
      key: "contains",
      value: function contains(otherNode) {
        if (otherNode === this) {
          return true;
        }

        if (this.childNodes.length > 0) {
          if (this.childNodes.includes(this)) {
            return true;
          }

          return this.childNodes.some(function (child) {
            return child.contains(otherNode);
          });
        }

        return false;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
       * @param child
       * @param referenceNode
       * @return child after it has been inserted.
       */

    }, {
      key: "insertBefore",
      value: function insertBefore(child, referenceNode) {
        var _this = this;

        if (child === null || child === this) {
          // The new child cannot contain the parent.
          return child;
        }

        if (child.nodeType === 11
        /* DOCUMENT_FRAGMENT_NODE */
        ) {
            child.childNodes.slice().forEach(function (node) {
              return _this.insertBefore(node, referenceNode);
            });
          } else if (referenceNode == null) {
          // When a referenceNode is not valid, appendChild(child).
          return this.appendChild(child);
        } else if (this.childNodes.indexOf(referenceNode) >= 0) {
          // Should only insertBefore direct children of this Node.
          child.remove(); // Removing a child can cause this.childNodes to change, meaning we need to splice from its updated location.

          this.childNodes.splice(this.childNodes.indexOf(referenceNode), 0, child);
          this[56
          /* insertedNode */
          ](child);
          mutate(this.ownerDocument, {
            addedNodes: [child],
            nextSibling: referenceNode,
            type: 2
            /* CHILD_LIST */
            ,
            target: this
          }, [2
          /* CHILD_LIST */
          , this[7
          /* index */
          ], referenceNode[7
          /* index */
          ], 0, 1, 0, child[7
          /* index */
          ]]);
          return child;
        }

        return null;
      }
      /**
       * When a Node is inserted, this method is called (and can be extended by other classes)
       * @param child
       */

    }, {
      key: (_a$1 = 10
      /* handlers */
      , 56
      /* insertedNode */
      ),
      value: function value(child) {
        child.parentNode = this;
        propagate(child, 'isConnected', this.isConnected);
        propagate(child, 45
        /* scopingRoot */
        , this[45
        /* scopingRoot */
        ]);
      }
      /**
       * When a node is removed, this method is called (and can be extended by other classes)
       * @param child
       */

    }, {
      key: 57
      /* removedNode */
      ,
      value: function value(child) {
        child.parentNode = null;
        propagate(child, 'isConnected', false);
        propagate(child, 45
        /* scopingRoot */
        , child);
      }
      /**
       * Adds the specified childNode argument as the last child to the current node.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
       * @param child Child Node to append to this Node.
       * @return Node the appended node.
       */

    }, {
      key: "appendChild",
      value: function appendChild(child) {
        if (child.nodeType === 11
        /* DOCUMENT_FRAGMENT_NODE */
        ) {
            child.childNodes.slice().forEach(this.appendChild, this);
          } else {
          child.remove();
          this.childNodes.push(child);
          this[56
          /* insertedNode */
          ](child);
          var previousSibling = this.childNodes[this.childNodes.length - 2];
          mutate(this.ownerDocument, {
            addedNodes: [child],
            previousSibling: previousSibling,
            type: 2
            /* CHILD_LIST */
            ,
            target: this
          }, [2
          /* CHILD_LIST */
          , this[7
          /* index */
          ], 0, previousSibling ? previousSibling[7
          /* index */
          ] : 0, 1, 0, child[7
          /* index */
          ]]);
        }

        return child;
      }
      /**
       * Removes a child node from the current element.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
       * @param child Child Node to remove from this Node.
       * @return Node removed from the tree or null if the node wasn't attached to this tree.
       */

    }, {
      key: "removeChild",
      value: function removeChild(child) {
        var index = this.childNodes.indexOf(child);
        var exists = index >= 0;

        if (exists) {
          this.childNodes.splice(index, 1);
          this[57
          /* removedNode */
          ](child);
          mutate(this.ownerDocument, {
            removedNodes: [child],
            type: 2
            /* CHILD_LIST */
            ,
            target: this
          }, [2
          /* CHILD_LIST */
          , this[7
          /* index */
          ], 0, 0, 0, 1, child[7
          /* index */
          ]]);
          return child;
        }

        return null;
      }
      /**
       * @param newChild
       * @param oldChild
       * @return child that was replaced.
       * @note `HierarchyRequestError` not handled e.g. newChild is an ancestor of current node.
       * @see https://dom.spec.whatwg.org/#concept-node-replace
       */

    }, {
      key: "replaceChild",
      value: function replaceChild(newChild, oldChild) {
        if (newChild === oldChild || // In DOM, this throws DOMException: "The node to be replaced is not a child of this node."
        oldChild.parentNode !== this || // In DOM, this throws DOMException: "The new child element contains the parent."
        newChild.contains(this)) {
          return oldChild;
        } // If newChild already exists in the DOM, it is first removed.
        // TODO: Consider using a mutation-free API here to avoid two mutations
        // per replaceChild() call.


        newChild.remove();
        var index = this.childNodes.indexOf(oldChild);
        this.childNodes.splice(index, 1, newChild);
        this[57
        /* removedNode */
        ](oldChild);
        this[56
        /* insertedNode */
        ](newChild);
        mutate(this.ownerDocument, {
          addedNodes: [newChild],
          removedNodes: [oldChild],
          type: 2
          /* CHILD_LIST */
          ,
          nextSibling: this.childNodes[index + 1],
          target: this
        }, [2
        /* CHILD_LIST */
        , this[7
        /* index */
        ], this.childNodes[index + 1] ? this.childNodes[index + 1][7
        /* index */
        ] : 0, 0, 1, 1, newChild[7
        /* index */
        ], oldChild[7
        /* index */
        ]]);
        return oldChild;
      }
      /**
       * Removes this Node from the tree it belogs too.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
       */

    }, {
      key: "remove",
      value: function remove() {
        this.parentNode && this.parentNode.removeChild(this);
      }
      /**
       * Add an event listener to callback when a specific event type is dispatched.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
       * @param type Event Type (i.e 'click')
       * @param handler Function called when event is dispatched.
       */

    }, {
      key: "addEventListener",
      value: function addEventListener(type, handler) {
        var lowerType = toLower(type);
        var storedType = store$1(lowerType);
        var handlers = this[10
        /* handlers */
        ][lowerType];
        var index = 0;

        if (handlers) {
          index = handlers.push(handler);
        } else {
          this[10
          /* handlers */
          ][lowerType] = [handler];
        }

        transfer$2(this.ownerDocument, [4
        /* EVENT_SUBSCRIPTION */
        , this[7
        /* index */
        ], 0, 1, storedType, index]);
      }
      /**
       * Remove a registered event listener for a specific event type.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
       * @param type Event Type (i.e 'click')
       * @param handler Function to stop calling when event is dispatched.
       */

    }, {
      key: "removeEventListener",
      value: function removeEventListener(type, handler) {
        var lowerType = toLower(type);
        var handlers = this[10
        /* handlers */
        ][lowerType];
        var index = !!handlers ? handlers.indexOf(handler) : -1;

        if (index >= 0) {
          handlers.splice(index, 1);
          transfer$2(this.ownerDocument, [4
          /* EVENT_SUBSCRIPTION */
          , this[7
          /* index */
          ], 1, 0, store$1(lowerType), index]);
        }
      }
      /**
       * Dispatch an event for this Node.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
       * @param event Event to dispatch to this node and potentially cascade to parents.
       */

    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        var target = event.currentTarget = this;
        var handlers;
        var iterator;

        do {
          handlers = target && target[10
          /* handlers */
          ] && target[10
          /* handlers */
          ][toLower(event.type)];

          if (handlers) {
            for (iterator = handlers.length; iterator--;) {
              if ((handlers[iterator].call(target, event) === false || event[51
              /* end */
              ]) && event.cancelable) {
                break;
              }
            }
          }
        } while (event.bubbles && !(event.cancelable && event[50
        /* stop */
        ]) && (target = target && target.parentNode));

        return !event.defaultPrevented;
      }
    }, {
      key: "textContent",
      get: function get() {
        return this.getTextContent();
      }
    }, {
      key: "firstChild",
      get: function get() {
        return this.childNodes[0] || null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild
       * @return The last child of a node, or null if there are no child elements.
       */

    }, {
      key: "lastChild",
      get: function get() {
        return this.childNodes[this.childNodes.length - 1] || null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
       * @return node immediately following the specified one in it's parent's childNodes, or null if one doesn't exist.
       */

    }, {
      key: "nextSibling",
      get: function get() {
        if (this.parentNode === null) {
          return null;
        }

        var parentChildNodes = this.parentNode.childNodes;
        return parentChildNodes[parentChildNodes.indexOf(this) + 1] || null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling
       * @return node immediately preceding the specified one in its parent's childNodes, or null if the specified node is the first in that list.
       */

    }, {
      key: "previousSibling",
      get: function get() {
        if (this.parentNode === null) {
          return null;
        }

        var parentChildNodes = this.parentNode.childNodes;
        return parentChildNodes[parentChildNodes.indexOf(this) - 1] || null;
      }
    }]);

    return Node;
  }();

  /*
  Normally ParentNode is implemented as a mixin, but since the Node class is an abstract
  this makes it hard to build a mixin that recieves a base of the representations of Node needing
  the mixed in functionality.

  // Partially implemented Mixin Methods
  // Both Element.querySelector() and Element.querySelector() are only implemented for the following simple selectors:
  // - Element selectors
  // - ID selectors
  // - Class selectors
  // - Attribute selectors
  // Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
  // Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
  */

  var ParentNode =
  /*#__PURE__*/
  function (_Node) {
    _inherits(ParentNode, _Node);

    function ParentNode() {
      _classCallCheck(this, ParentNode);

      return _possibleConstructorReturn(this, _getPrototypeOf(ParentNode).apply(this, arguments));
    }

    _createClass(ParentNode, [{
      key: "querySelector",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
       * @param selector the selector we are trying to match for.
       * @return Element with matching selector.
       */
      value: function querySelector(selector) {
        var matches = _querySelectorAll(this, selector);

        return matches ? matches[0] : null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
       * @param selector the selector we are trying to match for.
       * @return Elements with matching selector.
       */

    }, {
      key: "querySelectorAll",
      value: function querySelectorAll(selector) {
        return _querySelectorAll(this, selector);
      }
    }, {
      key: "children",

      /**
       * Getter returning children of an Element that are Elements themselves.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
       * @return Element objects that are children of this ParentNode, omitting all of its non-element nodes.
       */
      get: function get() {
        return this.childNodes.filter(elementPredicate);
      }
      /**
       * Getter returning the number of child elements of a Element.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/childElementCount
       * @return number of child elements of the given Element.
       */

    }, {
      key: "childElementCount",
      get: function get() {
        return this.children.length;
      }
      /**
       * Getter returning the first Element in Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/firstElementChild
       * @return first childNode that is also an element.
       */

    }, {
      key: "firstElementChild",
      get: function get() {
        return this.childNodes.find(elementPredicate) || null;
      }
      /**
       * Getter returning the last Element in Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/lastElementChild
       * @return first childNode that is also an element.
       */

    }, {
      key: "lastElementChild",
      get: function get() {
        var children = this.children;
        return children[children.length - 1] || null;
      }
    }]);

    return ParentNode;
  }(Node);
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
   * @param node the node to filter results under.
   * @param selector the selector we are trying to match for.
   * @return Element with matching selector.
   */

  function _querySelectorAll(node, selector) {
    // As per spec: https://dom.spec.whatwg.org/#scope-match-a-selectors-string
    // First, parse the selector
    var selectorBracketIndexes = [selector.indexOf('['), selector.indexOf(']')];
    var selectorHasAttr = containsIndexOf(selectorBracketIndexes[0]) && containsIndexOf(selectorBracketIndexes[1]);
    var elementSelector = selectorHasAttr ? selector.substring(0, selectorBracketIndexes[0]) : selector;
    var attrSelector = selectorHasAttr ? selector.substring(selectorBracketIndexes[0], selectorBracketIndexes[1] + 1) : null; // TODO(nainar): Parsing selectors is needed when we add in more complex selectors.
    // Second, find all the matching elements on the Document

    var matcher;

    if (selector[0] === '[') {
      matcher = function matcher(element) {
        return matchAttrReference(selector, element);
      };
    } else if (elementSelector[0] === '#') {
      matcher = selectorHasAttr ? function (element) {
        return element.id === elementSelector.substr(1) && matchAttrReference(attrSelector, element);
      } : function (element) {
        return element.id === elementSelector.substr(1);
      };
    } else if (elementSelector[0] === '.') {
      matcher = selectorHasAttr ? function (element) {
        return element.classList.contains(elementSelector.substr(1)) && matchAttrReference(attrSelector, element);
      } : function (element) {
        return element.classList.contains(elementSelector.substr(1));
      };
    } else {
      matcher = selectorHasAttr ? function (element) {
        return element.localName === toLower(elementSelector) && matchAttrReference(attrSelector, element);
      } : function (element) {
        return element.localName === toLower(elementSelector);
      };
    } // Third, filter to return elements that exist within the querying element's descendants.


    return matcher ? matchChildrenElements(node[45
    /* scopingRoot */
    ], matcher).filter(function (element) {
      return node !== element && node.contains(element);
    }) : [];
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
  var _a$2;
  var DOMTokenList =
  /*#__PURE__*/
  function () {
    /**
     * The DOMTokenList interface represents a set of space-separated tokens.
     * It is indexed beginning with 0 as with JavaScript Array objects and is case-sensitive.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
     * @param defineOn Element or class extension to define getter/setter pair for token list access.
     * @param target Specific Element instance to modify when value is changed.
     * @param attributeName Name of the attribute used by Element to access DOMTokenList.
     * @param accessorKey Key used to access DOMTokenList directly from specific element.
     * @param propertyName Key used to access DOMTokenList as string getter/setter.
     */
    function DOMTokenList(defineOn, target, attributeName, accessorKey, propertyName) {
      var _this = this;

      _classCallCheck(this, DOMTokenList);

      this[_a$2] = [];
      this[13
      /* target */
      ] = target;
      this[18
      /* attributeName */
      ] = attributeName;
      this[44
      /* storeAttribute */
      ] = target[44
      /* storeAttribute */
      ].bind(target);
      target[46
      /* propertyBackedAttributes */
      ][attributeName] = [function () {
        return _this.value;
      }, function (value) {
        return _this.value = value;
      }];

      if (accessorKey && propertyName) {
        Object.defineProperty(defineOn.prototype, propertyName, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return this[accessorKey].value;
          },
          set: function set(value) {
            this[accessorKey].value = value;
          }
        });
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
     * @return string representation of tokens (space delimitted).
     */


    _createClass(DOMTokenList, [{
      key: "item",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/item
       * @param index number from DOMTokenList entities to retrieve value of
       * @return value stored at the index requested, or undefined if beyond known range.
       */
      value: function item(index) {
        return this[43
        /* tokens */
        ][index];
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains
       * @param token value the DOMTokenList is tested for.
       * @return boolean indicating if the token is contained by the DOMTokenList.
       */

    }, {
      key: "contains",
      value: function contains(token) {
        return this[43
        /* tokens */
        ].includes(token);
      }
      /**
       * Add a token or tokens to the list.
       * Note: All duplicates are removed, and the first token's position with the value is preserved.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add
       * @param tokens each token is a string to add to a TokenList.
       */

    }, {
      key: "add",
      value: function add() {
        var _this$;

        var oldValue = this.value;

        for (var _len = arguments.length, tokens = new Array(_len), _key = 0; _key < _len; _key++) {
          tokens[_key] = arguments[_key];
        }

        (_this$ = this[43
        /* tokens */
        ]).splice.apply(_this$, [0, this[43
        /* tokens */
        ].length].concat(_toConsumableArray(new Set(this[43
        /* tokens */
        ].concat(tokens)))));

        this.mutated(oldValue, this.value);
      }
      /**
       * Remove a token or tokens from the list.
       * Note: All duplicates are removed, and the first token's position with the value is preserved.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove
       * @param tokens each token is a string to remove from a TokenList.
       */

    }, {
      key: "remove",
      value: function remove() {
        var _this$2;

        for (var _len2 = arguments.length, tokens = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          tokens[_key2] = arguments[_key2];
        }

        var oldValue = this.value;

        (_this$2 = this[43
        /* tokens */
        ]).splice.apply(_this$2, [0, this[43
        /* tokens */
        ].length].concat(_toConsumableArray(new Set(this[43
        /* tokens */
        ].filter(function (token) {
          return !tokens.includes(token);
        })))));

        this.mutated(oldValue, this.value);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace
       * @param token
       * @param newToken
       */

    }, {
      key: "replace",
      value: function replace(token, newToken) {
        var _this$3;

        if (!this[43
        /* tokens */
        ].includes(token)) {
          return;
        }

        var oldValue = this.value;
        var set = new Set(this[43
        /* tokens */
        ]);

        if (token !== newToken) {
          set.delete(token);

          if (newToken !== '') {
            set.add(newToken);
          }
        }

        (_this$3 = this[43
        /* tokens */
        ]).splice.apply(_this$3, [0, this[43
        /* tokens */
        ].length].concat(_toConsumableArray(set)));

        this.mutated(oldValue, this.value);
      }
      /**
       * Adds or removes a token based on its presence in the token list.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
       * @param token string to add or remove from the token list
       * @param force changes toggle into a one way-only operation. true => token added. false => token removed.
       * @return true if the token is in the list following mutation, false if not.
       */

    }, {
      key: "toggle",
      value: function toggle(token, force) {
        if (!this[43
        /* tokens */
        ].includes(token)) {
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

    }, {
      key: "mutated",
      value: function mutated(oldValue, value) {
        this[44
        /* storeAttribute */
        ](this[13
        /* target */
        ].namespaceURI, this[18
        /* attributeName */
        ], value);
        mutate(this[13
        /* target */
        ].ownerDocument, {
          type: 0
          /* ATTRIBUTES */
          ,
          target: this[13
          /* target */
          ],
          attributeName: this[18
          /* attributeName */
          ],
          value: value,
          oldValue: oldValue
        }, [0
        /* ATTRIBUTES */
        , this[13
        /* target */
        ][7
        /* index */
        ], store$1(this[18
        /* attributeName */
        ]), 0, value !== null ? store$1(value) + 1 : 0]);
      }
    }, {
      key: "value",
      get: function get() {
        return this[43
        /* tokens */
        ].join(' ');
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/length
       * @return integer representing the number of objects stored in the object.
       */
      ,

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
       * @param collection String of values space delimited to replace the current DOMTokenList with.
       */
      set: function set(collection) {
        var _this$4;

        var oldValue = this.value;
        var newValue = collection.trim(); // Replace current tokens with new tokens.

        (_this$4 = this[43
        /* tokens */
        ]).splice.apply(_this$4, [0, this[43
        /* tokens */
        ].length].concat(_toConsumableArray(newValue !== '' ? newValue.split(/\s+/) : '')));

        this.mutated(oldValue, newValue);
      }
    }, {
      key: "length",
      get: function get() {
        return this[43
        /* tokens */
        ].length;
      }
    }]);

    return DOMTokenList;
  }();
  _a$2 = 43
  /* tokens */
  , 44
  /* storeAttribute */
  ;

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
  var toString = function toString(attributes) {
    return attributes.map(function (attr) {
      return keyValueString(attr.name, attr.value);
    }).join(' ');
  };
  var matchPredicate = function matchPredicate(namespaceURI, name) {
    return function (attr) {
      return attr.namespaceURI === namespaceURI && attr.name === name;
    };
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
  var _a$3;

  var hyphenateKey = function hyphenateKey(key) {
    return toLower(key.replace(/(webkit|ms|moz|khtml)/g, '-$1').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-'));
  };

  var appendKeys = function appendKeys(keys) {
    var keysToAppend = keys.filter(function (key) {
      return isNaN(key) && !CSSStyleDeclaration.prototype.hasOwnProperty(key);
    });

    if (keysToAppend.length <= 0) {
      return;
    }

    var previousPrototypeLength = CSSStyleDeclaration.prototype.length || 0;

    if (previousPrototypeLength !== 0) {
      CSSStyleDeclaration.prototype.length = previousPrototypeLength + keysToAppend.length;
    } else {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'length', {
        configurable: true,
        writable: true,
        value: keysToAppend.length
      });
    }

    keysToAppend.forEach(function (key, index) {
      var hyphenatedKey = hyphenateKey(key);
      CSSStyleDeclaration.prototype[index + previousPrototypeLength] = hyphenatedKey;
      Object.defineProperties(CSSStyleDeclaration.prototype, _defineProperty({}, key, {
        get: function get() {
          return this.getPropertyValue(hyphenatedKey);
        },
        set: function set(value) {
          this.setProperty(hyphenatedKey, value);
        }
      }));
    });
  };
  var CSSStyleDeclaration =
  /*#__PURE__*/
  function () {
    function CSSStyleDeclaration(target) {
      var _this = this;

      _classCallCheck(this, CSSStyleDeclaration);

      this[_a$3] = {};
      this[44
      /* storeAttribute */
      ] = target[44
      /* storeAttribute */
      ].bind(target);
      this[13
      /* target */
      ] = target;

      if (target && target[46
      /* propertyBackedAttributes */
      ]) {
        target[46
        /* propertyBackedAttributes */
        ].style = [function () {
          return _this.cssText;
        }, function (value) {
          return _this.cssText = value;
        }];
      }
    }
    /**
     * Retrieve the value for a given property key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue
     * @param key the name of the property to retrieve the value for.
     * @return value stored for the provided key.
     */


    _createClass(CSSStyleDeclaration, [{
      key: "getPropertyValue",
      value: function getPropertyValue(key) {
        return this[3
        /* properties */
        ][key] || '';
      }
      /**
       * Remove a value for a given property key.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty
       * @param key the name of the property to retrieve the value for.
       * @return previously stored value for the provided key.
       */

    }, {
      key: "removeProperty",
      value: function removeProperty(key) {
        var oldValue = this.getPropertyValue(key);
        this[3
        /* properties */
        ][key] = null;
        this.mutated(this.cssText);
        return oldValue;
      }
      /**
       * Stores a given value for the provided key.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty
       * @param key modify this key
       * @param value store this value
       */

    }, {
      key: "setProperty",
      value: function setProperty(key, value) {
        this[3
        /* properties */
        ][key] = value;
        this.mutated(this.cssText);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
       * @return css text string representing known and valid style declarations.
       */

    }, {
      key: "mutated",

      /**
       * Report CSSStyleDeclaration mutations to MutationObserver.
       * @param value value after mutation
       * @private
       */
      value: function mutated(value) {
        var oldValue = this[44
        /* storeAttribute */
        ](this[13
        /* target */
        ].namespaceURI, 'style', value);
        mutate(this[13
        /* target */
        ].ownerDocument, {
          type: 0
          /* ATTRIBUTES */
          ,
          target: this[13
          /* target */
          ],
          attributeName: 'style',
          value: value,
          oldValue: oldValue
        }, [0
        /* ATTRIBUTES */
        , this[13
        /* target */
        ][7
        /* index */
        ], store$1('style'), 0, value !== null ? store$1(value) + 1 : 0]);
      }
    }, {
      key: "cssText",
      get: function get() {
        var value;
        var returnValue = '';

        for (var key in this[3
        /* properties */
        ]) {
          if ((value = this.getPropertyValue(key)) !== '') {
            returnValue += "".concat(key, ": ").concat(value, "; ");
          }
        }

        return returnValue.trim();
      }
      /**
       * Replace all style declarations with new values parsed from a cssText string.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
       * @param value css text string to parse and store
       */
      ,
      set: function set(value) {
        // value should have an "unknown" type but get/set can't have different types.
        // https://github.com/Microsoft/TypeScript/issues/2521
        var stringValue = typeof value === 'string' ? value : '';
        this[3
        /* properties */
        ] = {};
        var values = stringValue.split(/[:;]/);
        var length = values.length;

        for (var index = 0; index + 1 < length; index += 2) {
          this[3
          /* properties */
          ][toLower(values[index].trim())] = values[index + 1].trim();
        }

        this.mutated(this.cssText);
      }
    }]);

    return CSSStyleDeclaration;
  }();
  _a$3 = 3
  /* properties */
  , 13
  /* target */
  ;

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
  // TODO: Do enumerated attributes with non-boolean properties exist?

  var reflectProperties = function reflectProperties(properties, defineOn) {
    properties.forEach(function (pair) {
      var _loop = function _loop(property) {
        var _pair$property = pair[property],
            defaultValue = _pair$property[0],
            _pair$property$ = _pair$property[1],
            attributeName = _pair$property$ === void 0 ? toLower(property) : _pair$property$,
            keywords = _pair$property[2]; // Boolean attributes only care about presence, not attribute value.
        // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

        var isBooleanAttribute = typeof defaultValue === 'boolean';
        Object.defineProperty(defineOn.prototype, property, {
          enumerable: true,
          get: function get() {
            var element = this;
            var attributeValue = element.getAttribute(attributeName);

            if (keywords) {
              return element.hasAttribute(attributeName) ? attributeValue === keywords[0] : defaultValue;
            }

            if (isBooleanAttribute) {
              return element.hasAttribute(attributeName);
            }

            var castableValue = attributeValue || defaultValue;
            return typeof defaultValue === 'number' ? Number(castableValue) : String(castableValue);
          },
          set: function set(value) {
            var element = this;

            if (keywords) {
              element.setAttribute(attributeName, value ? keywords[0] : keywords[1]);
            } else if (isBooleanAttribute) {
              value ? element.setAttribute(attributeName, '') : element.removeAttribute(attributeName);
            } else {
              element.setAttribute(attributeName, String(value));
            }
          }
        });
      };

      for (var property in pair) {
        _loop(property);
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
  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  function arr_back(arr) {
    return arr[arr.length - 1];
  } // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name


  var kMarkupPattern = /<!--([^]*)-->|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/gi; // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2

  var kAttributePattern = /(^|\s)([^\s"'>\/=]+)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/gi;
  var kSelfClosingElements = {
    AREA: true,
    BASE: true,
    BR: true,
    COL: true,
    HR: true,
    IMG: true,
    INPUT: true,
    LINK: true,
    META: true,
    PARAM: true,
    SOURCE: true,
    TRACK: true,
    WBR: true
  };
  var kElementsClosedByOpening = {
    LI: {
      LI: true
    },
    DT: {
      DT: true,
      DD: true
    },
    DD: {
      DD: true,
      DT: true
    },
    P: {
      ADDRESS: true,
      ARTICLE: true,
      ASIDE: true,
      BLOCKQUOTE: true,
      DETAILS: true,
      DIV: true,
      DL: true,
      FIELDSET: true,
      FIGCAPTION: true,
      FIGURE: true,
      FOOTER: true,
      FORM: true,
      H1: true,
      H2: true,
      H3: true,
      H4: true,
      H5: true,
      H6: true,
      HEADER: true,
      HR: true,
      MAIN: true,
      NAV: true,
      OL: true,
      P: true,
      PRE: true,
      SECTION: true,
      TABLE: true,
      UL: true
    },
    RT: {
      RT: true,
      RP: true
    },
    RP: {
      RT: true,
      RP: true
    },
    OPTGROUP: {
      OPTGROUP: true
    },
    OPTION: {
      OPTION: true,
      OPTGROUP: true
    },
    THEAD: {
      TBODY: true,
      TFOOT: true
    },
    TBODY: {
      TBODY: true,
      TFOOT: true
    },
    TR: {
      TR: true
    },
    TD: {
      TD: true,
      TH: true
    },
    TH: {
      TD: true,
      TH: true
    }
  };
  var kElementsClosedByClosing = {
    LI: {
      UL: true,
      OL: true
    },
    A: {
      DIV: true
    },
    B: {
      DIV: true
    },
    I: {
      DIV: true
    },
    P: {
      DIV: true
    },
    TD: {
      TR: true,
      TABLE: true
    },
    TH: {
      TR: true,
      TABLE: true
    }
  };
  var kBlockTextElements = {
    SCRIPT: true,
    NOSCRIPT: true,
    STYLE: true,
    PRE: true
  };
  /**
   * Parses HTML and returns a root element
   * Parse a chuck of HTML source.
   * @param  {string} data HTML in string format.
   * @param {!Element} root The element to use as root.
   * @return {Element}      root element
   */

  function parse(data, rootElement) {
    var ownerDocument = rootElement.ownerDocument;
    var root = ownerDocument.createElementNS(rootElement.namespaceURI, rootElement.localName);
    var currentParent = root;
    var currentNamespace = root.namespaceURI;
    var stack = [root];
    var lastTextPos = 0;
    var match;
    data = '<q>' + data + '</q>';
    var tagsClosed = [];

    if (currentNamespace !== SVG_NAMESPACE && currentNamespace !== HTML_NAMESPACE) {
      throw new Error('Namespace not supported: ' + currentNamespace);
    }

    while (match = kMarkupPattern.exec(data)) {
      var commentContents = match[1]; // <!--contents-->

      var beginningSlash = match[2]; // ... </ ...

      var tagName = match[3];
      var matchAttributes = match[4];
      var endSlash = match[5]; // ... /> ...

      if (lastTextPos < match.index) {
        // if has content
        var text = data.slice(lastTextPos, match.index);
        currentParent.appendChild(ownerDocument.createTextNode(text));
      }

      lastTextPos = kMarkupPattern.lastIndex;

      if (commentContents !== undefined) {
        // this is a comment
        currentParent.appendChild(ownerDocument.createComment(commentContents));
        continue;
      }

      var normalizedTagName = tagName.toUpperCase();

      if (normalizedTagName === 'SVG') {
        currentNamespace = beginningSlash ? HTML_NAMESPACE : SVG_NAMESPACE;
      }

      if (!beginningSlash) {
        // not </ tags
        if (!endSlash && kElementsClosedByOpening[currentParent.tagName]) {
          if (kElementsClosedByOpening[currentParent.tagName][normalizedTagName]) {
            stack.pop();
            currentParent = arr_back(stack);
          }
        }

        var childToAppend = ownerDocument.createElementNS(currentNamespace, currentNamespace === HTML_NAMESPACE ? toLower(tagName) : tagName);

        for (var attMatch; attMatch = kAttributePattern.exec(matchAttributes);) {
          var attrName = attMatch[2];
          var attrValue = attMatch[4] || attMatch[5] || attMatch[6];
          childToAppend.setAttribute(attrName, attrValue);
        }

        currentParent = currentParent.appendChild(childToAppend);
        stack.push(currentParent);

        if (kBlockTextElements[normalizedTagName]) {
          // a little test to find next </script> or </style> ...
          var closeMarkup = '</' + toLower(normalizedTagName) + '>';
          var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);

          if (index == -1) {
            throw new Error('Close markup not found.');
          } else {
            kMarkupPattern.lastIndex = index;
          }
        }
      }

      if (tagName === 'foreignObject') {
        currentNamespace = beginningSlash ? SVG_NAMESPACE : HTML_NAMESPACE;
      }

      if (beginningSlash || endSlash || kSelfClosingElements[normalizedTagName]) {
        // </ or /> or <br> etc.
        while (true) {
          if (stack.length <= 1) {
            break;
          }

          if (currentParent.nodeName.toUpperCase() == normalizedTagName) {
            stack.pop();
            currentParent = arr_back(stack);
            break;
          } else {
            // Trying to close current tag, and move on
            if (kElementsClosedByClosing[currentParent.tagName]) {
              if (kElementsClosedByClosing[currentParent.tagName][normalizedTagName]) {
                stack.pop();
                currentParent = arr_back(stack);
                continue;
              }
            } // Use aggressive strategy to handle unmatching markups.


            break;
          }
        }
      }
    }

    for (var _i = 0, _stack = stack; _i < _stack.length; _i++) {
      var node = _stack[_i];

      if (tagsClosed[tagsClosed.length - 1] == node.nodeName) {
        stack.pop();
        tagsClosed.pop();
        currentParent = arr_back(stack);
      } else break;
    }

    var valid = stack.length === 1;

    if (!valid) {
      throw new Error('Attempting to parse invalid HTML content.');
    }

    var wrapper = root.firstChild;

    if (wrapper) {
      wrapper.parentNode = null;
      wrapper.childNodes.forEach(function (node) {
        node.parentNode = null;
      });
      return wrapper;
    }

    throw new Error('Attempting to parse invalid HTML.');
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
  var _a$4;
  var NS_NAME_TO_CLASS = {};
  function registerSubclass(localName, subclass) {
    var namespace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : HTML_NAMESPACE;
    var key = "".concat(namespace, ":").concat(localName);
    NS_NAME_TO_CLASS[key] = subclass;
  }
  /**
   * There are six kinds of elements, each having different start/close tag semantics.
   * @see https://html.spec.whatwg.org/multipage/syntax.html#elements-2
   */

  var ElementKind;

  (function (ElementKind) {
    ElementKind[ElementKind["NORMAL"] = 0] = "NORMAL";
    ElementKind[ElementKind["VOID"] = 1] = "VOID"; // The following element kinds have no special handling in worker-dom yet
    // and are lumped into the NORMAL kind.

    /*
    FOREIGN,
    TEMPLATE,
    RAW_TEXT,
    ESCAPABLE_RAW,
    */
  })(ElementKind || (ElementKind = {}));
  /**
   * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
   */


  var VOID_ELEMENTS = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
  var Element =
  /*#__PURE__*/
  function (_ParentNode) {
    _inherits(Element, _ParentNode);

    function Element(nodeType, localName, namespaceURI, ownerDocument, overrideIndex) {
      var _this;

      _classCallCheck(this, Element);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Element).call(this, nodeType, toUpper(localName), ownerDocument, overrideIndex));
      _this.attributes = [];
      _this[_a$4] = {};
      _this.classList = new DOMTokenList(Element, _assertThisInitialized(_this), 'class', 'classList', 'className');
      _this.style = new CSSStyleDeclaration(_assertThisInitialized(_this));
      _this.namespaceURI = namespaceURI || HTML_NAMESPACE;
      _this.localName = localName;
      _this.kind = VOID_ELEMENTS.includes(_this.tagName) ? ElementKind.VOID : ElementKind.NORMAL;
      _this[8
      /* creationFormat */
      ] = [_this[7
      /* index */
      ], _this.nodeType, store$1(_this.localName), 0, _this.namespaceURI === null ? 0 : store$1(_this.namespaceURI)];
      return _this;
    } // Unimplemented properties
    // Element.clientHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
    // Element.clientLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
    // Element.clientTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
    // Element.clientWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
    // set Element.innerHTML – https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
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
    // Element.releasePointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/releasePointerCapture
    // Element.requestFullscreen() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
    // Element.requestPointerLock() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock
    // Element.scrollIntoView() – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    // Element.setCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
    // Element.setPointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // Partially implemented Mixin Methods
    // Both Element.querySelector() and Element.querySelector() are only implemented for the following simple selectors:
    // - Element selectors
    // - ID selectors
    // - Class selectors
    // - Attribute selectors
    // Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
    // Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    // Mixins not implemented
    // Slotable.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Slotable/assignedSlot

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
     * @return string representation of serialized HTML describing the Element and its descendants.
     */


    _createClass(Element, [{
      key: "setAttribute",

      /**
       * Sets the value of an attribute on this element using a null namespace.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
       * @param name attribute name
       * @param value attribute value
       */
      value: function setAttribute(name, value) {
        this.setAttributeNS(HTML_NAMESPACE, name, value);
      }
      /**
       * Get the value of an attribute on this Element with the null namespace.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
       * @param name attribute name
       * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
       */

    }, {
      key: "getAttribute",
      value: function getAttribute(name) {
        return this.getAttributeNS(HTML_NAMESPACE, name);
      }
      /**
       * Remove an attribute from this element in the null namespace.
       *
       * Method returns void, so it is not chainable.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
       * @param name attribute name
       */

    }, {
      key: "removeAttribute",
      value: function removeAttribute(name) {
        this.removeAttributeNS(HTML_NAMESPACE, name);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute
       * @param name attribute name
       * @return Boolean indicating if the element has the specified attribute.
       */

    }, {
      key: "hasAttribute",
      value: function hasAttribute(name) {
        return this.hasAttributeNS(HTML_NAMESPACE, name);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes
       * @return Boolean indicating if the element has any attributes.
       */

    }, {
      key: "hasAttributes",
      value: function hasAttributes() {
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

    }, {
      key: "setAttributeNS",
      value: function setAttributeNS(namespaceURI, name, value) {
        var valueAsString = String(value);

        if (this[46
        /* propertyBackedAttributes */
        ][name] !== undefined) {
          if (!this.attributes.find(matchPredicate(namespaceURI, name))) {
            this.attributes.push({
              namespaceURI: namespaceURI,
              name: name,
              value: valueAsString
            });
          }

          this[46
          /* propertyBackedAttributes */
          ][name][1](valueAsString);
          return;
        }

        var oldValue = this[44
        /* storeAttribute */
        ](namespaceURI, name, valueAsString);
        mutate(this.ownerDocument, {
          type: 0
          /* ATTRIBUTES */
          ,
          target: this,
          attributeName: name,
          attributeNamespace: namespaceURI,
          value: valueAsString,
          oldValue: oldValue
        }, [0
        /* ATTRIBUTES */
        , this[7
        /* index */
        ], store$1(name), store$1(namespaceURI), value !== null ? store$1(valueAsString) + 1 : 0]);
      }
    }, {
      key: (_a$4 = 46
      /* propertyBackedAttributes */
      , 44
      /* storeAttribute */
      ),
      value: function value(namespaceURI, name, _value) {
        var attr = this.attributes.find(matchPredicate(namespaceURI, name));
        var oldValue = attr && attr.value || '';

        if (attr) {
          attr.value = _value;
        } else {
          this.attributes.push({
            namespaceURI: namespaceURI,
            name: name,
            value: _value
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

    }, {
      key: "getAttributeNS",
      value: function getAttributeNS(namespaceURI, name) {
        var attr = this.attributes.find(matchPredicate(namespaceURI, name));

        if (attr) {
          return this[46
          /* propertyBackedAttributes */
          ][name] !== undefined ? this[46
          /* propertyBackedAttributes */
          ][name][0]() : attr.value;
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

    }, {
      key: "removeAttributeNS",
      value: function removeAttributeNS(namespaceURI, name) {
        var index = this.attributes.findIndex(matchPredicate(namespaceURI, name));

        if (index >= 0) {
          var oldValue = this.attributes[index].value;
          this.attributes.splice(index, 1);
          mutate(this.ownerDocument, {
            type: 0
            /* ATTRIBUTES */
            ,
            target: this,
            attributeName: name,
            attributeNamespace: namespaceURI,
            oldValue: oldValue
          }, [0
          /* ATTRIBUTES */
          , this[7
          /* index */
          ], store$1(name), store$1(namespaceURI), 0]);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributeNS
       * @param namespaceURI attribute namespace
       * @param name attribute name
       * @return Boolean indicating if the element has the specified attribute.
       */

    }, {
      key: "hasAttributeNS",
      value: function hasAttributeNS(namespaceURI, name) {
        return this.attributes.some(matchPredicate(namespaceURI, name));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
       * @param names contains one more more classnames to match on. Multiples are space seperated, indicating an AND operation.
       * @return Element array with matching classnames
       */

    }, {
      key: "getElementsByClassName",
      value: function getElementsByClassName(names) {
        var inputClassList = names.split(' '); // TODO(KB) – Compare performance of [].some(value => DOMTokenList.contains(value)) and regex.
        // const classRegex = new RegExp(classNames.split(' ').map(name => `(?=.*${name})`).join(''));

        return matchChildrenElements(this, function (element) {
          return inputClassList.some(function (inputClassName) {
            return element.classList.contains(inputClassName);
          });
        });
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
       * @param tagName the qualified name to look for. The special string "*" represents all elements.
       * @return Element array with matching tagnames
       */

    }, {
      key: "getElementsByTagName",
      value: function getElementsByTagName(tagName) {
        var lowerTagName = toLower(tagName);
        return matchChildrenElements(this, tagName === '*' ? function (_) {
          return true;
        } : function (element) {
          return element.namespaceURI === HTML_NAMESPACE ? element.localName === lowerTagName : element.tagName === tagName;
        });
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
       * @param deep boolean determines if the clone should include a recursive copy of all childNodes.
       * @return Element containing all current attributes and potentially childNode clones of the Element requested to be cloned.
       */

    }, {
      key: "cloneNode",
      value: function cloneNode() {
        var deep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var clone = this.ownerDocument.createElement(this.nodeName);
        this.attributes.forEach(function (attr) {
          return clone.setAttribute(attr.name, attr.value);
        });

        if (deep) {
          this.childNodes.forEach(function (child) {
            return clone.appendChild(child.cloneNode(deep));
          });
        }

        return clone;
      }
      /**
       * Return the ClientRect for an Element once determined by the main thread.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
       * @return Promise<ClientRect>
       *
       * Note: Edge and IE11 do not return the x/y value, but top/left are equivalent. Normalize the values here.
       */

    }, {
      key: "getBoundingClientRectAsync",
      value: function getBoundingClientRectAsync() {
        var _this2 = this;

        var defaultValue = {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
        return new Promise(function (resolve) {
          var messageHandler = function messageHandler(_ref) {
            var data = _ref.data;

            if (data[12
            /* type */
            ] === 6
            /* GET_BOUNDING_CLIENT_RECT */
            && data[13
            /* target */
            ][0] === _this2[7
            /* index */
            ]) {
              removeEventListener('message', messageHandler);
              var transferredBoundingClientRect = data[38
              /* data */
              ];
              resolve({
                top: transferredBoundingClientRect[0],
                right: transferredBoundingClientRect[1],
                bottom: transferredBoundingClientRect[2],
                left: transferredBoundingClientRect[3],
                width: transferredBoundingClientRect[4],
                height: transferredBoundingClientRect[5],
                x: transferredBoundingClientRect[0],
                y: transferredBoundingClientRect[3]
              });
            }
          };

          if (typeof addEventListener !== 'function' || !_this2.isConnected) {
            // Elements run within Node runtimes are missing addEventListener as a global.
            // In this case, treat the return value the same as a disconnected node.
            resolve(defaultValue);
          } else {
            addEventListener('message', messageHandler);
            transfer$2(_this2.ownerDocument, [5
            /* GET_BOUNDING_CLIENT_RECT */
            , _this2[7
            /* index */
            ]]);
            setTimeout(resolve, 500, defaultValue); // TODO: Why a magical constant, define and explain.
          }
        });
      }
    }, {
      key: "outerHTML",
      get: function get() {
        var tag = this.localName || this.tagName;
        var start = "<".concat([tag, toString(this.attributes)].join(' ').trim(), ">");
        var contents = this.innerHTML;

        if (!contents) {
          if (this.kind === ElementKind.VOID) {
            // Void elements e.g. <input> only have a start tag (unless children are added programmatically).
            // https://html.spec.whatwg.org/multipage/syntax.html#void-elements
            return start;
          }
        }

        return start + contents + "</".concat(tag, ">");
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
       * @return string representation of serialized HTML describing the Element's descendants.
       */

    }, {
      key: "innerHTML",
      get: function get() {
        var childNodes = this.childNodes;

        if (childNodes.length) {
          return childNodes.map(function (child) {
            switch (child.nodeType) {
              case 3
              /* TEXT_NODE */
              :
                return child.textContent;

              case 8
              /* COMMENT_NODE */
              :
                return "<!--".concat(child.textContent, "-->");

              default:
                return child.outerHTML;
            }
          }).join('');
        }

        return '';
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
       * @param html The raw html string to parse.
       */
      ,
      set: function set(html) {
        var _this3 = this;

        var root = parse(html, this); // remove previous children

        this.childNodes.forEach(function (n) {
          propagate(n, 'isConnected', false);
          propagate(n, 45
          /* scopingRoot */
          , n);
        });
        mutate(this.ownerDocument, {
          removedNodes: this.childNodes,
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        }, [2
        /* CHILD_LIST */
        , this[7
        /* index */
        ], 0, 0, 0, this.childNodes.length].concat(_toConsumableArray(this.childNodes.map(function (node) {
          return node[7
          /* index */
          ];
        }))));
        this.childNodes = []; // add new children

        root.childNodes.forEach(function (child) {
          return _this3.appendChild(child);
        });
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
       * @param text new text replacing all childNodes content.
       */

    }, {
      key: "textContent",
      set: function set(text) {
        // TODO(KB): Investigate removing all children in a single .splice to childNodes.
        this.childNodes.slice().forEach(function (child) {
          return child.remove();
        });
        this.appendChild(this.ownerDocument.createTextNode(text));
      }
      /**
       * Getter returning the text representation of Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
       * @return text from all childNodes.
       */
      ,
      get: function get() {
        return this.getTextContent();
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
       * @return string tag name (i.e 'div')
       */

    }, {
      key: "tagName",
      get: function get() {
        return this.nodeName;
      }
    }]);

    return Element;
  }(ParentNode);
  reflectProperties([{
    id: ['']
  }], Element);

  var HTMLElement =
  /*#__PURE__*/
  function (_Element) {
    _inherits(HTMLElement, _Element);

    function HTMLElement() {
      _classCallCheck(this, HTMLElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLElement).apply(this, arguments));
    }

    _createClass(HTMLElement, [{
      key: "form",

      /**
       * Find the nearest parent form element.
       * Implemented in HTMLElement since so many extensions of HTMLElement repeat this functionality. This is not to spec.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
       * @return nearest parent form element.
       */
      get: function get() {
        return matchNearestParent(this, tagNameConditionPredicate(['FORM']));
      }
    }]);

    return HTMLElement;
  }(Element); // Reflected properties
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
    draggable: [false,
    /* attr */
    undefined,
    /* keywords */
    ['true', 'false']]
  }, {
    hidden: [false,
    /* attr */
    undefined]
  }, {
    noModule: [false]
  }, {
    spellcheck: [true,
    /* attr */
    undefined,
    /* keywords */
    ['true', 'false']]
  }, {
    translate: [true,
    /* attr */
    undefined,
    /* keywords */
    ['yes', 'no']]
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

  var HTMLAnchorElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLAnchorElement, _HTMLElement);

    function HTMLAnchorElement() {
      var _this;

      _classCallCheck(this, HTMLAnchorElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLAnchorElement).apply(this, arguments));
      _this.relList = new DOMTokenList(HTMLAnchorElement, _assertThisInitialized(_this), 'rel', 'relList', 'rel');
      return _this;
    }
    /**
     * Returns the href property/attribute value
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/toString
     * @return string href attached to HTMLAnchorElement
     */


    _createClass(HTMLAnchorElement, [{
      key: "toString",
      value: function toString() {
        return this.href;
      }
      /**
       * A Synonym for the Node.textContent property getter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
       * @return value of text node direct child of this Element.
       */

    }, {
      key: "text",
      get: function get() {
        return this.textContent;
      }
      /**
       * A Synonym for the Node.textContent property setter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
       * @param text replacement for all current childNodes.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
    }]);

    return HTMLAnchorElement;
  }(HTMLElement);
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
        Object.assign(this[TransferrableKeys.propertyBackedAttributes], {
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

  var HTMLButtonElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLButtonElement, _HTMLElement);

    function HTMLButtonElement() {
      _classCallCheck(this, HTMLButtonElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLButtonElement).apply(this, arguments));
    }

    return HTMLButtonElement;
  }(HTMLElement);
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

  var HTMLDataElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLDataElement, _HTMLElement);

    function HTMLDataElement() {
      _classCallCheck(this, HTMLDataElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLDataElement).apply(this, arguments));
    }

    return HTMLDataElement;
  }(HTMLElement);
  registerSubclass('data', HTMLDataElement); // Reflected properties, strings.
  // HTMLEmbedElement.value => string, reflected attribute

  reflectProperties([{
    value: ['']
  }], HTMLDataElement);

  var HTMLEmbedElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLEmbedElement, _HTMLElement);

    function HTMLEmbedElement() {
      _classCallCheck(this, HTMLEmbedElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLEmbedElement).apply(this, arguments));
    }

    return HTMLEmbedElement;
  }(HTMLElement);
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
  var MATCHING_CHILD_ELEMENT_TAGNAMES = 'BUTTON FIELDSET INPUT OBJECT OUTPUT SELECT TEXTAREA'.split(' ');
  /**
   * The HTMLFormControlsCollection interface represents a collection of HTML form control elements.
   * It is mixedin to both HTMLFormElement and HTMLFieldSetElement.
   */

  var HTMLFormControlsCollectionMixin = function HTMLFormControlsCollectionMixin(defineOn) {
    Object.defineProperty(defineOn.prototype, 'elements', {
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection
       * @return Element array matching children of specific tagnames.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(MATCHING_CHILD_ELEMENT_TAGNAMES));
      }
    });
  };

  var HTMLFieldSetElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLFieldSetElement, _HTMLElement);

    function HTMLFieldSetElement() {
      _classCallCheck(this, HTMLFieldSetElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLFieldSetElement).apply(this, arguments));
    }

    _createClass(HTMLFieldSetElement, [{
      key: "type",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
       * @return hardcoded string 'fieldset'
       */
      get: function get() {
        return toLower(this.tagName);
      }
    }]);

    return HTMLFieldSetElement;
  }(HTMLElement);
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

  var HTMLFormElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLFormElement, _HTMLElement);

    function HTMLFormElement() {
      _classCallCheck(this, HTMLFormElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLFormElement).apply(this, arguments));
    }

    _createClass(HTMLFormElement, [{
      key: "length",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
       * @return number of controls in the form
       */
      get: function get() {
        return this.elements.length;
      }
    }]);

    return HTMLFormElement;
  }(HTMLElement);
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
    acceptCharset: ['',
    /* attr */
    'accept-charset']
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

  var HTMLIFrameElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLIFrameElement, _HTMLElement);

    function HTMLIFrameElement() {
      var _this;

      _classCallCheck(this, HTMLIFrameElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLIFrameElement).apply(this, arguments)); // HTMLIFrameElement.sandbox, DOMTokenList, reflected attribute

      _this.sandbox = new DOMTokenList(HTMLIFrameElement, _assertThisInitialized(_this), 'sandbox', null, null);
      return _this;
    }

    return HTMLIFrameElement;
  }(HTMLElement);
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

  var HTMLImageElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLImageElement, _HTMLElement);

    function HTMLImageElement() {
      _classCallCheck(this, HTMLImageElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLImageElement).apply(this, arguments));
    }

    return HTMLImageElement;
  }(HTMLElement);
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

  var HTMLInputLabelsMixin = function HTMLInputLabelsMixin(defineOn) {
    Object.defineProperty(defineOn.prototype, 'labels', {
      /**
       * Getter returning label elements associated to this meter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLProgressElement/labels
       * @return label elements associated to this meter.
       */
      get: function get() {
        var _this = this;

        return matchChildrenElements(this.ownerDocument || this, function (element) {
          return element.tagName === 'LABEL' && element.for && element.for === _this.id;
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
  var _a$5, _b;
  var HTMLInputElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLInputElement, _HTMLElement);

    function HTMLInputElement() {
      var _this;

      _classCallCheck(this, HTMLInputElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLInputElement).apply(this, arguments)); // Per spec, some attributes like 'value' and 'checked' change behavior based on dirty flags.
      // Since these flags can only be changed on interaction (outside of worker), we can ignore them here.
      // Tradeoffs: Consequent attribute changes are missing, HTMLFormElement.reset() doesn't work, etc.
      // Alternative: Implement dirty flag checking in worker-dom, which would require listening for
      //     and forwarding interaction events to flag "dirtiness".
      // https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis

      _this[_a$5] = '';
      _this[_b] = false;
      return _this;
    } // TODO(willchou): There are a few interrelated issues with `value` property.
    //   1. "Dirtiness" caveat above.
    //   2. Duplicate SYNC events. Sent by every event fired from elements with a `value`, plus the default 'change' listener.
    //   3. Duplicate MUTATE events. Caused by stale `value` in worker due to no default 'input' listener (see below).


    _createClass(HTMLInputElement, [{
      key: "dateToString",

      /**
       * Returns a date in 'yyyy-mm-dd' format.
       * @param date
       */
      value: function dateToString(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1; // getMonth() is 0-index.

        var d = date.getDate();
        return "".concat(y, "-").concat(m > 9 ? '' : '0').concat(m, "-").concat(d > 9 ? '' : '0').concat(d);
      }
      /**
       * Returns a Date from a 'yyyy-mm-dd' format.
       * @param s
       */

    }, {
      key: "stringToDate",
      value: function stringToDate(str) {
        var components = str.split('-');

        if (components.length !== 3) {
          return null;
        }

        var _components = _slicedToArray(components, 3),
            y = _components[0],
            m = _components[1],
            d = _components[2]; // Month is 0-index.


        return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      }
    }, {
      key: "value",
      get: function get() {
        return this[21
        /* value */
        ];
      },
      set: function set(value) {
        // Don't early-out if value doesn't appear to have changed.
        // The worker may have a stale value since 'input' events aren't being forwarded.
        this[21
        /* value */
        ] = String(value);
        transfer$2(this.ownerDocument, [3
        /* PROPERTIES */
        , this[7
        /* index */
        ], store$1('value'), 0
        /* FALSE */
        , store$1(value)]);
      }
    }, {
      key: "valueAsDate",
      get: function get() {
        // Don't use Date constructor or Date.parse() since ISO 8601 (yyyy-mm-dd) parsing is inconsistent.
        var date = this.stringToDate(this[21
        /* value */
        ]);
        var invalid = !date || isNaN(date.getTime());
        return invalid ? null : date;
      }
      /** Unlike browsers, does not throw if this input[type] doesn't support dates. */
      ,
      set: function set(value) {
        if (!(value instanceof Date)) {
          throw new TypeError('The provided value is not a Date.');
        }

        this.value = this.dateToString(value);
      }
    }, {
      key: "valueAsNumber",
      get: function get() {
        if (this[21
        /* value */
        ].length === 0) {
          return NaN;
        }

        return Number(this[21
        /* value */
        ]);
      }
      /** Unlike browsers, does not throw if this input[type] doesn't support numbers. */
      ,
      set: function set(value) {
        if (typeof value === 'number') {
          this.value = String(value);
        } else {
          this.value = '';
        }
      }
    }, {
      key: "checked",
      get: function get() {
        return this[47
        /* checked */
        ];
      },
      set: function set(value) {
        if (this[47
        /* checked */
        ] === value) {
          return;
        }

        this[47
        /* checked */
        ] = !!value;
        transfer$2(this.ownerDocument, [3
        /* PROPERTIES */
        , this[7
        /* index */
        ], store$1('checked'), 1
        /* TRUE */
        , value === true ? 1
        /* TRUE */
        : 0
        /* FALSE */
        ]);
      }
    }]);

    return HTMLInputElement;
  }(HTMLElement);
  _a$5 = 21
  /* value */
  , _b = 47
  /* checked */
  ;
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
    accept: ['']
  }, {
    alt: ['']
  }, {
    autocapitalize: ['']
  }, {
    autocomplete: ['']
  }, {
    autofocus: [false]
  }, {
    defaultChecked: [false,
    /* attr */
    'checked']
  }, {
    defaultValue: ['',
    /* attr */
    'value']
  }, {
    dirName: ['']
  }, {
    disabled: [false]
  }, {
    formAction: ['']
  }, {
    formEncType: ['']
  }, {
    formMethod: ['']
  }, {
    formTarget: ['']
  }, {
    height: [0]
  }, {
    max: ['']
  }, {
    maxLength: [0]
  }, {
    min: ['']
  }, {
    multiple: [false]
  }, {
    name: ['']
  }, {
    pattern: ['']
  }, {
    placeholder: ['']
  }, {
    readOnly: [false]
  }, {
    required: [false]
  }, {
    size: [0]
  }, {
    src: ['']
  }, {
    step: ['']
  }, {
    type: ['text']
  }, {
    width: [0]
  }], HTMLInputElement); // TODO(KB) Not Reflected Properties
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
  // Unimplemented Methods
  // HTMLInputElement.setSelectionRange()
  // HTMLInputElement.setRangeText()
  // HTMLInputElement.setCustomValidity()
  // HTMLInputElement.checkValidity()
  // HTMLInputElement.stepDown()
  // HTMLInputElement.stepUp()

  var HTMLLabelElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLLabelElement, _HTMLElement);

    function HTMLLabelElement() {
      _classCallCheck(this, HTMLLabelElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLLabelElement).apply(this, arguments));
    }

    _createClass(HTMLLabelElement, [{
      key: "control",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control
       * @return input element
       */
      get: function get() {
        var htmlFor = this.getAttribute('for');

        if (htmlFor !== null) {
          return this.ownerDocument && this.ownerDocument.getElementById(htmlFor);
        }

        return matchChildElement(this, tagNameConditionPredicate(['INPUT']));
      }
    }]);

    return HTMLLabelElement;
  }(HTMLElement);
  registerSubclass('label', HTMLLabelElement); // Reflected Properties
  // HTMLLabelElement.htmlFor => string, reflected attribute 'for'

  reflectProperties([{
    htmlFor: ['', 'for']
  }], HTMLLabelElement);

  var HTMLLinkElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLLinkElement, _HTMLElement);

    function HTMLLinkElement() {
      var _this;

      _classCallCheck(this, HTMLLinkElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLLinkElement).apply(this, arguments));
      _this.relList = new DOMTokenList(HTMLLinkElement, _assertThisInitialized(_this), 'rel', 'relList', 'rel');
      return _this;
    }

    return HTMLLinkElement;
  }(HTMLElement);
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

  var HTMLMapElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLMapElement, _HTMLElement);

    function HTMLMapElement() {
      _classCallCheck(this, HTMLMapElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLMapElement).apply(this, arguments));
    }

    _createClass(HTMLMapElement, [{
      key: "areas",

      /**
       * Getter returning area elements associated to this map.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement
       * @return area elements associated to this map.
       */
      get: function get() {
        return matchChildrenElements(this, function (element) {
          return element.tagName === 'AREA';
        });
      }
    }]);

    return HTMLMapElement;
  }(HTMLElement);
  registerSubclass('map', HTMLMapElement); // Reflected Properties
  // HTMLMapElement.name => string, reflected attribute

  reflectProperties([{
    name: ['']
  }], HTMLMapElement);

  var HTMLMeterElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLMeterElement, _HTMLElement);

    function HTMLMeterElement() {
      _classCallCheck(this, HTMLMeterElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLMeterElement).apply(this, arguments));
    }

    return HTMLMeterElement;
  }(HTMLElement);
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

  var HTMLModElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLModElement, _HTMLElement);

    function HTMLModElement() {
      _classCallCheck(this, HTMLModElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLModElement).apply(this, arguments));
    }

    return HTMLModElement;
  }(HTMLElement);
  registerSubclass('del', HTMLModElement);
  registerSubclass('ins', HTMLModElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute
  // HTMLModElement.datetime => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }, {
    datetime: ['']
  }], HTMLModElement);

  var HTMLOListElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLOListElement, _HTMLElement);

    function HTMLOListElement() {
      _classCallCheck(this, HTMLOListElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLOListElement).apply(this, arguments));
    }

    return HTMLOListElement;
  }(HTMLElement);
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
  var _a$6;
  var HTMLOptionElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLOptionElement, _HTMLElement);

    function HTMLOptionElement(nodeType, localName, namespaceURI, ownerDocument) {
      var _this;

      _classCallCheck(this, HTMLOptionElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLOptionElement).call(this, nodeType, localName, namespaceURI, ownerDocument));
      _this[_a$6] = false;
      _this[46
      /* propertyBackedAttributes */
      ].selected = [function () {
        return String(_this[52
        /* selected */
        ]);
      }, function (value) {
        return _this.selected = value === 'true';
      }];
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return position of the option within the list of options it's within, or zero if there is no valid parent.
     */


    _createClass(HTMLOptionElement, [{
      key: "index",
      get: function get() {
        return this.parentNode && this.parentNode.children.indexOf(this) || 0;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return label attribute value or text content if there is no attribute.
       */

    }, {
      key: "label",
      get: function get() {
        return this.getAttribute('label') || this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param label new label value to store as an attribute.
       */
      ,
      set: function set(label) {
        this.setAttribute('label', label);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return boolean based on if the option element is selected.
       */

    }, {
      key: "selected",
      get: function get() {
        return this[52
        /* selected */
        ];
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param value new selected boolean value.
       */
      ,
      set: function set(value) {
        this[52
        /* selected */
        ] = !!value;
        transfer$2(this.ownerDocument, [3
        /* PROPERTIES */
        , this[7
        /* index */
        ], store$1('selected'), 1
        /* TRUE */
        , this[52
        /* selected */
        ] ? 1
        /* TRUE */
        : 0
        /* FALSE */
        ]);
      }
      /**
       * A Synonym for the Node.textContent property getter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return value of text node direct child of this Element.
       */

    }, {
      key: "text",
      get: function get() {
        return this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param text new text content to store for this Element.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return value attribute value or text content if there is no attribute.
       */

    }, {
      key: "value",
      get: function get() {
        return this.getAttribute('value') || this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param value new value for an option element.
       */
      ,
      set: function set(value) {
        this.setAttribute('value', value);
      }
    }]);

    return HTMLOptionElement;
  }(HTMLElement);
  _a$6 = 52
  /* selected */
  ;
  registerSubclass('option', HTMLOptionElement); // Reflected Properties
  // HTMLOptionElement.defaultSelected => boolean, reflected attribute
  // HTMLOptionElement.disabled => boolean, reflected attribute
  // HTMLOptionElement.type => string, reflected attribute

  reflectProperties([{
    defaultSelected: [false,
    /* attr */
    'selected']
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
  var _a$7, _b$1;
  var HTMLProgressElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLProgressElement, _HTMLElement);

    function HTMLProgressElement() {
      var _this;

      _classCallCheck(this, HTMLProgressElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLProgressElement).apply(this, arguments));
      _this[_a$7] = true;
      _this[_b$1] = 0;
      return _this;
    }

    _createClass(HTMLProgressElement, [{
      key: "position",
      get: function get() {
        return this[48
        /* indeterminate */
        ] ? -1 : this[21
        /* value */
        ] / this.max;
      }
    }, {
      key: "value",
      get: function get() {
        return this[21
        /* value */
        ];
      },
      set: function set(value) {
        this[48
        /* indeterminate */
        ] = false;
        this[21
        /* value */
        ] = value; // TODO(KB) This is a property mutation needing tracked.
      }
    }]);

    return HTMLProgressElement;
  }(HTMLElement);
  _a$7 = 48
  /* indeterminate */
  , _b$1 = 21
  /* value */
  ;
  registerSubclass('progress', HTMLProgressElement);
  HTMLInputLabelsMixin(HTMLProgressElement); // Reflected Properties
  // HTMLModElement.max => number, reflected attribute

  reflectProperties([{
    max: [1]
  }], HTMLProgressElement);

  var HTMLQuoteElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLQuoteElement, _HTMLElement);

    function HTMLQuoteElement() {
      _classCallCheck(this, HTMLQuoteElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLQuoteElement).apply(this, arguments));
    }

    return HTMLQuoteElement;
  }(HTMLElement);
  registerSubclass('blockquote', HTMLQuoteElement);
  registerSubclass('q', HTMLQuoteElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }], HTMLQuoteElement);

  var HTMLScriptElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLScriptElement, _HTMLElement);

    function HTMLScriptElement() {
      _classCallCheck(this, HTMLScriptElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLScriptElement).apply(this, arguments));
    }

    _createClass(HTMLScriptElement, [{
      key: "text",

      /**
       * A Synonym for the Node.textContent property getter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
       * @return value of text node direct child of this Element.
       */
      get: function get() {
        return this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
       * @param text new text content to store for this Element.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
    }]);

    return HTMLScriptElement;
  }(HTMLElement);
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
  var _a$8;
  var isOptionPredicate = tagNameConditionPredicate(['OPTION']);

  var isSelectedOptionPredicate = function isSelectedOptionPredicate(element) {
    return isOptionPredicate(element) && element.selected === true;
  };

  var HTMLSelectElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLSelectElement, _HTMLElement);

    function HTMLSelectElement() {
      var _this;

      _classCallCheck(this, HTMLSelectElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLSelectElement).apply(this, arguments));
      _this[_a$8] = -1
      /* UNMODIFIED */
      ;
      return _this;
    }
    /**
     * Extend functionality after child insertion to make sure the correct option is selected.
     * @param child
     */


    _createClass(HTMLSelectElement, [{
      key: (_a$8 = 49
      /* size */
      , 56
      /* insertedNode */
      ),
      value: function value(child) {
        _get(_getPrototypeOf(HTMLSelectElement.prototype), 56
        /* insertedNode */
        , this).call(this, child); // When this singular value select is appending a child, set the value property for two cases.
        // 1. The inserted child is already selected.
        // 2. The current value of the select is the default ('').


        if (!this.multiple && isOptionPredicate(child) && child.selected || this.value === '') {
          this.value = child.value;
        }
      }
      /**
       * Extend functionality after child insertion to make sure the correct option is selected.
       * @param child
       */

    }, {
      key: 57
      /* removedNode */
      ,
      value: function value(child) {
        _get(_getPrototypeOf(HTMLSelectElement.prototype), 57
        /* removedNode */
        , this).call(this, child); // When this singular value select is removing a selected child
        // ... set the value property to the first valid option.


        if (!this.multiple && child.selected) {
          var options = this.options;

          if (options.length > 0) {
            this.value = options[0].value;
          }
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/length
       * @return number of controls in the form
       */

    }, {
      key: "length",
      get: function get() {
        return this.options.length;
      }
      /**
       * Getter returning option elements that are direct children of a HTMLSelectElement
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return Element "options" objects that are direct children.
       */

    }, {
      key: "options",
      get: function get() {
        return this.children.filter(isOptionPredicate);
      }
      /**
       * Getter returning the index of the first selected <option> element.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
       * @return the index of the first selected option element, or -1 if no element is selected.
       */

    }, {
      key: "selectedIndex",
      get: function get() {
        var firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
        return firstSelectedChild ? this.children.indexOf(firstSelectedChild) : -1;
      }
      /**
       * Setter making the <option> element at the passed index selected.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
       * @param selectedIndex index number to make selected.
       */
      ,
      set: function set(selectedIndex) {
        this.children.forEach(function (element, index) {
          return element.selected = index === selectedIndex;
        });
      }
      /**
       * Getter returning the <option> elements selected.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions
       * @return array of Elements currently selected.
       */

    }, {
      key: "selectedOptions",
      get: function get() {
        return matchChildrenElements(this, isSelectedOptionPredicate);
      }
      /**
       * Getter returning the size of the select element (by default 1 for single and 4 for multiple)
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return size of the select element.
       */

    }, {
      key: "size",
      get: function get() {
        return this[49
        /* size */
        ] === -1
        /* UNMODIFIED */
        ? this.multiple ? 4
        /* MULTIPLE */
        : 1
        /* SINGLE */
        : this[49
        /* size */
        ];
      }
      /**
       * Override the size of this element (each positive unit is the height of a single option)
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @param size number to set the size to.
       */
      ,
      set: function set(size) {
        this[49
        /* size */
        ] = size > 0 ? size : this.multiple ? 4
        /* MULTIPLE */
        : 1
        /* SINGLE */
        ;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return string representing the select element type.
       */

    }, {
      key: "type",
      get: function get() {
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

    }, {
      key: "value",
      get: function get() {
        var firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
        return firstSelectedChild ? firstSelectedChild.value : '';
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @set value
       */
      ,
      set: function set(value) {
        var stringValue = String(value);
        this.children.forEach(function (element) {
          return isOptionPredicate(element) && (element.selected = element.value === stringValue);
        });
      }
    }]);

    return HTMLSelectElement;
  }(HTMLElement);
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

  var HTMLSourceElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLSourceElement, _HTMLElement);

    function HTMLSourceElement() {
      _classCallCheck(this, HTMLSourceElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLSourceElement).apply(this, arguments));
    }

    return HTMLSourceElement;
  }(HTMLElement);
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

  var HTMLStyleElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLStyleElement, _HTMLElement);

    function HTMLStyleElement() {
      _classCallCheck(this, HTMLStyleElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLStyleElement).apply(this, arguments));
    }

    return HTMLStyleElement;
  }(HTMLElement);
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

  var HTMLTableCellElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTableCellElement, _HTMLElement);

    function HTMLTableCellElement() {
      var _this;

      _classCallCheck(this, HTMLTableCellElement);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLTableCellElement).apply(this, arguments));
      _this.headers = new DOMTokenList(HTMLTableCellElement, _assertThisInitialized(_this), 'headers', null, null);
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement
     * @return position of the cell within the parent tr, if not nested in a tr the value is -1.
     */


    _createClass(HTMLTableCellElement, [{
      key: "cellIndex",
      get: function get() {
        var parent = matchNearestParent(this, tagNameConditionPredicate(['TR']));
        return parent !== null ? matchChildrenElements(parent, tagNameConditionPredicate(['TH', 'TD'])).indexOf(this) : -1;
      }
    }]);

    return HTMLTableCellElement;
  }(HTMLElement);
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

  var HTMLTableColElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTableColElement, _HTMLElement);

    function HTMLTableColElement() {
      _classCallCheck(this, HTMLTableColElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLTableColElement).apply(this, arguments));
    }

    return HTMLTableColElement;
  }(HTMLElement);
  registerSubclass('col', HTMLTableColElement); // Reflected Properties
  // HTMLTableColElement.span => number, reflected attribute

  reflectProperties([{
    span: [1]
  }], HTMLTableColElement);

  var removeElement = function removeElement(element) {
    return element && element.remove();
  };

  var insertBeforeElementsWithTagName = function insertBeforeElementsWithTagName(parent, element, tagNames) {
    var insertBeforeElement = matchChildElement(parent, function (element) {
      return !tagNames.includes(element.tagName);
    });

    if (insertBeforeElement) {
      parent.insertBefore(element, insertBeforeElement);
    } else {
      parent.appendChild(element);
    }
  };

  var HTMLTableElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTableElement, _HTMLElement);

    function HTMLTableElement() {
      _classCallCheck(this, HTMLTableElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLTableElement).apply(this, arguments));
    }

    _createClass(HTMLTableElement, [{
      key: "caption",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
       * @return first matching caption Element or null if none exists.
       */
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['CAPTION']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
       * @param element new caption element to replace the existing, or become the first element child.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'CAPTION') {
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

    }, {
      key: "tHead",
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['THEAD']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @param newElement new thead element to insert in this table.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'THEAD') {
          // If a correct object is given,
          // it is inserted in the tree immediately before the first element that is
          // neither a <caption>, nor a <colgroup>, or as the last child if there is no such element.
          // Additionally, the first <thead> that is a child of this element is removed from the tree, if any.
          removeElement(this.tHead);
          insertBeforeElementsWithTagName(this, newElement, ['CAPTION', 'COLGROUP']);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @return first matching thead Element or null if none exists.
       */

    }, {
      key: "tFoot",
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['TFOOT']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @param newElement new tfoot element to insert in this table.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'TFOOT') {
          // If a correct object is given,
          // it is inserted in the tree immediately before the first element that is neither a <caption>,
          // a <colgroup>, nor a <thead>, or as the last child if there is no such element, and the first <tfoot> that is a child of
          // this element is removed from the tree, if any.
          removeElement(this.tFoot);
          insertBeforeElementsWithTagName(this, newElement, ['CAPTION', 'COLGROUP', 'THEAD']);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
       * @return array of 'tr' tagname elements
       */

    }, {
      key: "rows",
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['TR']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
       * @return array of 'tbody' tagname elements
       */

    }, {
      key: "tBodies",
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['TBODY']));
      }
    }]);

    return HTMLTableElement;
  }(HTMLElement);
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

  var TABLE_SECTION_TAGNAMES = 'TABLE TBODY THEAD TFOOT'.split(' ');

  var indexInAncestor = function indexInAncestor(element, isValidAncestor) {
    var parent = matchNearestParent(element, isValidAncestor); // TODO(KB): This is either a HTMLTableElement or HTMLTableSectionElement.

    return parent === null ? -1 : parent.rows.indexOf(element);
  };

  var HTMLTableRowElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTableRowElement, _HTMLElement);

    function HTMLTableRowElement() {
      _classCallCheck(this, HTMLTableRowElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLTableRowElement).apply(this, arguments));
    }

    _createClass(HTMLTableRowElement, [{
      key: "deleteCell",

      /**
       * Removes the cell in provided position of this row.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @param index position of the cell in the row to remove.
       */
      value: function deleteCell(index) {
        var cell = this.cells[index];
        cell && cell.remove();
      }
      /**
       * Insert a new cell ('td') in the row at a specified position.
       * @param index position in the children to insert before.
       * @return newly inserted td element.
       */

    }, {
      key: "insertCell",
      value: function insertCell(index) {
        var cells = this.cells;
        var td = this.ownerDocument.createElement('td');

        if (index < 0 || index >= cells.length) {
          this.appendChild(td);
        } else {
          this.insertBefore(td, this.children[index]);
        }

        return td;
      }
    }, {
      key: "cells",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return td and th elements that are children of this row.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['TD', 'TH']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return position of the row within a table, if not nested within in a table the value is -1.
       */

    }, {
      key: "rowIndex",
      get: function get() {
        return indexInAncestor(this, tagNameConditionPredicate(['TABLE']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return position of the row within a parent section, if not nested directly in a section the value is -1.
       */

    }, {
      key: "sectionRowIndex",
      get: function get() {
        return indexInAncestor(this, tagNameConditionPredicate(TABLE_SECTION_TAGNAMES));
      }
    }]);

    return HTMLTableRowElement;
  }(HTMLElement);
  registerSubclass('tr', HTMLTableRowElement);

  var HTMLTableSectionElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTableSectionElement, _HTMLElement);

    function HTMLTableSectionElement() {
      _classCallCheck(this, HTMLTableSectionElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLTableSectionElement).apply(this, arguments));
    }

    _createClass(HTMLTableSectionElement, [{
      key: "deleteRow",

      /**
       * Remove a node in a specified position from the section.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
       * @param index position in the section to remove the node of.
       */
      value: function deleteRow(index) {
        var rows = this.rows;

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

    }, {
      key: "insertRow",
      value: function insertRow(index) {
        var rows = this.rows;
        var tr = this.ownerDocument.createElement('tr');

        if (index < 0 || index >= rows.length) {
          this.appendChild(tr);
        } else {
          this.insertBefore(tr, this.children[index]);
        }

        return tr;
      }
    }, {
      key: "rows",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
       * @return All rows (tr elements) within the table section.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['TR']));
      }
    }]);

    return HTMLTableSectionElement;
  }(HTMLElement);
  registerSubclass('thead', HTMLTableSectionElement);
  registerSubclass('tfoot', HTMLTableSectionElement);
  registerSubclass('tbody', HTMLTableSectionElement);

  var HTMLTimeElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLTimeElement, _HTMLElement);

    function HTMLTimeElement() {
      _classCallCheck(this, HTMLTimeElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLTimeElement).apply(this, arguments));
    }

    return HTMLTimeElement;
  }(HTMLElement);
  registerSubclass('time', HTMLTimeElement); // Reflected Properties
  // HTMLTimeElement.dateTime => string, reflected attribute

  reflectProperties([{
    dateTime: ['']
  }], HTMLTimeElement);

  var HTMLDataListElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(HTMLDataListElement, _HTMLElement);

    function HTMLDataListElement() {
      _classCallCheck(this, HTMLDataListElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(HTMLDataListElement).apply(this, arguments));
    }

    _createClass(HTMLDataListElement, [{
      key: "options",

      /**
       * Getter returning option elements that are direct children of a HTMLDataListElement
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataListElement
       * @return Element "options" objects that are direct children.
       */
      get: function get() {
        return this.childNodes.filter(function (node) {
          return node.nodeName === 'OPTION';
        });
      }
    }]);

    return HTMLDataListElement;
  }(HTMLElement);
  registerSubclass('datalist', HTMLDataListElement);
  /**
   * HTMLDataListElement.options Read only
   * Is a HTMLCollection representing a collection of the contained option elements.
   */

  /**
   * <label for="myBrowser">Choose a browser from this list:</label>
   * <input list="browsers" id="myBrowser" name="myBrowser" />
   * <datalist id="browsers">
   *   <option value="Chrome">
   *   <option value="Firefox">
   *   <option value="Internet Explorer">
   *   <option value="Opera">
   *   <option value="Safari">
   *   <option value="Microsoft Edge">
   * </datalist>
   */

  var CharacterData =
  /*#__PURE__*/
  function (_Node) {
    _inherits(CharacterData, _Node);

    function CharacterData(data, nodeType, nodeName, ownerDocument, overrideIndex) {
      var _this;

      _classCallCheck(this, CharacterData);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CharacterData).call(this, nodeType, nodeName, ownerDocument, overrideIndex));
      _this[38
      /* data */
      ] = data;
      _this[8
      /* creationFormat */
      ] = [_this[7
      /* index */
      ], nodeType, store$1(nodeName), store$1(data), 0];
      return _this;
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


    _createClass(CharacterData, [{
      key: "data",
      get: function get() {
        return this[38
        /* data */
        ];
      }
      /**
       * @param value string value to store as CharacterData.data.
       */
      ,
      set: function set(value) {
        var oldValue = this.data;
        this[38
        /* data */
        ] = value;
        mutate(this.ownerDocument, {
          target: this,
          type: 1
          /* CHARACTER_DATA */
          ,
          value: value,
          oldValue: oldValue
        }, [1
        /* CHARACTER_DATA */
        , this[7
        /* index */
        ], store$1(value)]);
      }
      /**
       * @return Returns the size of the string contained in CharacterData.data
       */

    }, {
      key: "length",
      get: function get() {
        return this[38
        /* data */
        ].length;
      }
      /**
       * @return Returns the string contained in CharacterData.data
       */

    }, {
      key: "nodeValue",
      get: function get() {
        return this[38
        /* data */
        ];
      }
      /**
       * @param value string value to store as CharacterData.data.
       */
      ,
      set: function set(value) {
        this.data = value;
      }
    }]);

    return CharacterData;
  }(Node);

  var Text =
  /*#__PURE__*/
  function (_CharacterData) {
    _inherits(Text, _CharacterData);

    function Text(data, ownerDocument, overrideIndex) {
      _classCallCheck(this, Text);

      return _possibleConstructorReturn(this, _getPrototypeOf(Text).call(this, data, 3
      /* TEXT_NODE */
      , '#text', ownerDocument, overrideIndex));
    } // Unimplemented Properties
    // Text.isElementContentWhitespace – https://developer.mozilla.org/en-US/docs/Web/API/Text/isElementContentWhitespace
    // Text.wholeText – https://developer.mozilla.org/en-US/docs/Web/API/Text/wholeText
    // Text.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Text/assignedSlot

    /**
     * textContent getter, retrieves underlying CharacterData data.
     * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
     */


    _createClass(Text, [{
      key: "cloneNode",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
       * @return new Text Node with the same data as the Text to clone.
       */
      value: function cloneNode() {
        return this.ownerDocument.createTextNode(this.data);
      }
      /**
       * Breaks Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
       * @param offset number position to split text at.
       * @return Text Node after the offset.
       */

    }, {
      key: "splitText",
      value: function splitText(offset) {
        var remainderTextNode = new Text(this.data.slice(offset, this.data.length), this.ownerDocument);
        var parentNode = this.parentNode;
        this.nodeValue = this.data.slice(0, offset);

        if (parentNode !== null) {
          // When this node is attached to the DOM, the remainder text needs to be inserted directly after.
          var parentChildNodes = parentNode.childNodes;
          var insertBeforePosition = parentChildNodes.indexOf(this) + 1;
          var insertBeforeNode = parentChildNodes.length >= insertBeforePosition ? parentChildNodes[insertBeforePosition] : null;
          return parentNode.insertBefore(remainderTextNode, insertBeforeNode);
        }

        return remainderTextNode;
      }
    }, {
      key: "textContent",
      get: function get() {
        return this.data;
      }
      /**
       * textContent setter, mutates underlying CharacterData data.
       * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
       * @param value new value
       */
      ,
      set: function set(value) {
        // Mutation Observation is performed by CharacterData.
        this.nodeValue = value;
      }
    }]);

    return Text;
  }(CharacterData);

  var Comment =
  /*#__PURE__*/
  function (_CharacterData) {
    _inherits(Comment, _CharacterData);

    function Comment(data, ownerDocument, overrideIndex) {
      _classCallCheck(this, Comment);

      return _possibleConstructorReturn(this, _getPrototypeOf(Comment).call(this, data, 8
      /* COMMENT_NODE */
      , '#comment', ownerDocument, overrideIndex));
    }
    /**
     * textContent getter, retrieves underlying CharacterData data.
     * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
     */


    _createClass(Comment, [{
      key: "cloneNode",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
       * @return new Comment Node with the same data as the Comment to clone.
       */
      value: function cloneNode() {
        return this.ownerDocument.createComment(this.data);
      }
    }, {
      key: "textContent",
      get: function get() {
        return this.data;
      }
      /**
       * textContent setter, mutates underlying CharacterData data.
       * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
       * @param value new value
       */
      ,
      set: function set(value) {
        // Mutation Observation is performed by CharacterData.
        this.nodeValue = value;
      }
    }]);

    return Comment;
  }(CharacterData);

  var DocumentFragment =
  /*#__PURE__*/
  function (_ParentNode) {
    _inherits(DocumentFragment, _ParentNode);

    function DocumentFragment(ownerDocument, overrideIndex) {
      var _this;

      _classCallCheck(this, DocumentFragment);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DocumentFragment).call(this, 11
      /* DOCUMENT_FRAGMENT_NODE */
      , '#document-fragment', ownerDocument, overrideIndex));
      _this[8
      /* creationFormat */
      ] = [_this[7
      /* index */
      ], 11
      /* DOCUMENT_FRAGMENT_NODE */
      , store$1(_this.nodeName), 0, 0];
      return _this;
    }
    /**
     * @param deep boolean determines if the clone should include a recursive copy of all childNodes.
     * @return DocumentFragment containing childNode clones of the DocumentFragment requested to be cloned.
     */


    _createClass(DocumentFragment, [{
      key: "cloneNode",
      value: function cloneNode() {
        var deep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var clone = this.ownerDocument.createDocumentFragment();

        if (deep) {
          this.childNodes.forEach(function (child) {
            return clone.appendChild(child.cloneNode(deep));
          });
        }

        return clone;
      }
    }]);

    return DocumentFragment;
  }(ParentNode);

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
  var _a$9, _b$2;
  var Event =
  /*#__PURE__*/
  function () {
    function Event(type, opts) {
      _classCallCheck(this, Event);

      this[_a$9] = false;
      this[_b$2] = false;
      this.type = type;
      this.bubbles = !!opts.bubbles;
      this.cancelable = !!opts.cancelable;
    }

    _createClass(Event, [{
      key: "stopPropagation",
      value: function stopPropagation() {
        this[50
        /* stop */
        ] = true;
      }
    }, {
      key: "stopImmediatePropagation",
      value: function stopImmediatePropagation() {
        this[51
        /* end */
        ] = this[50
        /* stop */
        ] = true;
      }
    }, {
      key: "preventDefault",
      value: function preventDefault() {
        this.defaultPrevented = true;
      }
    }]);

    return Event;
  }();
  _a$9 = 50
  /* stop */
  , _b$2 = 51
  /* end */
  ;
  /**
   * Determine the target for a TransferrableEvent.
   * @param document Event intended within the scope of this document.
   * @param event
   */

  var targetFromTransfer = function targetFromTransfer(document, event) {
    if (event[13
    /* target */
    ] !== null) {
      var index = event[13
      /* target */
      ][0]; // If the target was sent as index 0, use the current document.

      return get(index !== 0 ? index : document[7
      /* index */
      ]);
    }

    return null;
  };
  /**
   *
   * @param document
   * @param event
   */


  var touchListFromTransfer = function touchListFromTransfer(document, event, key) {
    if (event[key] !== undefined) {
      var touchListKeys = Object.keys(event[key]);
      var list = {
        length: touchListKeys.length,
        item: function item(index) {
          return this[index] || null;
        }
      };
      touchListKeys.forEach(function (touchListKey) {
        var numericKey = Number(touchListKey);
        var transferredTouch = event[key][numericKey];
        list[numericKey] = {
          identifier: transferredTouch[0],
          screenX: transferredTouch[1],
          screenY: transferredTouch[2],
          clientX: transferredTouch[3],
          clientY: transferredTouch[4],
          pageX: transferredTouch[5],
          pageY: transferredTouch[6],
          target: get(transferredTouch[7] !== 0 ? transferredTouch[7] : document[7
          /* index */
          ])
        };
      });
      return list;
    }

    return undefined;
  };
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */


  function propagate$1(global) {
    if (typeof addEventListener !== 'function') {
      return;
    }

    addEventListener('message', function (_ref) {
      var data = _ref.data;

      if (data[12
      /* type */
      ] !== 1
      /* EVENT */
      ) {
          return;
        }

      var event = data[39
      /* event */
      ];
      var node = get(event[7
      /* index */
      ]);

      if (node !== null) {
        node.dispatchEvent(Object.assign(new Event(event[12
        /* type */
        ], {
          bubbles: event[25
          /* bubbles */
          ],
          cancelable: event[26
          /* cancelable */
          ]
        }), {
          cancelBubble: event[27
          /* cancelBubble */
          ],
          defaultPrevented: event[29
          /* defaultPrevented */
          ],
          eventPhase: event[30
          /* eventPhase */
          ],
          isTrusted: event[31
          /* isTrusted */
          ],
          returnValue: event[32
          /* returnValue */
          ],
          target: targetFromTransfer(global.document, event),
          timeStamp: event[33
          /* timeStamp */
          ],
          scoped: event[34
          /* scoped */
          ],
          keyCode: event[35
          /* keyCode */
          ],
          pageX: event[60
          /* pageX */
          ],
          pageY: event[61
          /* pageY */
          ],
          offsetX: event[65
          /* offsetX */
          ],
          offsetY: event[66
          /* offsetY */
          ],
          touches: touchListFromTransfer(global.document, event, 62
          /* touches */
          ),
          changedTouches: touchListFromTransfer(global.document, event, 63
          /* changedTouches */
          )
        }));
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
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */

  function propagate$2() {
    if (typeof addEventListener !== 'function') {
      return;
    }

    addEventListener('message', function (_ref) {
      var data = _ref.data;

      if (data[12
      /* type */
      ] !== 4
      /* SYNC */
      ) {
          return;
        }

      var sync = data[40
      /* sync */
      ];
      var node = get(sync[7
      /* index */
      ]);

      if (node) {
        node.ownerDocument[58
        /* allowTransfer */
        ] = false; // Modify the private backing ivar of `value` property to avoid mutation/sync cycle.

        node.value = sync[21
        /* value */
        ];
        node.ownerDocument[58
        /* allowTransfer */
        ] = true;
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
  function propagate$3(global) {
    if (typeof addEventListener !== 'function') {
      return;
    }

    addEventListener('message', function (_ref) {
      var data = _ref.data;

      if (data[12
      /* type */
      ] !== 5
      /* RESIZE */
      ) {
          return;
        }

      var sync = data[40
      /* sync */
      ];

      if (sync) {
        global.innerWidth = sync[0];
        global.innerHeight = sync[1];
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
  var _a$a;
  var DOCUMENT_NAME = '#document';
  var Document =
  /*#__PURE__*/
  function (_Element) {
    _inherits(Document, _Element);

    function Document(global) {
      var _this;

      _classCallCheck(this, Document);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Document).call(this, 9
      /* DOCUMENT_NODE */
      , DOCUMENT_NAME, HTML_NAMESPACE, null));
      _this[_a$a] = true; // Element uppercases its nodeName, but Document doesn't.

      _this.nodeName = DOCUMENT_NAME;
      _this.documentElement = _assertThisInitialized(_this);
      _this.defaultView = Object.assign(global, {
        document: _assertThisInitialized(_this),
        addEventListener: _this.addEventListener.bind(_assertThisInitialized(_this)),
        removeEventListener: _this.removeEventListener.bind(_assertThisInitialized(_this))
      });
      return _this;
    }
    /**
     * Observing the Document indicates it's attached to a main thread
     * version of the document.
     *
     * Each mutation needs to be transferred, synced values need to propagate.
     */


    _createClass(Document, [{
      key: (_a$a = 58
      /* allowTransfer */
      , 59
      /* observe */
      ),
      value: function value() {
        set(1
        /* Hydrating */
        );
        propagate$1(this.defaultView);
        propagate$2();
        propagate$3(this.defaultView);
      }
      /**
       * Hydrate
       * @param strings
       * @param skeleton
       */

    }, {
      key: 64
      /* hydrateNode */
      ,
      value: function value(strings, skeleton) {
        var _this2 = this;

        switch (skeleton[0
        /* nodeType */
        ]) {
          case 3
          /* TEXT_NODE */
          :
            return new Text(strings[skeleton[5
            /* textContent */
            ]], this, skeleton[7
            /* index */
            ]);

          case 8
          /* COMMENT_NODE */
          :
            return new Comment(strings[skeleton[5
            /* textContent */
            ]], this, skeleton[7
            /* index */
            ]);

          default:
            var namespaceURI = strings[skeleton[6
            /* namespaceURI */
            ]] || HTML_NAMESPACE;
            var localName = strings[skeleton[1
            /* localOrNodeName */
            ]];

            var _constructor = NS_NAME_TO_CLASS["".concat(namespaceURI, ":").concat(localName)] || HTMLElement;

            var node = new _constructor(1
            /* ELEMENT_NODE */
            , localName, namespaceURI, this, skeleton[7
            /* index */
            ]);
            (skeleton[2
            /* attributes */
            ] || []).forEach(function (attribute) {
              return (// AttributeNamespaceURI = strings[attribute[0]] !== 'null' ? strings[attribute[0]] : HTML_NAMESPACE
                node.setAttributeNS(strings[attribute[0]] !== 'null' ? strings[attribute[0]] : HTML_NAMESPACE, strings[attribute[1]], strings[attribute[2]])
              );
            });
            (skeleton[4
            /* childNodes */
            ] || []).forEach(function (child) {
              return node.appendChild(_this2[64
              /* hydrateNode */
              ](strings, child));
            });
            return node;
        }
      }
    }, {
      key: "createElement",
      value: function createElement(name) {
        return this.createElementNS(HTML_NAMESPACE, toLower(name));
      }
    }, {
      key: "createElementNS",
      value: function createElementNS(namespaceURI, localName) {
        var constructor = NS_NAME_TO_CLASS["".concat(namespaceURI, ":").concat(localName)] || HTMLElement;
        return new constructor(1
        /* ELEMENT_NODE */
        , localName, namespaceURI, this);
      }
    }, {
      key: "createTextNode",
      value: function createTextNode(text) {
        return new Text(text, this);
      }
    }, {
      key: "createComment",
      value: function createComment(text) {
        return new Comment(text, this);
      }
    }, {
      key: "createDocumentFragment",
      value: function createDocumentFragment() {
        return new DocumentFragment(this);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
       * @return Element with matching id attribute.
       */

    }, {
      key: "getElementById",
      value: function getElementById(id) {
        return matchChildElement(this.body, function (element) {
          return element.id === id;
        });
      }
    }]);

    return Document;
  }(Element);

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
  function initialize(document, strings, hydrateableNode, keys) {
    appendKeys(keys);
    strings.forEach(store$1);
    (hydrateableNode[4
    /* childNodes */
    ] || []).forEach(function (child) {
      return document.body.appendChild(document[64
      /* hydrateNode */
      ](strings, child));
    });
  }

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
  function wrap(target, func) {
    return function () {
      return execute(target, Promise.resolve(func.apply(null, arguments)));
    };
  }

  function execute(target, promise) {
    // Start the task.
    transfer$2(target.ownerDocument, [6
    /* LONG_TASK_START */
    , target[7
    /* index */
    ]]);
    return promise.then(function (result) {
      // Complete the task.
      transfer$2(target.ownerDocument, [7
      /* LONG_TASK_END */
      , target[7
      /* index */
      ]]);
      return result;
    }, function (reason) {
      // Complete the task.
      transfer$2(target.ownerDocument, [7
      /* LONG_TASK_END */
      , target[7
      /* index */
      ]]);
      throw reason;
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
  var WHITELISTED_GLOBALS = ['Array', 'ArrayBuffer', 'Blob', 'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean', 'Cache', 'CustomEvent', 'DataView', 'Date', 'Error', 'EvalError', 'Event', 'EventTarget', 'Float32Array', 'Float64Array', 'Function', 'Infinity', 'Int16Array', 'Int32Array', 'Int8Array', 'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TextDecoder', 'TextEncoder', 'TypeError', 'URIError', 'URL', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap', 'WeakSet', 'XMLHttpRequest', 'atob', 'btoa', 'caches', 'clearInterval', 'clearTimeout', 'console', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'eval', 'fetch', 'indexedDB', 'isFinite', 'isNaN', 'onerror', 'onrejectionhandled', 'onunhandledrejection', 'parseFloat', 'parseInt', 'performance', 'setTimeout', 'setInterval', 'undefined', 'unescape'];
  var globalScope = {
    navigator: self.navigator,
    localStorage: {},
    location: self.location,
    url: '/',
    innerWidth: 0,
    innerHeight: 0,
    initialize: initialize,
    MutationObserver: MutationObserver,
    HTMLAnchorElement: HTMLAnchorElement,
    HTMLButtonElement: HTMLButtonElement,
    HTMLDataElement: HTMLDataElement,
    HTMLEmbedElement: HTMLEmbedElement,
    HTMLFieldSetElement: HTMLFieldSetElement,
    HTMLFormElement: HTMLFormElement,
    HTMLIFrameElement: HTMLIFrameElement,
    HTMLImageElement: HTMLImageElement,
    HTMLInputElement: HTMLInputElement,
    HTMLLabelElement: HTMLLabelElement,
    HTMLLinkElement: HTMLLinkElement,
    HTMLMapElement: HTMLMapElement,
    HTMLMeterElement: HTMLMeterElement,
    HTMLModElement: HTMLModElement,
    HTMLOListElement: HTMLOListElement,
    HTMLOptionElement: HTMLOptionElement,
    HTMLProgressElement: HTMLProgressElement,
    HTMLQuoteElement: HTMLQuoteElement,
    HTMLScriptElement: HTMLScriptElement,
    HTMLSelectElement: HTMLSelectElement,
    HTMLSourceElement: HTMLSourceElement,
    HTMLStyleElement: HTMLStyleElement,
    HTMLTableCellElement: HTMLTableCellElement,
    HTMLTableColElement: HTMLTableColElement,
    HTMLTableElement: HTMLTableElement,
    HTMLTableRowElement: HTMLTableRowElement,
    HTMLTableSectionElement: HTMLTableSectionElement,
    HTMLTimeElement: HTMLTimeElement
  }; // WorkerDOM.Document.defaultView ends up being the window object.
  // React requires the classes to exist off the window object for instanceof checks.

  var workerDOM = function (postMessage) {
    var document = new Document(globalScope);
    document.postMessage = postMessage;
    document.isConnected = true;
    document.appendChild(document.body = document.createElement('body'));
    return document.defaultView;
  }(postMessage.bind(self) || function () {
    return void 0;
  });
  /**
   * Instruments relevant calls to work via LongTask API.
   * @param global
   */

  function updateLongTask(global) {
    var originalFetch = global['fetch'];

    if (originalFetch) {
      try {
        // TODO(choumx): Add origin whitelisting.
        Object.defineProperty(global, 'fetch', {
          enumerable: true,
          writable: true,
          configurable: true,
          value: wrap(workerDOM.document, originalFetch.bind(global))
        });
      } catch (e) {}
    }
  }
  /**
   * Walks up a global's prototype chain and dereferences non-whitelisted properties
   * until EventTarget is reached.
   * @param global
   */


  function updateGlobals(global) {
    function deleteUnsafe(object, property) {
      if (WHITELISTED_GLOBALS.indexOf(property) >= 0) {
        return;
      }

      try {
        delete object[property];
      } catch (e) {}
    }

    var current = global;

    while (current && current.constructor !== EventTarget) {
      Object.getOwnPropertyNames(current).forEach(function (prop) {
        return deleteUnsafe(current, prop);
      });
      current = Object.getPrototypeOf(current);
    }

    updateLongTask(global);
  }

  updateGlobals(self);

  exports.workerDOM = workerDOM;

  return exports;

}({}));
//# sourceMappingURL=unminified.worker.safe.js.map
